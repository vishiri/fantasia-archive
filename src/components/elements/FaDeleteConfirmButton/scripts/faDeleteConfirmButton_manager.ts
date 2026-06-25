import { computed, onUnmounted, ref, watch } from 'vue'

import { FA_DIALOG_PROJECT_SETTINGS_DELETE_CONFIRM_DELAY_SEC } from 'app/types/I_dialogProjectSettingsDocumentTemplates'

import { createUseFaDeleteConfirmButton } from './functions/createUseFaDeleteConfirmButton'

export const useFaDeleteConfirmButton = createUseFaDeleteConfirmButton({
  clearInterval: (handle) => {
    clearInterval(handle)
  },
  computed,
  confirmDelaySec: FA_DIALOG_PROJECT_SETTINGS_DELETE_CONFIRM_DELAY_SEC,
  onUnmounted,
  ref,
  setInterval: (handler, timeout) => {
    return setInterval(handler, timeout)
  },
  watch: (source, callback) => {
    watch(source, callback)
  }
})
