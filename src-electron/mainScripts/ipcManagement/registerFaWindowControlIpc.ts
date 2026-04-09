import { BrowserWindow, ipcMain } from 'electron'
import type { IpcMainEvent } from 'electron'

import { FA_WINDOW_CONTROL_IPC } from 'app/src-electron/electron-ipc-bridge'

let registered = false

/**
 * Resolves the 'BrowserWindow' that owns the preload/renderer that issued the sync IPC call.
 * Avoids 'getFocusedWindow()' heuristics when native menus or other surfaces steal OS focus.
 */
export function windowFromIpcEvent (event: IpcMainEvent): BrowserWindow | undefined {
  return BrowserWindow.fromWebContents(event.sender) ?? undefined
}

/**
 * Registers synchronous IPC handlers for frameless window chrome (minimize, maximize, close).
 * Safe to call once from 'startApp'; subsequent calls no-op.
 */
export function registerFaWindowControlIpc (): void {
  if (registered) {
    return
  }
  registered = true

  ipcMain.on(FA_WINDOW_CONTROL_IPC.checkMaximizedSync, (event) => {
    const w = windowFromIpcEvent(event)
    event.returnValue = w?.isMaximized() ?? false
  })

  ipcMain.on(FA_WINDOW_CONTROL_IPC.minimizeSync, (event) => {
    const w = windowFromIpcEvent(event)
    w?.minimize()
    event.returnValue = null
  })

  ipcMain.on(FA_WINDOW_CONTROL_IPC.maximizeSync, (event) => {
    const w = windowFromIpcEvent(event)
    w?.maximize()
    event.returnValue = null
  })

  ipcMain.on(FA_WINDOW_CONTROL_IPC.resizeToggleSync, (event) => {
    const w = windowFromIpcEvent(event)
    if (w === undefined) {
      event.returnValue = null
      return
    }
    if (w.isMaximized()) {
      w.unmaximize()
    } else {
      w.maximize()
    }
    event.returnValue = null
  })

  ipcMain.on(FA_WINDOW_CONTROL_IPC.closeSync, (event) => {
    const w = windowFromIpcEvent(event)
    w?.close()
    event.returnValue = null
  })
}
