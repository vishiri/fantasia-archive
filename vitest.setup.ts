import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, vi } from 'vitest'

config.global.config = {
  compilerOptions: {
    isCustomElement: (tag: string) => {
      return /^q-/i.test(tag)
    }
  }
}

/**
 * `_data` modules and dialogs import Pinia stores at module load; provide an active Pinia
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
 * Minimal `window.faContentBridgeAPIs` for Vitest runs that mount `.vue` components.
 */
beforeEach(() => {
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
    }
  }
})
