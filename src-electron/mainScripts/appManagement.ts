import { initialize } from '@electron/remote/main'
import { mainWindowCreation } from 'app/src-electron/mainScripts/mainWindowCreation'
import { app } from 'electron'

// Starts the app's Electron instance
export const startApp = () => {
  initialize()
}

// Opens the singular app's window and make sure it is the only one
export const openAppWindowManager = () => {
  // Create the app window in the normal way
  app.whenReady().then(mainWindowCreation)

  // Create the app window, if it still doesn't exist yet
  app.on('activate', () => {
    mainWindowCreation()
  })
}

// Closes the app's Electron instance when all windows are closed
export const closeAppManager = (platform: string) => {
  // Close app if we are on anything that isn't Mac
  app.on('window-all-closed', () => {
    if (platform !== 'darwin') {
      app.quit()
    }
  })
}
