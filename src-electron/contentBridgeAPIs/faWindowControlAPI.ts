import { getCurrentWindow } from '@electron/remote'
import type { I_faWindowControlAPI } from 'app/types/I_faWindowControlAPI'

/**
 * Use the window that owns this renderer. `BrowserWindow.getFocusedWindow()` is unreliable
 * when native menus or other windows steal OS focus (same class of issue as DevTools controls).
 */
function appWindow () {
  try {
    return getCurrentWindow()
  } catch {
    return null
  }
}

export const faWindowControlAPI: I_faWindowControlAPI = {

  // Check if the current window is maximized
  checkWindowMaximized () {
    const currentWindow = appWindow()
    if (currentWindow !== null) {
      return currentWindow.isMaximized()
    }
    return false
  },

  // Minimizes the current window
  minimizeWindow () {
    const currentWindow = appWindow()

    if (currentWindow !== null) {
      currentWindow.minimize()
    }
  },

  // Maximizes the current window
  maximizeWindow () {
    const currentWindow = appWindow()

    if (currentWindow !== null) {
      currentWindow.maximize()
    }
  },

  // Resizes the current window
  resizeWindow () {
    const currentWindow = appWindow()

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
    const currentWindow = appWindow()
    if (currentWindow !== null) {
      currentWindow.close()
    }
  }
}
