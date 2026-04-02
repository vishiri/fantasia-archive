import { BrowserWindow, ipcMain } from 'electron'

import { FA_DEVTOOLS_IPC } from 'app/src-electron/devToolsIpcChannels'

let registered = false

function mainAppBrowserWindow (): BrowserWindow | undefined {
  return (
    BrowserWindow.getFocusedWindow() ??
    BrowserWindow.getAllWindows().find((w) => w.isVisible()) ??
    BrowserWindow.getAllWindows()[0]
  )
}

/**
 * Wires synchronous IPC handlers so preload can toggle/query DevTools without `@electron/remote`
 * `getCurrentWindow()` (unreliable from isolated preload). Resolves the window at call time via
 * `BrowserWindow` so bundled main code never relies on a possibly stale `appWindow` re-export.
 */
export function registerFaDevToolsIpc (): void {
  if (registered) {
    return
  }
  registered = true

  ipcMain.on(FA_DEVTOOLS_IPC.statusSync, (event) => {
    const w = mainAppBrowserWindow()
    event.returnValue = w?.webContents.isDevToolsOpened() ?? false
  })

  ipcMain.on(FA_DEVTOOLS_IPC.toggleSync, (event) => {
    const w = mainAppBrowserWindow()
    if (w === undefined) {
      event.returnValue = false
      return
    }
    const wc = w.webContents
    if (wc.isDevToolsOpened()) {
      wc.closeDevTools()
    } else {
      wc.openDevTools()
    }
    event.returnValue = wc.isDevToolsOpened()
  })

  ipcMain.on(FA_DEVTOOLS_IPC.openSync, (event) => {
    const w = mainAppBrowserWindow()
    if (w === undefined) {
      event.returnValue = false
      return
    }
    w.webContents.openDevTools()
    event.returnValue = w.webContents.isDevToolsOpened()
  })

  ipcMain.on(FA_DEVTOOLS_IPC.closeSync, (event) => {
    const w = mainAppBrowserWindow()
    if (w === undefined) {
      event.returnValue = false
      return
    }
    w.webContents.closeDevTools()
    event.returnValue = w.webContents.isDevToolsOpened()
  })
}
