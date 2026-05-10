import type {
  I_appDetailsAPI,
  I_extraEnvVariablesBridge,
  I_faDevToolsControl,
  I_faExternalLinksManagerAPI,
  I_faWindowControlAPI
} from 'app/types/I_faElectronRendererBridgeAPIs'
import type { I_faKeybindsAPI } from 'app/types/I_faKeybindsDomain'
import type { I_faAppNoteboardAPI } from 'app/types/I_faAppNoteboardDomain'
import type { I_faAppStylingAPI } from 'app/types/I_faAppStylingDomain'
import type { I_faAppConfigAPI } from 'app/types/I_faAppConfigDomain'
import type { I_faUserSettingsAPI } from 'app/types/I_faUserSettingsDomain'
import type { I_faProjectManagementAPI } from 'app/types/I_faProjectManagementDomain'
import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'

declare global{
  interface Window {
    /**
     * E2E-only: Pinia active project snapshot for Playwright page.evaluate (installed when TEST_ENV is 'e2e').
     */
    __faE2eGetActiveProjectSnapshot?: () => I_faActiveProject | null
    faContentBridgeAPIs: {
      faWindowControl: I_faWindowControlAPI,
      faDevToolsControl: I_faDevToolsControl,
      faExternalLinksManager: I_faExternalLinksManagerAPI,
      extraEnvVariables: I_extraEnvVariablesBridge,
      appDetails: I_appDetailsAPI,
      faKeybinds: I_faKeybindsAPI,
      faAppNoteboard: I_faAppNoteboardAPI,
      faAppStyling: I_faAppStylingAPI,
      faUserSettings: I_faUserSettingsAPI,
      faAppConfig: I_faAppConfigAPI,
      projectManagement: I_faProjectManagementAPI
    }
  }
}
