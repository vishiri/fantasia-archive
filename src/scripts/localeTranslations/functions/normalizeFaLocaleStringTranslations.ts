import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

export function createNormalizeFaLocaleStringTranslations (deps: {
  languageCodes: readonly T_faUserSettingsLanguageCode[]
  maxLength: number
}): (translations: I_faLocaleStringTranslations) => I_faLocaleStringTranslations {
  return function normalizeFaLocaleStringTranslations (
    translations: I_faLocaleStringTranslations
  ): I_faLocaleStringTranslations {
    const normalized: I_faLocaleStringTranslations = {}
    for (const languageCode of deps.languageCodes) {
      const raw = translations[languageCode]
      if (raw === undefined) {
        continue
      }
      const trimmed = raw.trim().slice(0, deps.maxLength)
      if (trimmed.length > 0) {
        normalized[languageCode] = trimmed
      }
    }
    return normalized
  }
}
