import { I_extraEnvVariablesAPI } from 'app/types/I_extraEnvVariablesAPI'
import { I_faWindowControlAPI } from 'app/types/I_faWindowControlAPI'
import { I_faExternalLinksManagerAPI } from 'app/types/I_faExternalLinksManagerAPI'
import { I_faDevToolsControl } from 'app/types/I_faDevToolsControl'
import { I_appDetailsAPI } from 'app/types/I_appDetailsAPI'

declare global{
  interface Window {
    faWindowControlAPI: I_faWindowControlAPI,
    faDevToolsControlAPI: I_faDevToolsControl,
    faExternalLinksManagerAPI: I_faExternalLinksManagerAPI,
    extraEnvVariables: I_extraEnvVariablesAPI
    appDetails: I_appDetailsAPI
  }
}
