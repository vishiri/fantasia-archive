import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'

/** True when any locale value is non-empty after trim. */
export function hasFaLocaleStringTranslationsAnyValue (
  translations: I_faLocaleStringTranslations
): boolean {
  for (const value of Object.values(translations)) {
    if ((value ?? '').trim().length > 0) {
      return true
    }
  }
  return false
}
