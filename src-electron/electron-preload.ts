/*
 * Sandboxed renderer preload: keep imports to 'electron', 'contentBridgeAPIs' modules, the shared
 * IPC registry ('electron-ipc-bridge'), pure TypeScript helpers, and type-only imports. Do not add
 * filesystem, 'shell', or other Node APIs here; delegate those to main via 'register*Ipc' handlers.
 * See Electron Process Sandboxing tutorial and '.cursor/rules/electron-preload.mdc'.
 */
import { contextBridge } from 'electron'

import { faWindowControlAPI } from 'app/src-electron/contentBridgeAPIs/faWindowControlAPI'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'
import { faDevToolsControlAPI } from 'app/src-electron/contentBridgeAPIs/faDevToolsControlAPI'
import { faExternalLinksManagerAPI } from 'app/src-electron/contentBridgeAPIs/faExternalLinksManagerAPI'
import { appDetailsAPI } from './contentBridgeAPIs/appDetailsAPI'
import { faUserSettingsAPI } from './contentBridgeAPIs/faUserSettingsAPI'

/*
  List of APIs to expose to the renderer process.
  Each API is exposed as a property of the 'window' object.
*/

const apiObject = {
  faWindowControl: { ...faWindowControlAPI },
  faDevToolsControl: { ...faDevToolsControlAPI },
  faExternalLinksManager: { ...faExternalLinksManagerAPI },
  extraEnvVariables: { ...extraEnvVariablesAPI },
  appDetails: { ...appDetailsAPI },
  faUserSettings: { ...faUserSettingsAPI }
}

contextBridge.exposeInMainWorld('faContentBridgeAPIs', apiObject)
