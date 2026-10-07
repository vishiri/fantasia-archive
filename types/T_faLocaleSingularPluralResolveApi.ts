import type { I_faLocaleSingularPluralMissingTranslationWarning, T_faLocaleSingularPluralMissingForm } from 'app/types/I_faLocaleSingularPluralMissingTranslationWarning'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { T_faLocaleSingularPluralUsedForm } from 'app/types/T_faLocaleSingularPluralUsedForm'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

/** Singular/plural locale resolvers closed over the supported language list. */
export type T_faLocaleSingularPluralResolveApi = {
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
}
