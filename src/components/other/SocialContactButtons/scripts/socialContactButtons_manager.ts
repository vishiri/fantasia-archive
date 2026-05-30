import { i18n } from 'app/i18n/externalFileLoader'
import { computed } from 'vue'

import { socialContactButtonStaticConfig } from '../_data/buttons'

import { buildSocialContactButtonList } from './functions/buildSocialContactButtonList'
import { createSocialContactButtons } from './functions/createSocialContactButtons'

const socialContactButtonsApi = createSocialContactButtons({
  buildSocialContactButtonList,
  computed,
  getLocaleValue: () => i18n.global.locale.value,
  socialContactButtonStaticConfig,
  t: (messageKey) => i18n.global.t(messageKey)
})

export const getSocialContactButtonListForCurrentLocale =
  socialContactButtonsApi.getSocialContactButtonListForCurrentLocale

export const useSocialContactButtons = socialContactButtonsApi.useSocialContactButtons
