import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import { createUseProjectDocumentControlBar } from '../functions/createUseProjectDocumentControlBar'

export const useProjectDocumentControlBar = createUseProjectDocumentControlBar({
  computed,
  S_FaUserSettings,
  storeToRefs
})
