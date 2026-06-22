import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'

export function createNormalizeFaLocaleSingularPluralTranslations (deps: {
  normalizeMap: (translations: I_faLocaleStringTranslations) => I_faLocaleStringTranslations
}): (translations: I_faLocaleSingularPluralTranslations) => I_faLocaleSingularPluralTranslations {
  return function normalizeFaLocaleSingularPluralTranslations (
    translations: I_faLocaleSingularPluralTranslations
  ): I_faLocaleSingularPluralTranslations {
    return {
      plural: deps.normalizeMap(translations.plural),
      singular: deps.normalizeMap(translations.singular)
    }
  }
}
