import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

export function buildSanitizedFaUserSettings (
  currentSettings: Partial<I_faUserSettings>,
  defaults: I_faUserSettings,
  isAppTheme: (value: string) => boolean,
  isLanguageCode: (value: string) => boolean
): {
    sanitized: I_faUserSettings
    hasUnexpectedKeys: boolean
  } {
  const knownKeys = Object.keys(defaults) as Array<keyof I_faUserSettings>
  const sanitized = Object.fromEntries(
    knownKeys.map((key) => {
      return [key, readSanitizedFaUserSetting(key, currentSettings, defaults, isAppTheme, isLanguageCode)]
    })
  ) as unknown as I_faUserSettings

  const hasUnexpectedKeys = Object.keys(currentSettings)
    .some((key) => !(key in defaults))

  return {
    hasUnexpectedKeys,
    sanitized
  }
}

function readSanitizedFaUserSetting (
  key: keyof I_faUserSettings,
  currentSettings: Partial<I_faUserSettings>,
  defaults: I_faUserSettings,
  isAppTheme: (value: string) => boolean,
  isLanguageCode: (value: string) => boolean
): I_faUserSettings[keyof I_faUserSettings] {
  const value = currentSettings[key]
  const fallback = defaults[key]
  if (typeof fallback === 'boolean') {
    if (typeof value === 'boolean') {
      return value
    }
    return fallback
  }
  if (key === 'appTheme') {
    if (typeof value === 'string' && isAppTheme(value)) {
      return value
    }
    return fallback
  }
  if (typeof value === 'string' && isLanguageCode(value)) {
    return value
  }
  return fallback
}
