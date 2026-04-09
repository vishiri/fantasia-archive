import ElectronStore from 'electron-store'
import type { I_faUserSettings } from 'app/types/I_faUserSettings'

import { FA_USER_SETTINGS_DEFAULTS } from './faUserSettingsDefaults'

/*
 * Electron Store instance for user settings
 * Can have null value if the store is not yet created
 */
let faUserSettings: ElectronStore<I_faUserSettings> | null = null

/**
 * Removes persisted keys that no longer exist in 'FA_USER_SETTINGS_DEFAULTS' and rewrites the settings file once per launch when stale/unknown keys are found.
 */
export const cleanupFaUserSettings = (store: ElectronStore<I_faUserSettings>): void => {
  const currentSettings = (store.store ?? {}) as Partial<I_faUserSettings> & Record<string, boolean | undefined>
  const sanitizedSettings: I_faUserSettings = { ...FA_USER_SETTINGS_DEFAULTS }

  // Rebuild the saved settings from the known defaults shape only
  for (const key of Object.keys(FA_USER_SETTINGS_DEFAULTS) as Array<keyof I_faUserSettings>) {
    sanitizedSettings[key] = currentSettings[key] ?? FA_USER_SETTINGS_DEFAULTS[key]
  }

  // Check if there are any unexpected keys
  const hasUnexpectedKeys = Object.keys(currentSettings)
    .some((key) => !(key in FA_USER_SETTINGS_DEFAULTS))

  // If there are unexpected keys, update the store with the sanitized settings
  if (hasUnexpectedKeys) {
    store.store = sanitizedSettings
  }
}

/**
 * Lazily creates the main-process settings store. Call only after 'app.whenReady()'
 * (or from within that callback) so Electron 'userData' paths resolve.
 */
export const getFaUserSettings = (): ElectronStore<I_faUserSettings> => {
  // If the store is not yet created, create it and cleanup the settings for unexpected keys
  if (faUserSettings === null) {
    faUserSettings = new ElectronStore<I_faUserSettings>({
      name: 'faUserSettings',
      defaults: { ...FA_USER_SETTINGS_DEFAULTS }
    })
    cleanupFaUserSettings(faUserSettings)
  }

  // Return the store instance
  return faUserSettings
}
