import { mainWindowCreation } from 'app/src-electron/mainScripts/windowManagement/mainWindowCreation'
import { registerFaAppDetailsIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaAppDetailsIpc'
import { registerFaDevToolsIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaDevToolsIpc'
import { registerFaUserSettingsIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaUserSettingsIpc'
import { registerFaWindowControlIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc'
import { getFaUserSettings } from 'app/src-electron/mainScripts/userSettings/userSettingsStore'
import { app } from 'electron'

// Starts the app's Electron instance
export const startApp = () => {
  registerFaDevToolsIpc()
  registerFaUserSettingsIpc()
  registerFaWindowControlIpc()
  registerFaAppDetailsIpc()
}

// Opens the singular app's window and make sure it is the only one
export const openAppWindowManager = () => {
  // Create the app window in the normal way
  app.whenReady().then(() => {
    getFaUserSettings()
    void mainWindowCreation()
  })

  // Create the app window, if it still doesn't exist yet
  app.on('activate', () => {
    void mainWindowCreation()
  })
}

// Closes the app's Electron instance when all windows are closed
export const closeAppManager = (platform: string) => {
  // Close the app if we are on anything that isn't Mac
  app.on('window-all-closed', () => {
    if (platform !== 'darwin') {
      app.quit()
    }
  })
}
