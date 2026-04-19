import { ipcMain } from 'electron'

import { FA_USER_SETTINGS_IPC } from 'app/src-electron/electron-ipc-bridge'
import { applyFaSpellCheckerLanguagesToSession } from 'app/src-electron/mainScripts/windowManagement/faSpellCheckerSession'
import { appWindow } from 'app/src-electron/mainScripts/windowManagement/mainWindowCreation'
import { getFaUserSettings } from 'app/src-electron/mainScripts/userSettings/userSettingsStore'
import { parseFaUserSettingsPatch } from 'app/src-electron/shared/faUserSettingsPatchSchema'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

let registered = false

function userSettingsSnapshot (): I_faUserSettings {
  const snapshot: I_faUserSettings = { ...getFaUserSettings().store }
  return snapshot
}

/**
 * Registers 'ipcMain.handle' for user settings read/write backed by 'electron-store' in main.
 * Safe to call once from 'startApp'; subsequent calls no-op.
 */
export function registerFaUserSettingsIpc (): void {
  if (registered) {
    return
  }
  registered = true

  // Get the user settings
  ipcMain.handle(FA_USER_SETTINGS_IPC.getAsync, (): I_faUserSettings => {
    return userSettingsSnapshot()
  })

  // Set the user settings
  ipcMain.handle(FA_USER_SETTINGS_IPC.setAsync, (_event, patch: unknown) => {
    const parsedPatch = parseFaUserSettingsPatch(patch)
    getFaUserSettings().set({
      ...userSettingsSnapshot(),
      ...parsedPatch
    })
    if (parsedPatch.languageCode !== undefined && appWindow !== undefined) {
      applyFaSpellCheckerLanguagesToSession(
        appWindow.webContents.session,
        parsedPatch.languageCode
      )
    }
  })
}
