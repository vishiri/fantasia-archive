import type { T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'

export type T_faInterfaceTextDirection = 'ltr' | 'rtl'

/**
 * Interface locales that lay out the renderer with right-to-left direction.
 */
export const FA_RTL_INTERFACE_LANGUAGE_CODES: readonly T_faUserSettingsLanguageCode[] = ['ar']

/**
 * Resolves document text direction for the active interface language.
 */
export function resolveFaInterfaceTextDirectionFromLanguageCode (
  code: T_faUserSettingsLanguageCode
): T_faInterfaceTextDirection {
  if (FA_RTL_INTERFACE_LANGUAGE_CODES.includes(code)) {
    return 'rtl'
  }

  return 'ltr'
}

/**
 * Applies resolved direction to the root HTML element for app-wide layout.
 */
export function applyFaInterfaceTextDirectionFromLanguageCode (
  code: T_faUserSettingsLanguageCode
): void {
  if (typeof document === 'undefined') {
    return
  }

  const direction = resolveFaInterfaceTextDirectionFromLanguageCode(code)
  document.documentElement.dir = direction
  document.documentElement.style.direction = direction
}
