import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'

export function createNormalizeFaLocaleSingularPluralTranslations (deps: {
  normalizeMap: (translations: I_faLocaleStringTranslations) => I_faLocaleStringTranslations
}): (translations: I_faLocaleSingularPluralTranslations) => I_faLocaleSingularPluralTranslations {
  return function normalizeFaLocaleSingularPluralTranslations (
    translations: I_faLocaleSingularPluralTranslations
  ): I_faLocaleSingularPluralTranslations {
    const plural = deps.normalizeMap(translations.plural)
    const singular = deps.normalizeMap(translations.singular)
    return {
      plural,
      singular
    }
  }
}
