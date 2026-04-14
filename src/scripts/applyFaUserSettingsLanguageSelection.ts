import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'

/**
 * Persists a new interface language via the user-settings store.
 * On success, the store switches vue-i18n before the save notification so the toast uses the new locale.
 * No-op when the requested code already matches the current selection.
 */
export async function applyFaUserSettingsLanguageSelection (
  updateSettings: (patch: Partial<I_faUserSettings>) => Promise<void>,
  languageCode: T_faUserSettingsLanguageCode,
  currentLanguageCode: T_faUserSettingsLanguageCode
): Promise<void> {
  if (languageCode === currentLanguageCode) {
    return
  }

  await updateSettings({
    languageCode
  })
}
