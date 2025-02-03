import { BrowserWindow } from '@electron/remote'
import { I_faDevToolsControl } from 'app/types/I_faDevToolsControl'

export const faDevToolsControlAPI: I_faDevToolsControl = {

  // Checks if the dev tools are open for the current window
  checkDevToolsStatus () {
    const currentWindow = BrowserWindow.getFocusedWindow()
    if (currentWindow !== null) {
      return currentWindow.webContents.isDevToolsOpened()
    }
    return false
  },

  // Toggles the dev tools for the current window
  toggleDevTools () {
    const currentWindow = BrowserWindow.getFocusedWindow()

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
    const currentWindow = BrowserWindow.getFocusedWindow()

    if (currentWindow !== null) {
      currentWindow.webContents.openDevTools()
    }
  },

  // Closes the dev tools for the current window
  closeDevTools () {
    const currentWindow = BrowserWindow.getFocusedWindow()

    if (currentWindow !== null) {
      currentWindow.webContents.closeDevTools()
    }
  }
}
