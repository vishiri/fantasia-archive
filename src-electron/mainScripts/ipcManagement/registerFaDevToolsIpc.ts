import { ipcMain } from 'electron'

import { FA_DEVTOOLS_IPC } from 'app/src-electron/electron-ipc-bridge'
import { windowFromIpcEvent } from 'app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc'

let registered = false

/**
 * Wires async IPC handlers so preload can toggle/query DevTools without '@electron/remote'
 * 'getCurrentWindow()' (unreliable from isolated preload). Resolves the window from the IPC
 * sender so behavior stays tied to the correct 'BrowserWindow'.
 */
export function registerFaDevToolsIpc (): void {
  if (registered) {
    return
  }
  registered = true

  ipcMain.handle(FA_DEVTOOLS_IPC.statusAsync, (event) => {
    const w = windowFromIpcEvent(event)

    return w?.webContents.isDevToolsOpened() ?? false
  })

  ipcMain.handle(FA_DEVTOOLS_IPC.toggleAsync, (event) => {
    const w = windowFromIpcEvent(event)
    if (w === undefined) {
      return false
    }
    const wc = w.webContents
    if (wc.isDevToolsOpened()) {
      wc.closeDevTools()
    } else {
      wc.openDevTools()
    }

    return wc.isDevToolsOpened()
  })

  ipcMain.handle(FA_DEVTOOLS_IPC.openAsync, (event) => {
    const w = windowFromIpcEvent(event)
    if (w === undefined) {
      return false
    }
    w.webContents.openDevTools()

    return w.webContents.isDevToolsOpened()
  })

  ipcMain.handle(FA_DEVTOOLS_IPC.closeAsync, (event) => {
    const w = windowFromIpcEvent(event)
    if (w === undefined) {
      return false
    }
    w.webContents.closeDevTools()

    return w.webContents.isDevToolsOpened()
  })
}
