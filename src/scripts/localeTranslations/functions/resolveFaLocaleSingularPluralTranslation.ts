import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleSingularPluralMissingTranslationWarning, T_faLocaleSingularPluralMissingForm } from 'app/types/I_faLocaleSingularPluralMissingTranslationWarning'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { T_faLocaleSingularPluralUsedForm } from 'app/types/T_faLocaleSingularPluralUsedForm'
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

function isMissingActiveLocaleTranslation (
  translations: I_faLocaleStringTranslations,
  languageCode: T_faUserSettingsLanguageCode
): boolean {
  return readTrimmedTranslation(translations, languageCode).length === 0
}

function buildFaLocaleSingularPluralLanguageChain (
  languageCodes: readonly T_faUserSettingsLanguageCode[],
  preferredLanguageCode: T_faUserSettingsLanguageCode
): T_faUserSettingsLanguageCode[] {
  const chain: T_faUserSettingsLanguageCode[] = [preferredLanguageCode]
  if (preferredLanguageCode !== 'en-US') {
    chain.push('en-US')
  }
  const sortedCodes = [...languageCodes].sort((left, right) => {
    return left.localeCompare(right)
  })
  for (const languageCode of sortedCodes) {
    if (languageCode === preferredLanguageCode || languageCode === 'en-US') {
      continue
    }
    chain.push(languageCode)
  }
  return chain
}

function resolveFaLocaleSingularPluralForLocale (
  translations: I_faLocaleSingularPluralTranslations,
  languageCode: T_faUserSettingsLanguageCode
): {
    usedForm: T_faLocaleSingularPluralUsedForm
    value: string
  } {
  const plural = readTrimmedTranslation(translations.plural, languageCode)
  if (plural.length > 0) {
    return {
      usedForm: 'plural',
      value: plural
    }
  }
  const singular = readTrimmedTranslation(translations.singular, languageCode)
  if (singular.length > 0) {
    return {
      usedForm: 'singular',
      value: singular
    }
  }
  return {
    usedForm: null,
    value: ''
  }
}

function resolveFaLocaleSingularPluralDisplayTranslationResolution (
  languageCodes: readonly T_faUserSettingsLanguageCode[],
  translations: I_faLocaleSingularPluralTranslations,
  preferredLanguageCode: T_faUserSettingsLanguageCode
): {
    displayLanguageCode: T_faUserSettingsLanguageCode | null
    usedForm: T_faLocaleSingularPluralUsedForm
    value: string
  } {
  const chain = buildFaLocaleSingularPluralLanguageChain(languageCodes, preferredLanguageCode)
  for (const languageCode of chain) {
    const resolved = resolveFaLocaleSingularPluralForLocale(translations, languageCode)
    if (resolved.value.length > 0) {
      return {
        displayLanguageCode: languageCode,
        usedForm: resolved.usedForm,
        value: resolved.value
      }
    }
  }
  return {
    displayLanguageCode: null,
    usedForm: null,
    value: ''
  }
}

function resolveFaLocaleSingularPluralDisplayTranslation (
  languageCodes: readonly T_faUserSettingsLanguageCode[],
  translations: I_faLocaleSingularPluralTranslations,
  preferredLanguageCode: T_faUserSettingsLanguageCode
): string {
  return resolveFaLocaleSingularPluralDisplayTranslationResolution(
    languageCodes,
    translations,
    preferredLanguageCode
  ).value
}

function resolveFaLocaleSingularPluralDisplayTranslationLanguageCode (
  languageCodes: readonly T_faUserSettingsLanguageCode[],
  translations: I_faLocaleSingularPluralTranslations,
  preferredLanguageCode: T_faUserSettingsLanguageCode
): T_faUserSettingsLanguageCode | null {
  return resolveFaLocaleSingularPluralDisplayTranslationResolution(
    languageCodes,
    translations,
    preferredLanguageCode
  ).displayLanguageCode
}

function resolveFaLocaleSingularPluralDisplayTranslationForStorage (
  languageCodes: readonly T_faUserSettingsLanguageCode[],
  translations: I_faLocaleSingularPluralTranslations
): string {
  return resolveFaLocaleSingularPluralDisplayTranslation(languageCodes, translations, 'en-US')
}

function hasFaLocaleSingularPluralTranslation (
  languageCodes: readonly T_faUserSettingsLanguageCode[],
  translations: I_faLocaleSingularPluralTranslations
): boolean {
  for (const languageCode of languageCodes) {
    if (readTrimmedTranslation(translations.plural, languageCode).length > 0) {
      return true
    }
    if (readTrimmedTranslation(translations.singular, languageCode).length > 0) {
      return true
    }
  }
  return false
}

function resolveFaLocaleSingularPluralMissingFormsForLanguage (
  translations: I_faLocaleSingularPluralTranslations,
  languageCode: T_faUserSettingsLanguageCode
): T_faLocaleSingularPluralMissingForm | null {
  const singularMissing = isMissingActiveLocaleTranslation(translations.singular, languageCode)
  const pluralMissing = isMissingActiveLocaleTranslation(translations.plural, languageCode)
  if (!singularMissing && !pluralMissing) {
    return null
  }
  if (singularMissing && pluralMissing) {
    return 'both'
  }
  if (pluralMissing) {
    return 'plural'
  }
  return 'singular'
}

function resolveFaLocaleSingularPluralMissingTranslationWarning (
  languageCodes: readonly T_faUserSettingsLanguageCode[],
  translations: I_faLocaleSingularPluralTranslations,
  languageCode: T_faUserSettingsLanguageCode
): I_faLocaleSingularPluralMissingTranslationWarning | null {
  const missingForm = resolveFaLocaleSingularPluralMissingFormsForLanguage(
    translations,
    languageCode
  )
  if (missingForm === null) {
    return null
  }
  const resolution = resolveFaLocaleSingularPluralDisplayTranslationResolution(
    languageCodes,
    translations,
    languageCode
  )
  const fallbackLanguageCode =
    resolution.displayLanguageCode !== null && resolution.displayLanguageCode !== languageCode
      ? resolution.displayLanguageCode
      : null
  return {
    fallbackLanguageCode,
    missingForm
  }
}

export function createResolveFaLocaleSingularPluralTranslation (deps: {
  languageCodes: readonly T_faUserSettingsLanguageCode[]
}): {
    hasFaLocaleSingularPluralTranslation: (
      translations: I_faLocaleSingularPluralTranslations
    ) => boolean
    resolveFaLocaleSingularPluralDisplayTranslation: (
      translations: I_faLocaleSingularPluralTranslations,
      preferredLanguageCode: T_faUserSettingsLanguageCode
    ) => string
    resolveFaLocaleSingularPluralDisplayTranslationForStorage: (
      translations: I_faLocaleSingularPluralTranslations
    ) => string
    resolveFaLocaleSingularPluralDisplayTranslationLanguageCode: (
      translations: I_faLocaleSingularPluralTranslations,
      preferredLanguageCode: T_faUserSettingsLanguageCode
    ) => T_faUserSettingsLanguageCode | null
    resolveFaLocaleSingularPluralDisplayTranslationResolution: (
      translations: I_faLocaleSingularPluralTranslations,
      preferredLanguageCode: T_faUserSettingsLanguageCode
    ) => {
      displayLanguageCode: T_faUserSettingsLanguageCode | null
      usedForm: T_faLocaleSingularPluralUsedForm
      value: string
    }
    resolveFaLocaleSingularPluralMissingFormsForLanguage: (
      translations: I_faLocaleSingularPluralTranslations,
      languageCode: T_faUserSettingsLanguageCode
    ) => T_faLocaleSingularPluralMissingForm | null
    resolveFaLocaleSingularPluralMissingTranslationWarning: (
      translations: I_faLocaleSingularPluralTranslations,
      languageCode: T_faUserSettingsLanguageCode
    ) => I_faLocaleSingularPluralMissingTranslationWarning | null
  } {
  const languageCodes = deps.languageCodes

  return {
    hasFaLocaleSingularPluralTranslation: (translations) => {
      return hasFaLocaleSingularPluralTranslation(languageCodes, translations)
    },
    resolveFaLocaleSingularPluralDisplayTranslation: (translations, preferredLanguageCode) => {
      return resolveFaLocaleSingularPluralDisplayTranslation(
        languageCodes,
        translations,
        preferredLanguageCode
      )
    },
    resolveFaLocaleSingularPluralDisplayTranslationForStorage: (translations) => {
      return resolveFaLocaleSingularPluralDisplayTranslationForStorage(languageCodes, translations)
    },
    resolveFaLocaleSingularPluralDisplayTranslationLanguageCode: (translations, preferredLanguageCode) => {
      return resolveFaLocaleSingularPluralDisplayTranslationLanguageCode(
        languageCodes,
        translations,
        preferredLanguageCode
      )
    },
    resolveFaLocaleSingularPluralDisplayTranslationResolution: (translations, preferredLanguageCode) => {
      return resolveFaLocaleSingularPluralDisplayTranslationResolution(
        languageCodes,
        translations,
        preferredLanguageCode
      )
    },
    resolveFaLocaleSingularPluralMissingFormsForLanguage,
    resolveFaLocaleSingularPluralMissingTranslationWarning: (translations, languageCode) => {
      return resolveFaLocaleSingularPluralMissingTranslationWarning(
        languageCodes,
        translations,
        languageCode
      )
    }
  }
}
