/*
 * Sandboxed renderer preload: keep imports to 'electron', 'contentBridgeAPIs' modules, the shared
 * IPC registry ('electron-ipc-bridge'), pure TypeScript helpers, and type-only imports. Do not add
 * filesystem, 'shell', or other Node APIs here; delegate those to main via 'register*Ipc' handlers
 * and 'ipcRenderer.invoke' from 'contentBridgeAPIs'. See Electron Process Sandboxing tutorial and
 * '.cursor/rules/electron-preload.mdc'.
 */
import { contextBridge } from 'electron'

import { faWindowControlAPI } from 'app/src-electron/contentBridgeAPIs/faWindowControlAPI'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'
import { faDevToolsControlAPI } from 'app/src-electron/contentBridgeAPIs/faDevToolsControlAPI'
import { faExternalLinksManagerAPI } from 'app/src-electron/contentBridgeAPIs/faExternalLinksManagementAPI'
import { appDetailsAPI } from './contentBridgeAPIs/appDetailsAPI'
import { faKeybindsAPI } from 'app/src-electron/contentBridgeAPIs/faKeybindsAPI'
import { faAppNoteboardAPI } from 'app/src-electron/contentBridgeAPIs/faAppNoteboardAPI'
import { faAppStylingAPI } from 'app/src-electron/contentBridgeAPIs/faAppStylingAPI'
import { faAppConfigAPI } from 'app/src-electron/contentBridgeAPIs/faAppConfigAPI'
import { faProjectFailsafeAPI } from 'app/src-electron/contentBridgeAPIs/faProjectFailsafeAPI'
import { faProjectOsOpenAPI } from 'app/src-electron/contentBridgeAPIs/faProjectOsOpenAPI'
import { faUserSettingsAPI } from './contentBridgeAPIs/faUserSettingsAPI'
import { projectManagementAPI } from 'app/src-electron/contentBridgeAPIs/projectManagementAPI'

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
  faKeybinds: { ...faKeybindsAPI },
  faAppNoteboard: { ...faAppNoteboardAPI },
  faAppStyling: { ...faAppStylingAPI },
  faUserSettings: { ...faUserSettingsAPI },
  faAppConfig: { ...faAppConfigAPI },
  faProjectFailsafe: { ...faProjectFailsafeAPI },
  faProjectOsOpen: { ...faProjectOsOpenAPI },
  projectManagement: { ...projectManagementAPI }
}

contextBridge.exposeInMainWorld('faContentBridgeAPIs', apiObject)
