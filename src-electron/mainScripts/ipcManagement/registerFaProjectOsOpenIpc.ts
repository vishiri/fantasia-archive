import { ipcMain } from 'electron'

import { FA_PROJECT_OS_OPEN_IPC } from 'app/src-electron/electron-ipc-bridge'

import {
  isFaProjectOsOpenRendererReadySender,
  onFaProjectOsOpenRendererReady
} from 'app/src-electron/mainScripts/projectManagement/projectManagement_manager'

let registered = false

/**
 * Renderer signals preload OS-open listeners are wired; main may flush a queued path.
 */
export function registerFaProjectOsOpenIpc (): void {
  if (registered) {
    return
  }
  registered = true
  ipcMain.on(FA_PROJECT_OS_OPEN_IPC.rendererReadyToMain, (event) => {
    if (!isFaProjectOsOpenRendererReadySender(event.sender)) {
      return
    }
    onFaProjectOsOpenRendererReady()
  })
}
