import type { ComputedRef } from 'vue'
import { computed } from 'vue'

import type { I_dialogKeybindSettingsCaptureFieldProps } from 'app/types/I_dialogKeybindSettings'

export const DIALOG_KEYBIND_CAPTURE_HELP_LINE_KEYS = [
  'dialogs.keybindSettings.captureHelpLineCtrl',
  'dialogs.keybindSettings.captureHelpLineAlt',
  'dialogs.keybindSettings.captureHelpLineCtrlAlt',
  'dialogs.keybindSettings.captureHelpLineCtrlShift',
  'dialogs.keybindSettings.captureHelpLineAltShift',
  'dialogs.keybindSettings.captureHelpLineCtrlAltShift'
] as const

export function useDialogKeybindSettingsCaptureFieldDisplay (
  props: I_dialogKeybindSettingsCaptureFieldProps
): {
    activeFieldMessage: ComputedRef<string>
    hasError: ComputedRef<boolean>
  } {
  const hasError = computed(() => {
    return props.captureError && props.captureErrorMessage.length > 0
  })

  const activeFieldMessage = computed(() => {
    if (hasError.value) {
      return props.captureErrorMessage
    }
    return props.captureInfoMessage
  })

  return {
    activeFieldMessage,
    hasError
  }
}
