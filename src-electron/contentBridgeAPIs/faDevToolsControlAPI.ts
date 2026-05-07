import { ipcRenderer } from 'electron'

import { FA_DEVTOOLS_IPC } from 'app/src-electron/electron-ipc-bridge'
import type { I_faDevToolsControl } from 'app/types/I_faElectronRendererBridgeAPIs'

export const faDevToolsControlAPI: I_faDevToolsControl = {
  async checkDevToolsStatus () {
    const status = await ipcRenderer
      .invoke(FA_DEVTOOLS_IPC.statusAsync)
      .catch(() => false)
    return status === true
  },

  async toggleDevTools () {
    await ipcRenderer
      .invoke(FA_DEVTOOLS_IPC.toggleAsync)
      .catch(() => undefined)
  },

  async openDevTools () {
    await ipcRenderer
      .invoke(FA_DEVTOOLS_IPC.openAsync)
      .catch(() => undefined)
  },

  async closeDevTools () {
    await ipcRenderer
      .invoke(FA_DEVTOOLS_IPC.closeAsync)
      .catch(() => undefined)
  }
}
