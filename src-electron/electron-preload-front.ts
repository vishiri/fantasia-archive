import { faWindowControlAPI } from 'app/src-electron/customContentBridgeAPIs/faWindowControlAPI-front.ts'
import { extraEnvVariablesAPI } from 'app/src-electron/customContentBridgeAPIs/extraEnvVariablesAPI-front.ts'
import { faDevToolsControlAPI } from 'app/src-electron/customContentBridgeAPIs/faDevToolsControlAPI-front.ts'
import { faExternalLinksManagerAPI } from 'app/src-electron/customContentBridgeAPIs/faExternalLinksManagerAPI-front.ts'
import { faServerControlAPI } from 'app/src-electron/customContentBridgeAPIs/faServerControlAPI-front.ts'
import { contextBridge } from "app/electron-polyfill/contextBridge";

contextBridge.exposeInMainWorld('faWindowControlAPI', faWindowControlAPI)
contextBridge.exposeInMainWorld('faDevToolsControlAPI', faDevToolsControlAPI)
contextBridge.exposeInMainWorld('faExternalLinksManagerAPI', faExternalLinksManagerAPI)
contextBridge.exposeInMainWorld('extraEnvVariables', extraEnvVariablesAPI)
contextBridge.exposeInMainWorld('faServerControl', faServerControlAPI)
