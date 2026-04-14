import type { T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'

export function isFaUserSettingsLanguageCode (value: string): value is T_faUserSettingsLanguageCode {
  return value === 'en-US' || value === 'fr' || value === 'de'
}
