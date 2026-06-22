import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

/**
 * True when the active UI language has no value and a fallback locale supplies the shown text.
 */
export function isFaLocaleStringTranslationUsingFallback (input: {
  currentLanguageCode: T_faUserSettingsLanguageCode
  resolveLanguageCode: (
    translations: I_faLocaleStringTranslations,
    preferredLanguageCode: T_faUserSettingsLanguageCode
  ) => T_faUserSettingsLanguageCode | null
  translations: I_faLocaleStringTranslations
}): boolean {
  const resolvedLanguageCode = input.resolveLanguageCode(
    input.translations,
    input.currentLanguageCode
  )
  return resolvedLanguageCode !== null && resolvedLanguageCode !== input.currentLanguageCode
}
