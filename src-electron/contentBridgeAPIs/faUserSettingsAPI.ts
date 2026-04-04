import { ipcRenderer } from 'electron'

import { FA_USER_SETTINGS_IPC } from 'app/src-electron/electron-ipc-bridge'
import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import type { I_faUserSettingsAPI } from 'app/types/I_faUserSettingsAPI'

export const faUserSettingsAPI: I_faUserSettingsAPI = {

  // Get the user settings
  async getSettings () {
    return await ipcRenderer.invoke(FA_USER_SETTINGS_IPC.getAsync) as I_faUserSettings
  },

  // Set the user settings
  async setSettings (patch: Partial<I_faUserSettings>) {
    await ipcRenderer.invoke(FA_USER_SETTINGS_IPC.setAsync, patch)
  }

}
