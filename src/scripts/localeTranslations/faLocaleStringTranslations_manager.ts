import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'

import { createNormalizeFaLocaleStringTranslations } from './functions/normalizeFaLocaleStringTranslations'
import { createResolveFaLocaleStringTranslation } from './functions/resolveFaLocaleStringTranslation'

const resolveApi = createResolveFaLocaleStringTranslation({
  languageCodes: FA_USER_SETTINGS_LANGUAGE_CODES
})

export const {
  hasFaLocaleStringTranslation,
  resolveFaLocaleStringTranslation,
  resolveFaLocaleStringTranslationForStorage,
  resolveFaLocaleStringTranslationLanguageCode
} = resolveApi

export const createNormalizeFaLocaleStringTranslationsForMaxLength =
  createNormalizeFaLocaleStringTranslations
