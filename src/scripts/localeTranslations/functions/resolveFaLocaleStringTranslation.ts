import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

function readTrimmedTranslation (
  translations: I_faLocaleStringTranslations,
  languageCode: T_faUserSettingsLanguageCode
): string {
  const value = translations[languageCode]
  if (value === undefined) {
    return ''
  }
  return value.trim()
}

export function createResolveFaLocaleStringTranslation (deps: {
  languageCodes: readonly T_faUserSettingsLanguageCode[]
}): {
    hasFaLocaleStringTranslation: (translations: I_faLocaleStringTranslations) => boolean
    resolveFaLocaleStringTranslation: (
      translations: I_faLocaleStringTranslations,
      preferredLanguageCode: T_faUserSettingsLanguageCode
    ) => string
    resolveFaLocaleStringTranslationForStorage: (
      translations: I_faLocaleStringTranslations
    ) => string
    resolveFaLocaleStringTranslationLanguageCode: (
      translations: I_faLocaleStringTranslations,
      preferredLanguageCode: T_faUserSettingsLanguageCode
    ) => T_faUserSettingsLanguageCode | null
  } {
  function resolveFaLocaleStringTranslationResolution (
    translations: I_faLocaleStringTranslations,
    preferredLanguageCode: T_faUserSettingsLanguageCode
  ): {
      displayLanguageCode: T_faUserSettingsLanguageCode | null
      value: string
    } {
    const preferred = readTrimmedTranslation(translations, preferredLanguageCode)
    if (preferred.length > 0) {
      return {
        displayLanguageCode: preferredLanguageCode,
        value: preferred
      }
    }

    const enUs = readTrimmedTranslation(translations, 'en-US')
    if (enUs.length > 0) {
      return {
        displayLanguageCode: 'en-US',
        value: enUs
      }
    }

    const sortedCodes = [...deps.languageCodes].sort((left, right) => {
      return left.localeCompare(right)
    })
    for (const languageCode of sortedCodes) {
      if (languageCode === preferredLanguageCode || languageCode === 'en-US') {
        continue
      }
      const candidate = readTrimmedTranslation(translations, languageCode)
      if (candidate.length > 0) {
        return {
          displayLanguageCode: languageCode,
          value: candidate
        }
      }
    }

    return {
      displayLanguageCode: null,
      value: ''
    }
  }

  function resolveFaLocaleStringTranslation (
    translations: I_faLocaleStringTranslations,
    preferredLanguageCode: T_faUserSettingsLanguageCode
  ): string {
    return resolveFaLocaleStringTranslationResolution(translations, preferredLanguageCode).value
  }

  function resolveFaLocaleStringTranslationLanguageCode (
    translations: I_faLocaleStringTranslations,
    preferredLanguageCode: T_faUserSettingsLanguageCode
  ): T_faUserSettingsLanguageCode | null {
    return resolveFaLocaleStringTranslationResolution(translations, preferredLanguageCode).displayLanguageCode
  }

  function hasFaLocaleStringTranslation (
    translations: I_faLocaleStringTranslations
  ): boolean {
    for (const languageCode of deps.languageCodes) {
      if (readTrimmedTranslation(translations, languageCode).length > 0) {
        return true
      }
    }
    return false
  }

  function resolveFaLocaleStringTranslationForStorage (
    translations: I_faLocaleStringTranslations
  ): string {
    return resolveFaLocaleStringTranslation(translations, 'en-US')
  }

  return {
    hasFaLocaleStringTranslation,
    resolveFaLocaleStringTranslation,
    resolveFaLocaleStringTranslationForStorage,
    resolveFaLocaleStringTranslationLanguageCode
  }
}
