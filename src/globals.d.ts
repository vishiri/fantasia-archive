import type { I_extraEnvVariablesAPI } from 'app/types/I_extraEnvVariablesAPI'
import type { I_faWindowControlAPI } from 'app/types/I_faWindowControlAPI'
import type { I_faExternalLinksManagerAPI } from 'app/types/I_faExternalLinksManagerAPI'
import type { I_faDevToolsControl } from 'app/types/I_faDevToolsControl'
import type { I_appDetailsAPI } from 'app/types/I_appDetailsAPI'
import type { I_faUserSettingsAPI } from 'app/types/I_faUserSettingsAPI'

declare global{
  interface Window {
    faContentBridgeAPIs: {
      faWindowControl: I_faWindowControlAPI,
      faDevToolsControl: I_faDevToolsControl,
      faExternalLinksManager: I_faExternalLinksManagerAPI,
      extraEnvVariables: I_extraEnvVariablesAPI
      appDetails: I_appDetailsAPI
      faUserSettings: I_faUserSettingsAPI
    }
  }
}
