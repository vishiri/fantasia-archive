import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { afterEach, beforeEach, vi } from 'vitest'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'
import { FA_PROGRAM_STYLING_STORE_DEFAULTS } from 'app/src-electron/mainScripts/programStyling/faProgramStylingStoreDefaults'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'

const originalConsoleWarn = console.warn.bind(console)

const i18nLocaleRef = ref('en-US')

const FANTASIA_STORYBOOK_CANVAS_KEY = '__fantasiaStorybookCanvas'

/**
 * Mirrors 'setFantasiaStorybookCanvasFlag' from 'app/src/scripts/appInternals/rendererAppInternals'.
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

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    constructor (callback: ResizeObserverCallback) {
      void callback
    }

    disconnect (): void {}

    observe (_target: Element, _options?: unknown): void {}

    unobserve (_target: Element): void {}
  } as unknown as typeof ResizeObserver
}

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

/**
 * Minimal 'window.faContentBridgeAPIs' for Vitest runs that mount '.vue' components.
 */
function resetFaVitestRendererHarness (): void {
  setActivePinia(createPinia())
  i18nLocaleRef.value = 'en-US'

  window.faContentBridgeAPIs = {
    faWindowControl: {
      checkWindowMaximized: vi.fn(async () => false),
      closeWindow: vi.fn(async () => undefined),
      maximizeWindow: vi.fn(async () => undefined),
      minimizeWindow: vi.fn(async () => undefined),
      refreshWebContents: vi.fn(async () => undefined),
      resizeWindow: vi.fn(async () => undefined)
    },
    faDevToolsControl: {
      checkDevToolsStatus: vi.fn(async () => false),
      toggleDevTools: vi.fn(async () => undefined),
      openDevTools: vi.fn(async () => undefined),
      closeDevTools: vi.fn(async () => undefined)
    },
    faExternalLinksManager: {
      checkIfExternal: vi.fn(() => false),
      openExternal: vi.fn()
    },
    extraEnvVariables: {
      getCachedSnapshot: vi.fn(() => null),
      getSnapshot: vi.fn(async () => ({
        COMPONENT_NAME: undefined,
        COMPONENT_PROPS: undefined,
        ELECTRON_MAIN_FILEPATH: '/fake/electron-main.js',
        FA_FRONTEND_RENDER_TIMER: 0,
        TEST_ENV: undefined
      }))
    },
    appDetails: {
      getProjectVersion: vi.fn(async () => '0.0.0-unit-test')
    },
    faUserSettings: {
      getSettings: vi.fn(async () => ({ ...FA_USER_SETTINGS_DEFAULTS })),
      setSettings: vi.fn(async () => {})
    },
    faKeybinds: {
      getKeybinds: vi.fn(async () => ({
        platform: 'win32' as const,
        store: { ...FA_KEYBINDS_STORE_DEFAULTS }
      })),
      setKeybinds: vi.fn(async () => undefined)
    },
    faProgramStyling: {
      getProgramStyling: vi.fn(async () => ({ ...FA_PROGRAM_STYLING_STORE_DEFAULTS })),
      setProgramStyling: vi.fn(async () => undefined)
    },
    faProgramConfig: {
      applyImport: vi.fn(async () => ({ appliedParts: [] })),
      disposeImportSession: vi.fn(async () => undefined),
      exportToFile: vi.fn(async () => ({ outcome: 'canceled' as const })),
      prepareImport: vi.fn(async () => ({ outcome: 'canceled' as const }))
    }
  }
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(forwardVueTestUtilsWarnUnlessFiltered)
  setFantasiaStorybookCanvasFlag(false)
  resetFaVitestRendererHarness()
})

afterEach(() => {
  vi.restoreAllMocks()
})
