import {
  determineCurrentImage,
  fantasiaImageList
} from 'app/src/scripts/appGlobalManagementUI/functions/fantasiaMascotImageManagement'
import { resolveHideFantasiaMascot } from 'app/src/scripts/appGlobalManagementUI/functions/resolveHideFantasiaMascot'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { storeToRefs } from 'pinia'
import { computed, toRef } from 'vue'

import { createUseFantasiaMascotImage } from './functions/createUseFantasiaMascotImage'
import {
  fantasiaMascotImageIsRandom,
  fantasiaMascotVariantName
} from './functions/fantasiaMascotImageVariant'

export const useFantasiaMascotImage = createUseFantasiaMascotImage({
  S_FaUserSettings,
  computed,
  determineCurrentImage,
  fantasiaImageList,
  fantasiaMascotImageIsRandom,
  fantasiaMascotVariantName,
  resolveHideFantasiaMascot,
  storeToRefs,
  toRef
})
