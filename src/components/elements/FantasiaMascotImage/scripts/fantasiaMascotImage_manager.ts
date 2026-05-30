import {
  determineCurrentImage,
  fantasiaImageList
} from 'app/src/scripts/appGlobalManagementUI/functions/fantasiaMascotImageManagement'
import { computed, toRef } from 'vue'

import { createUseFantasiaMascotImage } from './functions/createUseFantasiaMascotImage'
import {
  fantasiaMascotImageIsRandom,
  fantasiaMascotVariantName
} from './functions/fantasiaMascotImageVariant'

export const useFantasiaMascotImage = createUseFantasiaMascotImage({
  computed,
  determineCurrentImage,
  fantasiaImageList,
  fantasiaMascotImageIsRandom,
  fantasiaMascotVariantName,
  toRef
})
