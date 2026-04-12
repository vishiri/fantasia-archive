import { BrowserWindow, ipcMain } from 'electron'
import type { IpcMainEvent, IpcMainInvokeEvent, Rectangle } from 'electron'

import { FA_WINDOW_CONTROL_IPC } from 'app/src-electron/electron-ipc-bridge'

let registered = false

/**
 * Bounds to re-apply after unmaximize when toggling from the custom chrome.
 * Electron frameless windows (especially with useContentSize) can leave unmaximize()
 * at the maximized size on Windows; capturing getBounds() before maximize fixes restore.
 */
const pendingRestoreBoundsByWindowId = new Map<number, Rectangle>()

function rememberBoundsBeforeMaximize (w: BrowserWindow): void {
  pendingRestoreBoundsByWindowId.set(w.id, w.getBounds())
}

function applyPendingRestoreBounds (w: BrowserWindow): void {
  const bounds = pendingRestoreBoundsByWindowId.get(w.id)
  if (bounds === undefined) {
    return
  }
  pendingRestoreBoundsByWindowId.delete(w.id)
  w.setBounds(bounds)
}

/**
 * Resolves the 'BrowserWindow' that owns the preload/renderer that issued the IPC call.
 * Avoids 'getFocusedWindow()' heuristics when native menus or other surfaces steal OS focus.
 */
export function windowFromIpcEvent (event: IpcMainEvent | IpcMainInvokeEvent): BrowserWindow | undefined {
  return BrowserWindow.fromWebContents(event.sender) ?? undefined
}

/**
 * Registers async IPC handlers for frameless window chrome (minimize, maximize, close).
 * Safe to call once from 'startApp'; subsequent calls no-op.
 */
export function registerFaWindowControlIpc (): void {
  if (registered) {
    return
  }
  registered = true

  ipcMain.handle(FA_WINDOW_CONTROL_IPC.checkMaximizedAsync, (event) => {
    const w = windowFromIpcEvent(event)

    return w?.isMaximized() ?? false
  })

  ipcMain.handle(FA_WINDOW_CONTROL_IPC.minimizeAsync, (event) => {
    const w = windowFromIpcEvent(event)
    w?.minimize()
  })

  ipcMain.handle(FA_WINDOW_CONTROL_IPC.maximizeAsync, (event) => {
    const w = windowFromIpcEvent(event)
    if (w === undefined) {
      return
    }
    if (!w.isMaximized()) {
      rememberBoundsBeforeMaximize(w)
    }
    w.maximize()
  })

  ipcMain.handle(FA_WINDOW_CONTROL_IPC.resizeToggleAsync, (event) => {
    const w = windowFromIpcEvent(event)
    if (w === undefined) {
      return
    }
    if (w.isMaximized()) {
      w.unmaximize()
      applyPendingRestoreBounds(w)
    } else {
      rememberBoundsBeforeMaximize(w)
      w.maximize()
    }
  })

  ipcMain.handle(FA_WINDOW_CONTROL_IPC.closeAsync, (event) => {
    const w = windowFromIpcEvent(event)
    w?.close()
  })

  ipcMain.handle(FA_WINDOW_CONTROL_IPC.refreshWebContentsAsync, (event) => {
    const w = windowFromIpcEvent(event)
    w?.webContents.reload()
  })
}
