import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'

import { createNormalizeFaLocaleSingularPluralTranslations } from 'app/src/scripts/localeTranslations/functions/normalizeFaLocaleSingularPluralTranslations'
import { createNormalizeFaLocaleStringTranslations } from 'app/src/scripts/localeTranslations/functions/normalizeFaLocaleStringTranslations'
import { createResolveFaLocaleSingularPluralTranslation } from 'app/src/scripts/localeTranslations/functions/resolveFaLocaleSingularPluralTranslation'

const normalizeFaLocaleStringTranslations = createNormalizeFaLocaleStringTranslations({
  languageCodes: FA_USER_SETTINGS_LANGUAGE_CODES,
  maxLength: 120
})

const resolveApi = createResolveFaLocaleSingularPluralTranslation({
  languageCodes: FA_USER_SETTINGS_LANGUAGE_CODES
})

export const {
  hasFaLocaleSingularPluralTranslation,
  resolveFaLocaleSingularPluralDisplayTranslation,
  resolveFaLocaleSingularPluralDisplayTranslationForStorage,
  resolveFaLocaleSingularPluralDisplayTranslationLanguageCode,
  resolveFaLocaleSingularPluralDisplayTranslationResolution,
  resolveFaLocaleSingularPluralMissingFormsForLanguage,
  resolveFaLocaleSingularPluralMissingTranslationWarning
} = resolveApi

export const normalizeFaLocaleSingularPluralTranslations = createNormalizeFaLocaleSingularPluralTranslations({
  normalizeMap: normalizeFaLocaleStringTranslations
})
