import { ipcMain } from 'electron'

import { FA_PROJECT_OS_OPEN_IPC } from 'app/src-electron/electron-ipc-bridge'

import { onFaProjectOsOpenRendererReady } from 'app/src-electron/mainScripts/projectManagement/faProjectOsOpenDelivery'

let registered = false

/**
 * Renderer signals preload OS-open listeners are wired; main may flush a queued path.
 */
export function registerFaProjectOsOpenIpc (): void {
  if (registered) {
    return
  }
  registered = true
  ipcMain.on(FA_PROJECT_OS_OPEN_IPC.rendererReadyToMain, () => {
    onFaProjectOsOpenRendererReady()
  })
}
