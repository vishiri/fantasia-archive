import { registerAllFaIpc } from 'app/src-electron/mainScripts/ipcManagement/ipcManagement_manager'
import { mainWindowCreation } from 'app/src-electron/mainScripts/windowManagement/windowManagement_manager'
import { getFaKeybinds } from 'app/src-electron/mainScripts/keybinds/keybinds_manager'
import { getFaAppNoteboard } from 'app/src-electron/mainScripts/appNoteboard/appNoteboard_manager'
import { getFaAppStyling } from 'app/src-electron/mainScripts/appStyling/appStyling_manager'
import { getFaUserSettings } from 'app/src-electron/mainScripts/userSettings/userSettings_manager'
import { app } from 'electron'

// Starts the app's Electron instance
export const startApp = () => {
  registerAllFaIpc()
}

// Opens the singular app's window and make sure it is the only one
export const openAppWindowManager = () => {
  // Create the app window in the normal way
  app.whenReady().then(() => {
    getFaKeybinds()
    getFaAppNoteboard()
    getFaAppStyling()
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
