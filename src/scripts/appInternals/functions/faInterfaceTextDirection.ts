import type { T_faInterfaceTextDirection } from 'app/types/T_faInterfaceTextDirection'
import type { T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'

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
