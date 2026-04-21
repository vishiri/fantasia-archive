import type {
  I_appDetailsAPI,
  I_extraEnvVariablesBridge,
  I_faDevToolsControl,
  I_faExternalLinksManagerAPI,
  I_faWindowControlAPI
} from 'app/types/I_faElectronRendererBridgeAPIs'
import type { I_faKeybindsAPI } from 'app/types/I_faKeybindsDomain'
import type { I_faProgramStylingAPI } from 'app/types/I_faProgramStylingDomain'
import type { I_faUserSettingsAPI } from 'app/types/I_faUserSettingsDomain'

declare global{
  interface Window {
    faContentBridgeAPIs: {
      faWindowControl: I_faWindowControlAPI,
      faDevToolsControl: I_faDevToolsControl,
      faExternalLinksManager: I_faExternalLinksManagerAPI,
      extraEnvVariables: I_extraEnvVariablesBridge
      appDetails: I_appDetailsAPI
      faKeybinds: I_faKeybindsAPI
      faProgramStyling: I_faProgramStylingAPI
      faUserSettings: I_faUserSettingsAPI
    }
  }
}
