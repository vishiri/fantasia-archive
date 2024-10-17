import { BrowserWindow } from '@electron/remote'
import { I_faDevToolsControl } from 'app/interfaces/I_faDevToolsControl'

export const faDevToolsControlAPI: I_faDevToolsControl = {

  checkDecToolsStatus () {
    const currentWindow = BrowserWindow.getFocusedWindow()
    if (currentWindow !== null) {
      return currentWindow.webContents.isDevToolsOpened()
    }
    return false
  },

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

  openDevTools () {
    const currentWindow = BrowserWindow.getFocusedWindow()

    if (currentWindow !== null) {
      currentWindow.webContents.openDevTools()
    }
  },

  closeDevTools () {
    const currentWindow = BrowserWindow.getFocusedWindow()

    if (currentWindow !== null) {
      currentWindow.webContents.closeDevTools()
    }
  }
}
