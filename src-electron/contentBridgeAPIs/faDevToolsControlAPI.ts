import { getCurrentWindow } from '@electron/remote'
import { I_faDevToolsControl } from 'app/types/I_faDevToolsControl'

/**
 * Use the window that owns this renderer. `BrowserWindow.getFocusedWindow()` is unreliable
 * after native menus / DevTools steal OS focus and made Playwright E2E checks flaky.
 */
function appWindow () {
  try {
    return getCurrentWindow()
  } catch {
    return null
  }
}

export const faDevToolsControlAPI: I_faDevToolsControl = {

  // Checks if the dev tools are open for the current window
  checkDevToolsStatus () {
    const currentWindow = appWindow()
    if (currentWindow !== null) {
      return currentWindow.webContents.isDevToolsOpened()
    }
    return false
  },

  // Toggles the dev tools for the current window
  toggleDevTools () {
    const currentWindow = appWindow()

    if (currentWindow !== null) {
      const devToolsOpened = currentWindow.webContents.isDevToolsOpened()
      if (devToolsOpened) {
        currentWindow.webContents.closeDevTools()
      } else {
        currentWindow.webContents.openDevTools()
      }
    }
  },

  // Opens the dev tools for the current window
  openDevTools () {
    const currentWindow = appWindow()

    if (currentWindow !== null) {
      currentWindow.webContents.openDevTools()
    }
  },

  // Closes the dev tools for the current window
  closeDevTools () {
    const currentWindow = appWindow()

    if (currentWindow !== null) {
      currentWindow.webContents.closeDevTools()
    }
  }
}
