import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'
import { FA_PROJECT_WORLD_DISPLAY_NAME_TRANSLATION_MAX_LENGTH } from 'app/types/I_faProjectWorldDisplayNameTranslations'

import { createNormalizeFaLocaleStringTranslations } from 'app/src/scripts/localeTranslations/functions/normalizeFaLocaleStringTranslations'
import { createResolveFaLocaleStringTranslation } from 'app/src/scripts/localeTranslations/functions/resolveFaLocaleStringTranslation'

const resolveApi = createResolveFaLocaleStringTranslation({
  languageCodes: FA_USER_SETTINGS_LANGUAGE_CODES
})

const normalizeFaProjectWorldDisplayNames = createNormalizeFaLocaleStringTranslations({
  languageCodes: FA_USER_SETTINGS_LANGUAGE_CODES,
  maxLength: FA_PROJECT_WORLD_DISPLAY_NAME_TRANSLATION_MAX_LENGTH
})

export const {
  hasFaLocaleStringTranslation: hasFaProjectWorldDisplayNameTranslation,
  resolveFaLocaleStringTranslation: resolveFaProjectWorldDisplayName,
  resolveFaLocaleStringTranslationForStorage: resolveFaProjectWorldDisplayNameForStorage,
  resolveFaLocaleStringTranslationLanguageCode: resolveFaProjectWorldDisplayNameLanguageCode
} = resolveApi

export const normalizeFaProjectWorldDisplayNameTranslations = normalizeFaProjectWorldDisplayNames
