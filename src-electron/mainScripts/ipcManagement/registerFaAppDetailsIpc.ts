import { app, ipcMain } from 'electron'

import { FA_APP_DETAILS_IPC } from 'app/src-electron/electron-ipc-bridge'

let registered = false

/**
 * Registers synchronous IPC handlers for read-only app metadata (version from main 'app.getVersion()').
 * Safe to call once from 'startApp'; subsequent calls no-op.
 */
export function registerFaAppDetailsIpc (): void {
  if (registered) {
    return
  }
  registered = true

  ipcMain.on(FA_APP_DETAILS_IPC.getVersionSync, (event) => {
    try {
      event.returnValue = app.getVersion()
    } catch {
      event.returnValue = ''
    }
  })
}
