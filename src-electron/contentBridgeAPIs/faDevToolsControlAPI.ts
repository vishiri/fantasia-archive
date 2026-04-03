import { ipcRenderer } from 'electron'

import { FA_DEVTOOLS_IPC } from 'app/src-electron/devToolsIpcChannels'
import type { I_faDevToolsControl } from 'app/types/I_faDevToolsControl'

export const faDevToolsControlAPI: I_faDevToolsControl = {

  checkDevToolsStatus () {
    try {
      return ipcRenderer.sendSync(FA_DEVTOOLS_IPC.statusSync) === true
    } catch {
      return false
    }
  },

  toggleDevTools () {
    try {
      ipcRenderer.sendSync(FA_DEVTOOLS_IPC.toggleSync)
    } catch {
      // no-op (e.g. running outside Electron)
    }
  },

  openDevTools () {
    try {
      ipcRenderer.sendSync(FA_DEVTOOLS_IPC.openSync)
    } catch {
      // no-op
    }
  },

  closeDevTools () {
    try {
      ipcRenderer.sendSync(FA_DEVTOOLS_IPC.closeSync)
    } catch {
      // no-op
    }
  }
}
