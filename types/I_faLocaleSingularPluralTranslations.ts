import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'

/** Per-locale singular and plural user-facing strings keyed by interface language code. */
export interface I_faLocaleSingularPluralTranslations {
  plural: I_faLocaleStringTranslations
  singular: I_faLocaleStringTranslations
}
