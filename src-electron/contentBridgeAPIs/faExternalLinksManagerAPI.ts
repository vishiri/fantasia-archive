import { ipcRenderer } from 'electron'

import { FA_EXTERNAL_LINKS_IPC } from 'app/src-electron/electron-ipc-bridge'
import { checkIfExternalUrl } from 'app/src-electron/shared/faExternalUrlPredicate'
import type { I_faExternalLinksManagerAPI } from 'app/types/I_faExternalLinksManagerAPI'

export const faExternalLinksManagerAPI: I_faExternalLinksManagerAPI = {

  checkIfExternal (url: string) {
    return checkIfExternalUrl(url)
  },

  openExternal (url: string) {
    void ipcRenderer.invoke(FA_EXTERNAL_LINKS_IPC.openExternalAsync, url).catch(() => {})
  }

}
