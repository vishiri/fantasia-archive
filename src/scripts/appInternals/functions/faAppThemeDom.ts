import type {
  T_faAppThemeSkin,
  T_faUserSettingsAppTheme
} from 'app/types/faUserSettingsAppThemeRegistry'

/**
 * Light theme ids start with 'light'; dark theme ids start with 'dark'.
 */
export function resolveFaAppThemeIsDark (theme: T_faUserSettingsAppTheme): boolean {
  return theme.startsWith('dark')
}

/**
 * Skin class token from a full app theme id (flat vs fantasy).
 */
export function resolveFaAppThemeSkin (theme: T_faUserSettingsAppTheme): T_faAppThemeSkin {
  return theme.endsWith('Fantasy') ? 'fantasy' : 'flat'
}
