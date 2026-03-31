import 'quasar/src/css/index.sass'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/mdi-v5/mdi-v5.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
import 'src/css/app.scss'

import { setup } from '@storybook/vue3'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { Dialog, Notify, Quasar } from 'quasar'

import type { Preview } from '@storybook/vue3'

const storybookMessages = {
  'en-US': {
    Dialogs: {
      aboutFantasiaArchive: {
        title: 'About Fantasia Archive',
        versionTitle: 'Version:'
      }
    },
    GlobalWindowButtons: {
      minimizeButton: 'Minimize',
      resizeButton: 'Restore',
      maximizeButton: 'Maximize',
      close: 'Close'
    },
    documents: {
      advancedSearchCheatSheet: '# Advanced Search Cheat Sheet\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae lorem vel massa efficitur volutpat.',
      advancedSearchGuide: '# Advanced Search Guide\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tincidunt orci at justo semper, in fermentum neque finibus.',
      changeLog: '# Changelog\n\n- Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n- Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      license: '# License\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Duis aute irure dolor in reprehenderit.',
      tipsTricksTrivia: '# Tips, Tricks & Trivia\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam.'
    }
  }
}

const storybookPinia = createPinia()
setActivePinia(storybookPinia)

setup((app) => {
  app.use(storybookPinia)

  const i18n = createI18n({
    locale: 'en-US',
    fallbackLocale: 'en-US',
    legacy: false,
    warnHtmlMessage: false,
    messages: storybookMessages
  })

  app.use(i18n)
  app.use(Quasar, {
    plugins: {
      Dialog,
      Notify
    },
    config: {
      ripple: false,
      dark: true
    }
  })
})

const preview: Preview = {
  decorators: [
    (story) => {
      window.faContentBridgeAPIs = {
        faWindowControl: {
          checkWindowMaximized: () => false,
          minimizeWindow: () => undefined,
          maximizeWindow: () => undefined,
          resizeWindow: () => undefined,
          closeWindow: () => undefined
        },
        faDevToolsControl: {
          checkDevToolsStatus: () => false,
          toggleDevTools: () => undefined,
          openDevTools: () => undefined,
          closeDevTools: () => undefined
        },
        faExternalLinksManager: {
          checkIfExternal: () => false,
          openExternal: () => undefined
        },
        extraEnvVariables: {
          ELECTRON_MAIN_FILEPATH: '/storybook/electron-main.js',
          FA_FRONTEND_RENDER_TIMER: 0,
          TEST_ENV: undefined,
          COMPONENT_NAME: undefined,
          COMPONENT_PROPS: undefined
        },
        appDetails: {
          PROJECT_VERSION: '0.0.0-storybook'
        }
      }

      return {
        components: { story },
        template: '<story />'
      }
    }
  ]
}

export default preview
