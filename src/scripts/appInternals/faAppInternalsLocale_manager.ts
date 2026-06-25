import { i18n } from 'app/i18n/externalFileLoader'

import { applyFaInterfaceTextDirectionFromLanguageCode } from './faInterfaceTextDirectionApplyWiring'
import { createFaAppInternalsLocale } from './functions/createFaAppInternalsLocale'

const faAppInternalsLocaleApi = createFaAppInternalsLocale({
  applyFaInterfaceTextDirectionFromLanguageCode,
  i18n
})

export const applyFaI18nLocaleFromLanguageCode =
  faAppInternalsLocaleApi.applyFaI18nLocaleFromLanguageCode

export const applyFaUserSettingsLanguageSelection =
  faAppInternalsLocaleApi.applyFaUserSettingsLanguageSelection
