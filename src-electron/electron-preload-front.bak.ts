/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.ts you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */

import { faWindowControlAPI } from '../../../src-electron/customContentBridgeAPIs/faWindowControlAPI'
import { extraEnvVariablesAPI } from '../../../src-electron/customContentBridgeAPIs/extraEnvVariablesAPI'
import { faDevToolsControlAPI } from '../../../src-electron/customContentBridgeAPIs/faDevToolsControlAPI'
import { faExternalLinksManagerAPI } from '../../../src-electron/customContentBridgeAPIs/faExternalLinksManagerAPI'

declare global{
    interface Window { faWindowControlAPI: object; faDevToolsControlAPI: object; faExternalLinksManagerAPI: object; extraEnvVariablesAPI: object; }
}

window.faWindowControl = faWindowControlAPI
window.faDevToolsControl = faDevToolsControlAPI
window.faExternalLinksManager = faExternalLinksManagerAPI
window.extraEnvVariables = extraEnvVariablesAPI
