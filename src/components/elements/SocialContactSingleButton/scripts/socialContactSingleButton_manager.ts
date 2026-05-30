import { resolveVitePublicAssetPath } from 'app/src/scripts/appInternals/appInternals_manager'
import { computed, toRef } from 'vue'

import {
  socialContactSingleButtonData,
  socialContactSingleButtonIconRelativePath,
  socialContactSingleButtonImageAlt,
  socialContactSingleButtonShowLabel
} from './functions/socialContactSingleButtonPresentation'

import { createUseSocialContactSingleButton } from './functions/createUseSocialContactSingleButton'

const socialContactSingleButtonApi = createUseSocialContactSingleButton({
  computed,
  resolveVitePublicAssetPath,
  socialContactSingleButtonData,
  socialContactSingleButtonIconRelativePath,
  socialContactSingleButtonImageAlt,
  socialContactSingleButtonShowLabel,
  toRef
})

export const useSocialContactSingleButton = socialContactSingleButtonApi.useSocialContactSingleButton
