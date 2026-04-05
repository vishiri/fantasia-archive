import type { T_contentBridgeScenario } from './contentBridge.types'

const baseBridge = () => ({
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
})

const scenarioMutations: Record<T_contentBridgeScenario, (bridge: ReturnType<typeof baseBridge>) => void> = {
  default: () => undefined,
  windowMaximized: (bridge) => {
    bridge.faWindowControl.checkWindowMaximized = () => true
  },
  devToolsOpen: (bridge) => {
    bridge.faDevToolsControl.checkDevToolsStatus = () => true
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
    extraEnvVariables: {
      ...nextBridge.extraEnvVariables,
      ...(overrides.extraEnvVariables ?? {})
    },
    appDetails: {
      ...nextBridge.appDetails,
      ...(overrides.appDetails ?? {})
    }
  }
}
