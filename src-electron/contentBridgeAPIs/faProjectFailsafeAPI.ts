import { ipcRenderer } from 'electron'

import { FA_PROJECT_FAILSAFE_IPC } from 'app/src-electron/electron-ipc-bridge'

let pathListenerInstalled = false

/**
 * Wires renderer replies when main requests the active project path for SQLite failsafe reconnect.
 * Safe to call once after Pinia is available (Quasar boot).
 */
export function installFaProjectFailsafeActiveProjectPathReply (
  getActiveProjectFilePath: () => string | null
): void {
  if (pathListenerInstalled) {
    return
  }
  pathListenerInstalled = true
  ipcRenderer.on(
    FA_PROJECT_FAILSAFE_IPC.requestActiveProjectPathFromRenderer,
    (_event, correlationId: unknown) => {
      const id = typeof correlationId === 'string' ? correlationId : ''
      const filePath = getActiveProjectFilePath()
      ipcRenderer.send(FA_PROJECT_FAILSAFE_IPC.replyActiveProjectPathToMain, {
        correlationId: id,
        filePath
      })
    }
  )
}

export const faProjectFailsafeAPI = {
  installActiveProjectPathReply: installFaProjectFailsafeActiveProjectPathReply
}
