import { BrowserWindow } from '@electron/remote'
import { I_faWindowControlAPI } from 'app/interfaces/I_faWindowControlAPI'

export const faWindowControlAPI: I_faWindowControlAPI = {

  checkWindowMaximized () {
    const currentWindow = BrowserWindow.getFocusedWindow()
    if (currentWindow !== null) {
      return currentWindow.isMaximized()
    }
    return false
  },

  minimizeWindow () {
    const currentWindow = BrowserWindow.getFocusedWindow()

    if (currentWindow !== null) {
      currentWindow.minimize()
    }
  },

  maximizeWindow () {
    const currentWindow = BrowserWindow.getFocusedWindow()

    if (currentWindow !== null) {
      currentWindow.maximize()
    }
  },

  resizeWindow () {
    const currentWindow = BrowserWindow.getFocusedWindow()

    if (currentWindow !== null) {
      if (currentWindow.isMaximized()) {
        currentWindow.unmaximize()
      } else {
        currentWindow.maximize()
      }
    }
  },

  closeWindow () {
    const currentWindow = BrowserWindow.getFocusedWindow()
    if (currentWindow !== null) {
      currentWindow.close()
    }
  }
}
