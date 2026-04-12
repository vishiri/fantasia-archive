import { ipcRenderer } from 'electron'

import { FA_WINDOW_CONTROL_IPC } from 'app/src-electron/electron-ipc-bridge'
import type { I_faWindowControlAPI } from 'app/types/I_faWindowControlAPI'

export const faWindowControlAPI: I_faWindowControlAPI = {
  async checkWindowMaximized () {
    try {
      const v = await ipcRenderer.invoke(FA_WINDOW_CONTROL_IPC.checkMaximizedAsync)

      return v === true
    } catch {
      return false
    }
  },

  async minimizeWindow () {
    try {
      await ipcRenderer.invoke(FA_WINDOW_CONTROL_IPC.minimizeAsync)
    } catch {
      // no-op
    }
  },

  async maximizeWindow () {
    try {
      await ipcRenderer.invoke(FA_WINDOW_CONTROL_IPC.maximizeAsync)
    } catch {
      // no-op
    }
  },

  async resizeWindow () {
    try {
      await ipcRenderer.invoke(FA_WINDOW_CONTROL_IPC.resizeToggleAsync)
    } catch {
      // no-op
    }
  },

  async closeWindow () {
    try {
      await ipcRenderer.invoke(FA_WINDOW_CONTROL_IPC.closeAsync)
    } catch {
      // no-op
    }
  },

  async refreshWebContents () {
    try {
      await ipcRenderer.invoke(FA_WINDOW_CONTROL_IPC.refreshWebContentsAsync)
    } catch {
      // no-op
    }
  }
}
