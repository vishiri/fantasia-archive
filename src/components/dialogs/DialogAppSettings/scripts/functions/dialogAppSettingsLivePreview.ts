import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { T_appSettingsFaUserSettingsStoreForSync } from 'app/types/I_dialogAppSettings'

/**
 * Deep-enough copy for reverting Pinia user settings when App Settings closes without save.
 */
export function cloneFaUserSettingsSnapshot (settings: I_faUserSettings): I_faUserSettings {
  return {
    ...settings
  }
}

/**
 * Mirrors a draft toggle into S_FaUserSettings so surfaces such as ProjectOverview react immediately.
 */
export function applyAppSettingsLivePreviewPatch (
  store: T_appSettingsFaUserSettingsStoreForSync,
  settingKey: keyof I_faUserSettings,
  updatedValue: boolean
): void {
  if (store.settings === null) {
    return
  }

  store.settings = {
    ...store.settings,
    [settingKey]: updatedValue
  }
}

/**
 * Restores Pinia user settings after closing App Settings without saving.
 */
export function restoreAppSettingsLivePreviewSnapshot (
  store: T_appSettingsFaUserSettingsStoreForSync,
  snapshot: I_faUserSettings
): void {
  store.settings = cloneFaUserSettingsSnapshot(snapshot)
}
