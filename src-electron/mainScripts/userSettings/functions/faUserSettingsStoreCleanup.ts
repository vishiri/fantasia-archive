import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

export function buildSanitizedFaUserSettings (
  currentSettings: Partial<I_faUserSettings>,
  defaults: I_faUserSettings
): {
    sanitized: I_faUserSettings
    hasUnexpectedKeys: boolean
  } {
  const knownKeys = Object.keys(defaults) as Array<keyof I_faUserSettings>
  const sanitized = Object.fromEntries(
    knownKeys.map((key) => {
      return [key, currentSettings[key] ?? defaults[key]]
    })
  ) as unknown as I_faUserSettings

  const hasUnexpectedKeys = Object.keys(currentSettings)
    .some((key) => !(key in defaults))

  return {
    hasUnexpectedKeys,
    sanitized
  }
}
