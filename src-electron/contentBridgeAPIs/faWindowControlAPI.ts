import { ipcRenderer } from 'electron'

import { FA_WINDOW_CONTROL_IPC } from 'app/src-electron/electron-ipc-bridge'
import type { I_faWindowControlAPI } from 'app/types/I_faElectronRendererBridgeAPIs'

export const faWindowControlAPI: I_faWindowControlAPI = {
  async checkWindowMaximized () {
    const maximized = await ipcRenderer
      .invoke(FA_WINDOW_CONTROL_IPC.checkMaximizedAsync)
      .catch(() => false)
    return maximized === true
  },

  async minimizeWindow () {
    await ipcRenderer
      .invoke(FA_WINDOW_CONTROL_IPC.minimizeAsync)
      .catch(() => undefined)
  },

  async maximizeWindow () {
    await ipcRenderer
      .invoke(FA_WINDOW_CONTROL_IPC.maximizeAsync)
      .catch(() => undefined)
  },

  async resizeWindow () {
    await ipcRenderer
      .invoke(FA_WINDOW_CONTROL_IPC.resizeToggleAsync)
      .catch(() => undefined)
  },

  async closeWindow () {
    await ipcRenderer
      .invoke(FA_WINDOW_CONTROL_IPC.closeAsync)
      .catch(() => undefined)
  },

  async refreshWebContents () {
    await ipcRenderer
      .invoke(FA_WINDOW_CONTROL_IPC.refreshWebContentsAsync)
      .catch(() => undefined)
  }
}
