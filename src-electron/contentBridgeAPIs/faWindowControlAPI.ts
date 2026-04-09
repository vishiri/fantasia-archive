import { ipcRenderer } from 'electron'

import { FA_WINDOW_CONTROL_IPC } from 'app/src-electron/electron-ipc-bridge'
import type { I_faWindowControlAPI } from 'app/types/I_faWindowControlAPI'

export const faWindowControlAPI: I_faWindowControlAPI = {

  checkWindowMaximized () {
    try {
      return ipcRenderer.sendSync(FA_WINDOW_CONTROL_IPC.checkMaximizedSync) === true
    } catch {
      return false
    }
  },

  minimizeWindow () {
    try {
      ipcRenderer.sendSync(FA_WINDOW_CONTROL_IPC.minimizeSync)
    } catch {
      // no-op (e.g. running outside Electron)
    }
  },

  maximizeWindow () {
    try {
      ipcRenderer.sendSync(FA_WINDOW_CONTROL_IPC.maximizeSync)
    } catch {
      // no-op
    }
  },

  resizeWindow () {
    try {
      ipcRenderer.sendSync(FA_WINDOW_CONTROL_IPC.resizeToggleSync)
    } catch {
      // no-op
    }
  },

  closeWindow () {
    try {
      ipcRenderer.sendSync(FA_WINDOW_CONTROL_IPC.closeSync)
    } catch {
      // no-op
    }
  }
}
