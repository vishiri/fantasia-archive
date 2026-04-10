import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'

import type { I_extraEnvVariablesAPI } from 'app/types/I_extraEnvVariablesAPI'
import type { I_extraEnvVariablesBridge } from 'app/types/I_extraEnvVariablesAPI'

import type { T_contentBridgeScenario } from './contentBridge.types'

const defaultExtraEnvSnapshot: I_extraEnvVariablesAPI = {
  COMPONENT_NAME: undefined,
  COMPONENT_PROPS: undefined,
  ELECTRON_MAIN_FILEPATH: '/storybook/electron-main.js',
  FA_FRONTEND_RENDER_TIMER: 0,
  TEST_ENV: undefined
}

function resolveExtraEnvVariables (
  override: (Partial<I_extraEnvVariablesBridge> & Partial<I_extraEnvVariablesAPI>) | undefined
): I_extraEnvVariablesBridge {
  if (override?.getSnapshot !== undefined) {
    return {
      getCachedSnapshot: override.getCachedSnapshot ?? (() => null),
      getSnapshot: override.getSnapshot
    }
  }

  const snap: I_extraEnvVariablesAPI = {
    ...defaultExtraEnvSnapshot,
    ...override
  }

  return {
    getCachedSnapshot: () => snap,
    getSnapshot: async () => snap
  }
}

const baseBridge = () => ({
  faWindowControl: {
    checkWindowMaximized: async () => false,
    closeWindow: async () => undefined,
    maximizeWindow: async () => undefined,
    minimizeWindow: async () => undefined,
    resizeWindow: async () => undefined
  },
  faDevToolsControl: {
    checkDevToolsStatus: async () => false,
    closeDevTools: async () => undefined,
    openDevTools: async () => undefined,
    toggleDevTools: async () => undefined
  },
  faExternalLinksManager: {
    checkIfExternal: () => false,
    openExternal: () => undefined
  },
  extraEnvVariables: resolveExtraEnvVariables(undefined),
  appDetails: {
    getProjectVersion: async () => '0.0.0-storybook'
  },
  faUserSettings: {
    getSettings: async () => ({ ...FA_USER_SETTINGS_DEFAULTS }),
    setSettings: async () => undefined
  }
})

const scenarioMutations: Record<T_contentBridgeScenario, (bridge: ReturnType<typeof baseBridge>) => void> = {
  default: () => undefined,
  windowMaximized: (bridge) => {
    bridge.faWindowControl.checkWindowMaximized = async () => true
  },
  devToolsOpen: (bridge) => {
    bridge.faDevToolsControl.checkDevToolsStatus = async () => true
  },
  externalLinkFailure: (bridge) => {
    bridge.faExternalLinksManager.openExternal = () => {
      throw new Error('Storybook simulated external link failure')
    }
  }
}

export const setContentBridgeScenario = (
  scenario: T_contentBridgeScenario = 'default',
  overrides: Partial<Window['faContentBridgeAPIs']> = {}
) => {
  const nextBridge = baseBridge()
  scenarioMutations[scenario](nextBridge)

  window.faContentBridgeAPIs = {
    ...nextBridge,
    ...overrides,
    faWindowControl: {
      ...nextBridge.faWindowControl,
      ...(overrides.faWindowControl ?? {})
    },
    faDevToolsControl: {
      ...nextBridge.faDevToolsControl,
      ...(overrides.faDevToolsControl ?? {})
    },
    faExternalLinksManager: {
      ...nextBridge.faExternalLinksManager,
      ...(overrides.faExternalLinksManager ?? {})
    },
    extraEnvVariables: overrides.extraEnvVariables !== undefined
      ? resolveExtraEnvVariables(
        overrides.extraEnvVariables as (Partial<I_extraEnvVariablesBridge> & Partial<I_extraEnvVariablesAPI>)
      )
      : nextBridge.extraEnvVariables,
    appDetails: {
      ...nextBridge.appDetails,
      ...(overrides.appDetails ?? {})
    },
    faUserSettings: {
      ...nextBridge.faUserSettings,
      ...(overrides.faUserSettings ?? {})
    }
  }
}
