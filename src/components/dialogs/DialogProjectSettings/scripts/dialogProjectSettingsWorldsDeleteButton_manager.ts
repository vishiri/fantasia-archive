import { computed, onUnmounted, ref } from 'vue'

import { FA_DIALOG_PROJECT_SETTINGS_WORLD_DELETE_CONFIRM_DELAY_SEC } from 'app/types/I_dialogProjectSettingsWorlds'

import { createUseDialogProjectSettingsWorldsDeleteConfirm } from './functions/createUseDialogProjectSettingsWorldsDeleteConfirm'

export const useDialogProjectSettingsWorldsDeleteConfirm = createUseDialogProjectSettingsWorldsDeleteConfirm({
  clearInterval: (handle) => {
    clearInterval(handle)
  },
  computed,
  confirmDelaySec: FA_DIALOG_PROJECT_SETTINGS_WORLD_DELETE_CONFIRM_DELAY_SEC,
  onUnmounted,
  ref,
  setInterval: (handler, timeout) => {
    return setInterval(handler, timeout)
  }
})
