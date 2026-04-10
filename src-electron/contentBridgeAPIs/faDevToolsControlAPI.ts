import { ipcRenderer } from 'electron'

import { FA_DEVTOOLS_IPC } from 'app/src-electron/electron-ipc-bridge'
import type { I_faDevToolsControl } from 'app/types/I_faDevToolsControl'

export const faDevToolsControlAPI: I_faDevToolsControl = {
  async checkDevToolsStatus () {
    try {
      const v = await ipcRenderer.invoke(FA_DEVTOOLS_IPC.statusAsync)

      return v === true
    } catch {
      return false
    }
  },

  async toggleDevTools () {
    try {
      await ipcRenderer.invoke(FA_DEVTOOLS_IPC.toggleAsync)
    } catch {
      // no-op
    }
  },

  async openDevTools () {
    try {
      await ipcRenderer.invoke(FA_DEVTOOLS_IPC.openAsync)
    } catch {
      // no-op
    }
  },

  async closeDevTools () {
    try {
      await ipcRenderer.invoke(FA_DEVTOOLS_IPC.closeAsync)
    } catch {
      // no-op
    }
  }
}
