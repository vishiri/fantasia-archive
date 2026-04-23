import { mainWindowCreation } from 'app/src-electron/mainScripts/windowManagement/mainWindowCreation'
import { registerFaAppDetailsIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaAppDetailsIpc'
import { registerFaDevToolsIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaDevToolsIpc'
import { registerFaExtraEnvIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaExtraEnvIpc'
import { registerFaExternalLinksIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaExternalLinksIpc'
import { registerFaKeybindsIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaKeybindsIpc'
import { registerFaProgramConfigIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaProgramConfigIpc'
import { registerFaProgramStylingIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaProgramStylingIpc'
import { registerFaUserSettingsIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaUserSettingsIpc'
import { registerFaWindowControlIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc'
import { getFaKeybinds } from 'app/src-electron/mainScripts/keybinds/faKeybindsStore'
import { getFaProgramStyling } from 'app/src-electron/mainScripts/programStyling/faProgramStylingStore'
import { getFaUserSettings } from 'app/src-electron/mainScripts/userSettings/userSettingsStore'
import { app } from 'electron'

// Starts the app's Electron instance
export const startApp = () => {
  registerFaDevToolsIpc()
  registerFaExtraEnvIpc()
  registerFaExternalLinksIpc()
  registerFaKeybindsIpc()
  registerFaProgramConfigIpc()
  registerFaProgramStylingIpc()
  registerFaUserSettingsIpc()
  registerFaWindowControlIpc()
  registerFaAppDetailsIpc()
}

// Opens the singular app's window and make sure it is the only one
export const openAppWindowManager = () => {
  // Create the app window in the normal way
  app.whenReady().then(() => {
    getFaKeybinds()
    getFaProgramStyling()
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
