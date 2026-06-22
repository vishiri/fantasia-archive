import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

/** Missing singular/plural forms for the active UI language. */
export type T_faLocaleSingularPluralMissingForm = 'singular' | 'plural' | 'both'

/** Structured missing-translation warning for singular/plural locale maps. */
export interface I_faLocaleSingularPluralMissingTranslationWarning {
  fallbackLanguageCode: T_faUserSettingsLanguageCode | null
  missingForm: T_faLocaleSingularPluralMissingForm
}
