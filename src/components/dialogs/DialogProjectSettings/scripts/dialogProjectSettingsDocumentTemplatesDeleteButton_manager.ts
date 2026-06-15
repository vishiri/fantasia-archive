import { computed, onUnmounted, ref, watch } from 'vue'

import { createUseDialogProjectSettingsWorldsDeleteConfirm } from './functions/createUseDialogProjectSettingsWorldsDeleteConfirm'
import { FA_DIALOG_PROJECT_SETTINGS_DELETE_CONFIRM_DELAY_SEC } from 'app/types/I_dialogProjectSettingsDocumentTemplates'

export const useDialogProjectSettingsDocumentTemplatesDeleteConfirm =
  createUseDialogProjectSettingsWorldsDeleteConfirm({
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
