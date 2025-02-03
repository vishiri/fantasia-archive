import { contextBridge } from 'electron'

import { faWindowControlAPI } from 'app/src-electron/contentBridgeAPIs/faWindowControlAPI'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'
import { faDevToolsControlAPI } from 'app/src-electron/contentBridgeAPIs/faDevToolsControlAPI'
import { faExternalLinksManagerAPI } from 'app/src-electron/contentBridgeAPIs/faExternalLinksManagerAPI'
import { appDetailsAPI } from './contentBridgeAPIs/appDetailsAPI'

/*
  List of APIs to expose to the renderer process.
  Each API is exposed as a property of the 'window' object.
*/

const apiObject = {
  faWindowControl: { ...faWindowControlAPI },
  faDevToolsControl: { ...faDevToolsControlAPI },
  faExternalLinksManager: { ...faExternalLinksManagerAPI },
  extraEnvVariables: { ...extraEnvVariablesAPI },
  appDetails: { ...appDetailsAPI }
}

contextBridge.exposeInMainWorld('faContentBridgeAPIs', apiObject)
