import type { I_faUserSettings } from './I_faUserSettings'

export interface I_faUserSettingsAPI {

  /**
   * Get the user settings
   */
  getSettings: () => Promise<I_faUserSettings>

  /**
   * Set the user settings
   */
  setSettings: (patch: Partial<I_faUserSettings>) => Promise<void>

}
