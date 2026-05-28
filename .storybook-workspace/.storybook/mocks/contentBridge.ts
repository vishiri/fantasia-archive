import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'
import { FA_APP_NOTEBOARD_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appNoteboard/faAppNoteboardStoreDefaults'
import { FA_APP_STYLING_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appStyling/faAppStylingStoreDefaults'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'

import type {
  I_faAppConfigApplyInput,
  I_faAppConfigApplyResult,
  I_faAppConfigExportOptions,
  I_faAppConfigExportResult,
  I_faAppConfigPrepareResult
} from 'app/types/I_faAppConfigDomain'
import type { I_extraEnvVariablesAPI } from 'app/types/I_faElectronRendererBridgeAPIs'
import type { I_extraEnvVariablesBridge } from 'app/types/I_faElectronRendererBridgeAPIs'
import type {
  I_faProjectCreateInput,
  I_faProjectCreateResult,
  I_faProjectOpenInput,
  I_faProjectOpenResult
} from 'app/types/I_faProjectManagementDomain'

import type { T_contentBridgeScenario } from 'app/types/I_storybookWorkspaceHarness'
import type {
  I_faProjectNoteboardPatch,
  I_faProjectNoteboardRoot
} from 'app/types/I_faProjectNoteboardDomain'
import type {
  I_faProjectSettingsPatch,
  I_faProjectSettingsRoot
} from 'app/types/I_faProjectSettingsDomain'
import type {
  I_faProjectStylingPatch,
  I_faProjectStylingRoot
} from 'app/types/I_faProjectStylingDomain'

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

function duplicateStorybookProjectNoteboardRoot (
  root: I_faProjectNoteboardRoot
): I_faProjectNoteboardRoot {
  const frameFrom = root.frame
  const frame = frameFrom === null ? null : { ...frameFrom }
  return {
    frame,
    schemaVersion: root.schemaVersion,
    text: root.text
  }
}

function duplicateStorybookProjectStylingRoot (
  root: I_faProjectStylingRoot
): I_faProjectStylingRoot {
  const frameFrom = root.frame
  const frame = frameFrom === null ? null : { ...frameFrom }
  return {
    css: root.css,
    frame,
    schemaVersion: root.schemaVersion
  }
}

const baseBridge = () => {
  let storybookProjectNoteboardRoot: I_faProjectNoteboardRoot = {
    frame: null,
    schemaVersion: 1,
    text: ''
  }

  const getProjectNoteboard = async (): Promise<I_faProjectNoteboardRoot> => {
    return duplicateStorybookProjectNoteboardRoot(storybookProjectNoteboardRoot)
  }

  const setProjectNoteboard = async (patch: I_faProjectNoteboardPatch): Promise<boolean> => {
    let next = storybookProjectNoteboardRoot
    if (patch.text !== undefined) {
      next = {
        ...next,
        text: patch.text
      }
    }
    if (patch.frame !== undefined) {
      next = {
        ...next,
        frame: patch.frame === null ? null : { ...patch.frame }
      }
    }
    storybookProjectNoteboardRoot = next
    return true
  }

  let storybookProjectStylingRoot: I_faProjectStylingRoot = {
    css: '',
    frame: null,
    schemaVersion: 1
  }

  const getProjectStyling = async (): Promise<I_faProjectStylingRoot> => {
    return duplicateStorybookProjectStylingRoot(storybookProjectStylingRoot)
  }

  const setProjectStyling = async (patch: I_faProjectStylingPatch): Promise<boolean> => {
    let next = storybookProjectStylingRoot
    if (patch.css !== undefined) {
      next = {
        ...next,
        css: patch.css
      }
    }
    if (patch.frame !== undefined) {
      next = {
        ...next,
        frame: patch.frame === null ? null : { ...patch.frame }
      }
    }
    storybookProjectStylingRoot = next
    return true
  }

  let storybookProjectSettingsRoot: I_faProjectSettingsRoot = {
    projectName: 'Storybook Sample Project',
    schemaVersion: 1
  }

  const getProjectSettings = async (): Promise<I_faProjectSettingsRoot> => {
    return {
      ...storybookProjectSettingsRoot
    }
  }

  const setProjectSettings = async (patch: I_faProjectSettingsPatch): Promise<boolean> => {
    if (patch.projectName !== undefined) {
      storybookProjectSettingsRoot = {
        ...storybookProjectSettingsRoot,
        projectName: patch.projectName
      }
    }
    return true
  }

  return {
    faWindowControl: {
      checkWindowMaximized: async () => false,
      closeWindow: async () => undefined,
      maximizeWindow: async () => undefined,
      minimizeWindow: async () => undefined,
      refreshWebContents: async () => undefined,
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
    },
    faKeybinds: {
      getKeybinds: async () => ({
        platform: 'win32' as const,
        store: { ...FA_KEYBINDS_STORE_DEFAULTS }
      }),
      setKeybinds: async () => undefined
    },
    faAppStyling: {
      getAppStyling: async () => ({ ...FA_APP_STYLING_STORE_DEFAULTS }),
      setAppStyling: async () => undefined
    },
    faAppNoteboard: {
      getNoteboard: async () => ({ ...FA_APP_NOTEBOARD_STORE_DEFAULTS }),
      setNoteboard: async () => undefined
    },
    faAppConfig: {
      applyImport: async (_input: I_faAppConfigApplyInput): Promise<I_faAppConfigApplyResult> => ({
        appliedParts: []
      }),
      disposeImportSession: async (_sessionId: string): Promise<void> => {
        await Promise.resolve()
      },
      exportToFile: async (_options: I_faAppConfigExportOptions): Promise<I_faAppConfigExportResult> => ({
        outcome: 'canceled'
      }),
      prepareImport: async (): Promise<I_faAppConfigPrepareResult> => ({
        outcome: 'ready',
        parts: {
          appNoteboard: 'ok',
          appSettings: 'ok',
          appStyling: 'ok',
          keybinds: 'ok'
        },
        sessionId: 'storybook-import-session'
      })
    },
    faProjectFailsafe: {
      installActiveProjectPathReply: () => undefined
    },
    faProjectOsOpen: {
      installOsOpenListener: () => undefined,
      sendRendererReady: () => undefined
    },
    projectManagement: {
      createProject: async (_input: I_faProjectCreateInput): Promise<I_faProjectCreateResult> => ({
        outcome: 'canceled'
      }),
      getProjectNoteboard,
      getProjectSettings,
      getProjectStyling,
      getRecentProjects: async () => [],
      resolveRecentProjectMruHeadForOpen: async () => ({ outcome: 'empty' as const }),
      openProject: async (_input?: I_faProjectOpenInput): Promise<I_faProjectOpenResult> => ({
        outcome: 'canceled'
      }),
      setProjectNoteboard,
      setProjectSettings,
      setProjectStyling
    }
  }
}

const scenarioMutations: Record<T_contentBridgeScenario, (bridge: ReturnType<typeof baseBridge>) => void> = {
  default: () => undefined,
  windowMaximized: (bridge) => {
    bridge.faWindowControl.checkWindowMaximized = async () => true
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
    },
    faKeybinds: {
      ...nextBridge.faKeybinds,
      ...(overrides.faKeybinds ?? {})
    },
    faAppStyling: {
      ...nextBridge.faAppStyling,
      ...(overrides.faAppStyling ?? {})
    },
    faAppNoteboard: {
      ...nextBridge.faAppNoteboard,
      ...(overrides.faAppNoteboard ?? {})
    },
    faAppConfig: {
      ...nextBridge.faAppConfig,
      ...(overrides.faAppConfig ?? {})
    },
    faProjectFailsafe: {
      ...nextBridge.faProjectFailsafe,
      ...(overrides.faProjectFailsafe ?? {})
    },
    faProjectOsOpen: {
      ...nextBridge.faProjectOsOpen,
      ...(overrides.faProjectOsOpen ?? {})
    },
    projectManagement: {
      ...nextBridge.projectManagement,
      ...(overrides.projectManagement ?? {})
    }
  }
}
