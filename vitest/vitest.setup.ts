import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { afterEach, beforeEach, vi } from 'vitest'

import { ensureVitestCoverageTmpDir } from './vitest.ensureCoverageTmp'
import { applyVitestDomEnvironmentCompat } from './vitest.domEnvironmentCompat'
import { createResetFaVitestRendererHarness } from './vitest.rendererBridgeHarness'

const originalConsoleWarn = console.warn.bind(console)

ensureVitestCoverageTmpDir()

const i18nLocaleRef = ref('en-US')

const FANTASIA_STORYBOOK_CANVAS_KEY = '__fantasiaStorybookCanvas'

/**
 * Mirrors 'setFantasiaStorybookCanvasFlag' from 'app/src/scripts/appInternals/appInternals_manager'.
 * Defined here so this setup file does not import that module (it pulls 'i18n' before the hoisted 'vi.mock' for externalFileLoader is safe).
 */
function setFantasiaStorybookCanvasFlag (value: boolean): void {
  if (value) {
    (globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY] = true
  } else {
    delete (globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY]
  }
}

config.global.config = {
  compilerOptions: {
    isCustomElement: (tag: string) => {
      return /^q-/i.test(tag)
    }
  }
}

/**
 * '_data' modules and dialogs import Pinia stores at module load; provide an active Pinia
 * before component Vitest files import those dependency chains.
 */
setActivePinia(createPinia())

applyVitestDomEnvironmentCompat()

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: {
      global: {
        locale: i18nLocaleRef,
        mergeLocaleMessage: vi.fn(),
        t: (key: string) => {
          return key
        },
        te: () => false
      }
    }
  }
})

vi.mock('@quasar/quasar-ui-qmarkdown/dist/index.css', () => ({}))

vi.mock('quasar', async (importOriginal) => {
  const actual = await importOriginal<typeof import('quasar')>()
  return {
    ...actual,
    Notify: {
      ...actual.Notify,
      create: vi.fn(),
      setDefaults: vi.fn()
    }
  }
})

function forwardVueTestUtilsWarnUnlessFiltered (...args: unknown[]): void {
  const [firstArg] = args
  const message = typeof firstArg === 'string' ? firstArg : ''
  if (
    !message.includes('[Vue warn]: Failed to resolve component: q-') &&
    !message.includes('[Vue warn]: Failed to resolve directive: close-popup') &&
    !message.includes('[Vue warn]: injection "_q_" not found.')
  ) {
    originalConsoleWarn(...args)
  }
}

const resetFaVitestRendererHarness = createResetFaVitestRendererHarness(i18nLocaleRef)

beforeEach(() => {
  ensureVitestCoverageTmpDir()
  vi.spyOn(console, 'warn').mockImplementation(forwardVueTestUtilsWarnUnlessFiltered)
  setFantasiaStorybookCanvasFlag(false)
  resetFaVitestRendererHarness()
})

afterEach(() => {
  vi.restoreAllMocks()
})
