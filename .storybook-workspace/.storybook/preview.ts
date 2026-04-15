import 'quasar/src/css/index.sass'
import '@quasar/extras/roboto-font-latin-ext/roboto-font-latin-ext.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/mdi-v5/mdi-v5.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
import '@quasar/quasar-ui-qmarkdown/dist/index.css'
import 'src/css/app.scss'

import { setup } from '@storybook/vue3-vite'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import type { Plugin } from 'vue'
import * as QuasarAll from 'quasar'
import { ClosePopup, Dark, Dialog, Notify, Quasar, Ripple } from 'quasar'
import QMarkdownPlugin from '@quasar/quasar-ui-qmarkdown'

import type { Preview } from '@storybook/vue3-vite'
import type { QuasarPluginOptions } from 'quasar'
import { setFantasiaStorybookCanvasFlag } from 'app/src/scripts/appInternals/rendererAppInternals'

import { setContentBridgeScenario } from './mocks/contentBridge'
import { getStorybookI18nMessages, setI18nScenario } from './mocks/externalFileLoader'
import {
  FANTASIA_STORYBOOK_DEFAULT_VIEWPORT,
  FANTASIA_STORYBOOK_VIEWPORT_OPTIONS
} from './viewportBreakpoints'

const storybookPinia = createPinia()
setActivePinia(storybookPinia)
const STORYBOOK_SCROLL_FIX_ID = 'fa-storybook-scroll-fix'

/**
 * Quasar only auto-registers components when 'components' is passed to 'app.use(Quasar, opts)'.
 * Without it, tags like 'q-btn' stay unresolved and slot trees (e.g. 'q-menu' / 'q-list') flatten into raw text in the canvas.
 */
const quasarComponentsForStorybook = (): QuasarPluginOptions['components'] => {
  const out: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(QuasarAll)) {
    if (!/^Q[A-Z]/.test(key) || key.endsWith('Mixin')) {
      continue
    }

    if (
      value !== null &&
      typeof value === 'object' &&
      'name' in value &&
      typeof (value as { name: unknown }).name === 'string'
    ) {
      out[key] = value
    }
  }

  return out as QuasarPluginOptions['components']
}

const SCROLL_FIX_CLASS = 'fa-storybook-scroll-override'

const ensureStorybookScrollFix = () => {
  /**
   * Project 'htmlAdjustments.scss' sets 'html, body { overflow: hidden !important; }' for Electron.
   * Storybook Docs needs a higher-specificity, end-of-head override so long doc pages scroll.
   * Re-append on each run so we stay after Vite-injected CSS order/HMR.
   */
  let styleTag = document.getElementById(STORYBOOK_SCROLL_FIX_ID) as HTMLStyleElement | null
  if (styleTag === null) {
    styleTag = document.createElement('style')
    styleTag.id = STORYBOOK_SCROLL_FIX_ID
    styleTag.textContent = `
      html.${SCROLL_FIX_CLASS},
      html.${SCROLL_FIX_CLASS} body {
        overflow: auto !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
      }

      html.${SCROLL_FIX_CLASS} #root,
      html.${SCROLL_FIX_CLASS} #storybook-root,
      html.${SCROLL_FIX_CLASS} #docs-root {
        overflow: visible !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
      }

      html.${SCROLL_FIX_CLASS} .sb-show-main,
      html.${SCROLL_FIX_CLASS} .sb-main-padded,
      html.${SCROLL_FIX_CLASS} main {
        overflow: visible !important;
        min-height: 0 !important;
        max-height: none !important;
      }

      html.${SCROLL_FIX_CLASS} .sbdocs,
      html.${SCROLL_FIX_CLASS} .sbdocs-wrapper,
      html.${SCROLL_FIX_CLASS} .sbdocs-content {
        overflow: visible !important;
        max-height: none !important;
      }
    `
  }

  document.documentElement.classList.add(SCROLL_FIX_CLASS)
  document.head.appendChild(styleTag)
}

const storybookI18n = createI18n({
  locale: 'en-US',
  fallbackLocale: 'en-US',
  legacy: false,
  warnHtmlMessage: false,
  messages: {
    'en-US': getStorybookI18nMessages()
  }
})

setup((app) => {
  ensureStorybookScrollFix()

  /**
   * The preview iframe may not expose '#storybook-root' on the first frame, and static builds can
   * omit a reliable 'process.env.MODE' value. Mark the canvas explicitly so helpers like
   * 'isFantasiaStorybookCanvas()' match production Storybook while MainLayout still hides chrome.
   */
  setFantasiaStorybookCanvasFlag(true)

  app.use(storybookPinia)
  app.use(storybookI18n)
  // Match Quasar CLI order: framework first, then QMarkdown boot-equivalent plugin.
  app.use(Quasar, {
    components: quasarComponentsForStorybook(),
    directives: {
      ClosePopup,
      Ripple
    },
    plugins: {
      Dark,
      Dialog,
      Notify
    },
    config: {
      ripple: false,
      dark: true
    }
  })
  app.use(QMarkdownPlugin as unknown as Plugin)

  if (typeof document !== 'undefined') {
    document.body.classList.add('body--dark')
    Dark.set(true)
  }
})

if (typeof document !== 'undefined') {
  ensureStorybookScrollFix()
}

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      sort: 'requiredFirst',
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    actions: {
      argTypesRegex: '^on[A-Z].*'
    },
    backgrounds: {
      options: {
        dark_app: {
          name: 'dark app',
          value: '#121212'
        },
        paper: {
          name: 'paper',
          value: '#f4f4f4'
        }
      }
    },
    viewport: {
      options: FANTASIA_STORYBOOK_VIEWPORT_OPTIONS
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: false
          }
        ]
      }
    },
    docs: {
      controls: {
        sort: 'requiredFirst'
      }
    }
  },

  decorators: [
    (story, context) => {
      ensureStorybookScrollFix()

      if (typeof document !== 'undefined') {
        document.body.classList.add('body--dark')
        Dark.set(true)
      }

      setContentBridgeScenario(
        context.parameters.contentBridgeScenario ?? 'default',
        context.parameters.contentBridgeOverrides ?? {}
      )
      setI18nScenario(context.parameters.i18nScenario ?? 'default')
      storybookI18n.global.setLocaleMessage('en-US', getStorybookI18nMessages())

      return {
        components: { story },
        template: '<story />'
      }
    }
  ],

  initialGlobals: {
    viewport: {
      value: FANTASIA_STORYBOOK_DEFAULT_VIEWPORT,
      isRotated: false
    },

    backgrounds: {
      value: 'dark_app'
    }
  }
}

export default preview
