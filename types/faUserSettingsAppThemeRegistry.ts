/**
 * Canonical app theme value ids for Fantasia Archive Settings (not user-facing labels).
 */
export const FA_USER_SETTINGS_APP_THEME_VALUES = [
  'lightThemeFlat',
  'darkThemeFlat',
  'lightThemeFantasy',
  'darkThemeFantasy'
] as const

export type T_faUserSettingsAppTheme = (typeof FA_USER_SETTINGS_APP_THEME_VALUES)[number]

/** Body skin class token derived from a full app theme id (flat vs fantasy). */
export type T_faAppThemeSkin = 'flat' | 'fantasy'

export const FA_USER_SETTINGS_APP_THEME_DEFAULT: T_faUserSettingsAppTheme = 'darkThemeFantasy'

export function isFaUserSettingsAppTheme (value: string): value is T_faUserSettingsAppTheme {
  return (FA_USER_SETTINGS_APP_THEME_VALUES as readonly string[]).includes(value)
}
