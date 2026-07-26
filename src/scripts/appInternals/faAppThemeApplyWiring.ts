import { Dark } from 'quasar'

import {
  FA_USER_SETTINGS_APP_THEME_DEFAULT,
  isFaUserSettingsAppTheme
} from 'app/types/faUserSettingsAppThemeRegistry'
import type { T_faUserSettingsAppTheme } from 'app/types/faUserSettingsAppThemeRegistry'

import {
  resolveFaAppThemeIsDark,
  resolveFaAppThemeSkin
} from './functions/faAppThemeDom'

export const FA_APP_THEME_BODY_CLASS_PREFIX = 'fa-appTheme--'
export const FA_APP_THEME_BODY_DATASET_KEY = 'faAppTheme'
export const FA_APP_THEME_BODY_DARK_CLASS = 'body--dark'
export const FA_APP_THEME_BODY_LIGHT_CLASS = 'body--light'

/**
 * Writes skin + light/dark body classes and syncs Quasar Dark for the active app theme.
 * data-fa-app-theme keeps the full settings theme id.
 */
export function applyFaAppThemeToDocument (theme: string): void {
  if (typeof document === 'undefined') {
    return
  }

  const resolved: T_faUserSettingsAppTheme = isFaUserSettingsAppTheme(theme)
    ? theme
    : FA_USER_SETTINGS_APP_THEME_DEFAULT

  const skin = resolveFaAppThemeSkin(resolved)
  const isDark = resolveFaAppThemeIsDark(resolved)
  const body = document.body

  for (const className of Array.from(body.classList)) {
    if (className.startsWith(FA_APP_THEME_BODY_CLASS_PREFIX)) {
      body.classList.remove(className)
    }
  }

  body.classList.add(`${FA_APP_THEME_BODY_CLASS_PREFIX}${skin}`)
  body.dataset[FA_APP_THEME_BODY_DATASET_KEY] = resolved

  if (isDark) {
    body.classList.add(FA_APP_THEME_BODY_DARK_CLASS)
    body.classList.remove(FA_APP_THEME_BODY_LIGHT_CLASS)
  } else {
    body.classList.add(FA_APP_THEME_BODY_LIGHT_CLASS)
    body.classList.remove(FA_APP_THEME_BODY_DARK_CLASS)
  }

  Dark.set(isDark)
}
