import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, vi } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/faUserSettingsDefaults'

const originalConsoleWarn = console.warn.bind(console)

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

vi.mock('app/src/i18n/externalFileLoader', () => {
  return {
    i18n: {
      global: {
        t: (key: string) => {
          return key
        }
      }
    }
  }
})

vi.mock('@quasar/quasar-ui-qmarkdown/dist/index.css', () => ({}))

/**
 * Minimal 'window.faContentBridgeAPIs' for Vitest runs that mount '.vue' components.
 */
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    const [firstArg] = args
    const message = typeof firstArg === 'string' ? firstArg : ''
    if (
      !message.includes('[Vue warn]: Failed to resolve component: q-') &&
      !message.includes('[Vue warn]: Failed to resolve directive: close-popup') &&
      !message.includes('[Vue warn]: injection "_q_" not found.')
    ) {
      originalConsoleWarn(...args)
    }
  })

  setActivePinia(createPinia())

  window.faContentBridgeAPIs = {
    faWindowControl: {
      checkWindowMaximized: vi.fn(() => false),
      minimizeWindow: vi.fn(),
      maximizeWindow: vi.fn(),
      resizeWindow: vi.fn(),
      closeWindow: vi.fn()
    },
    faDevToolsControl: {
      checkDevToolsStatus: vi.fn(() => false),
      toggleDevTools: vi.fn(),
      openDevTools: vi.fn(),
      closeDevTools: vi.fn()
    },
    faExternalLinksManager: {
      checkIfExternal: vi.fn(() => false),
      openExternal: vi.fn()
    },
    extraEnvVariables: {
      ELECTRON_MAIN_FILEPATH: '/fake/electron-main.js',
      FA_FRONTEND_RENDER_TIMER: 0,
      TEST_ENV: undefined,
      COMPONENT_NAME: undefined,
      COMPONENT_PROPS: undefined
    },
    appDetails: {
      PROJECT_VERSION: '0.0.0-unit-test'
    },
    faUserSettings: {
      getSettings: vi.fn(async () => ({ ...FA_USER_SETTINGS_DEFAULTS })),
      setSettings: vi.fn(async () => {})
    }
  }
})

afterEach(() => {
  vi.restoreAllMocks()
})
