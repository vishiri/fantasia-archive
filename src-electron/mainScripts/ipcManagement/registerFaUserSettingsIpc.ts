import { ipcMain } from 'electron'

import { FA_USER_SETTINGS_IPC } from 'app/src-electron/electron-ipc-bridge'
import { getFaUserSettings } from 'app/src-electron/mainScripts/userSettings/userSettingsStore'
import type { I_faUserSettings } from 'app/types/I_faUserSettings'

let registered = false

function userSettingsSnapshot (): I_faUserSettings {
  return { ...getFaUserSettings().store }
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
  ipcMain.handle(FA_USER_SETTINGS_IPC.setAsync, (_event, patch: Partial<I_faUserSettings>) => {
    getFaUserSettings().set({
      ...userSettingsSnapshot(),
      ...patch
    })
  })
}
