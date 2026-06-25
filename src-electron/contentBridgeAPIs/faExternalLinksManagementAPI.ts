import { ipcRenderer } from 'electron'

import { FA_EXTERNAL_LINKS_IPC } from 'app/src-electron/electron-ipc-bridge'
import { checkIfExternalUrl } from 'app/src-electron/shared/faExternalUrlPredicate'
import type { I_faExternalLinksManagerAPI } from 'app/types/I_faElectronRendererBridgeAPIs'

export const faExternalLinksManagerAPI: I_faExternalLinksManagerAPI = {

  checkIfExternal (url: string) {
    return checkIfExternalUrl(url)
  },

  openExternal (url: string) {
    // Preload sandbox: failures are non-fatal; main logs openExternal errors.
    void ipcRenderer
      .invoke(FA_EXTERNAL_LINKS_IPC.openExternalAsync, url)
      .catch(() => undefined)
  }

}
