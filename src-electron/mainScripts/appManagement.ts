import { mainWindowCreation } from 'app/src-electron/mainScripts/windowManagement/mainWindowCreation'
import { registerFaAppDetailsIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaAppDetailsIpc'
import { registerFaDevToolsIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaDevToolsIpc'
import { registerFaExtraEnvIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaExtraEnvIpc'
import { registerFaExternalLinksIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaExternalLinksIpc'
import { registerFaKeybindsIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaKeybindsIpc'
import { registerFaAppConfigIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaAppConfigIpc'
import { installFaProjectFailsafePathReplyListener } from 'app/src-electron/mainScripts/ipcManagement/faProjectFailsafePathFromRenderer'
import { registerFaProjectManagementIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaProjectManagementIpc'
import { registerFaProjectOsOpenIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaProjectOsOpenIpc'
import { registerFaAppNoteboardIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaAppNoteboardIpc'
import { registerFaAppStylingIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaAppStylingIpc'
import { registerFaUserSettingsIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaUserSettingsIpc'
import { registerFaWindowControlIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc'
import { getFaKeybinds } from 'app/src-electron/mainScripts/keybinds/keybinds_manager'
import { getFaAppNoteboard } from 'app/src-electron/mainScripts/appNoteboard/appNoteboard_manager'
import { getFaAppStyling } from 'app/src-electron/mainScripts/appStyling/appStyling_manager'
import { getFaUserSettings } from 'app/src-electron/mainScripts/userSettings/userSettings_manager'
import { app } from 'electron'

// Starts the app's Electron instance
export const startApp = () => {
  registerFaDevToolsIpc()
  registerFaExtraEnvIpc()
  registerFaExternalLinksIpc()
  registerFaKeybindsIpc()
  registerFaAppConfigIpc()
  installFaProjectFailsafePathReplyListener()
  registerFaProjectOsOpenIpc()
  registerFaProjectManagementIpc()
  registerFaAppNoteboardIpc()
  registerFaAppStylingIpc()
  registerFaUserSettingsIpc()
  registerFaWindowControlIpc()
  registerFaAppDetailsIpc()
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
