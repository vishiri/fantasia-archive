import { BrowserWindow } from '@electron/remote'
import { I_faWindowControlAPI } from 'app/types/I_faWindowControlAPI'

export const faWindowControlAPI: I_faWindowControlAPI = {

  // Check if the current window is maximized
  checkWindowMaximized () {
    const currentWindow = BrowserWindow.getFocusedWindow()
    if (currentWindow !== null) {
      return currentWindow.isMaximized()
    }
    return false
  },

  // Minimizes the current window
  minimizeWindow () {
    const currentWindow = BrowserWindow.getFocusedWindow()

    if (currentWindow !== null) {
      currentWindow.minimize()
    }
  },

  // Maximizes the current window
  maximizeWindow () {
    const currentWindow = BrowserWindow.getFocusedWindow()

    if (currentWindow !== null) {
      currentWindow.maximize()
    }
  },

  // Resizes the current window
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

  // Closes the current window
  closeWindow () {
    const currentWindow = BrowserWindow.getFocusedWindow()
    if (currentWindow !== null) {
      currentWindow.close()
    }
  }
}
