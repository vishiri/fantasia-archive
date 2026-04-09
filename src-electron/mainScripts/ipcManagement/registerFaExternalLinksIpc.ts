import { ipcMain, shell } from 'electron'

import { FA_EXTERNAL_LINKS_IPC } from 'app/src-electron/electron-ipc-bridge'
import { checkIfExternalUrl } from 'app/src-electron/shared/faExternalUrlPredicate'

let registered = false

/**
 * Registers async IPC to open external http(s) URLs in the system browser from main (preload cannot use 'shell' under sandbox).
 * Safe to call once from 'startApp'; subsequent calls no-op.
 */
export function registerFaExternalLinksIpc (): void {
  if (registered) {
    return
  }

  registered = true

  ipcMain.handle(
    FA_EXTERNAL_LINKS_IPC.openExternalAsync,
    async (_event, url: unknown) => {
      if (typeof url !== 'string') {
        return
      }

      if (!checkIfExternalUrl(url)) {
        return
      }

      await shell.openExternal(url)
    }
  )
}
