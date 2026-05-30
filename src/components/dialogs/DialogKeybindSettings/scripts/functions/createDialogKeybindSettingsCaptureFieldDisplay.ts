import type { I_computedRef } from 'app/types/I_vueCompositionShims'

import type { I_dialogKeybindSettingsCaptureFieldProps } from 'app/types/I_dialogKeybindSettings'

export function createDialogKeybindSettingsCaptureFieldDisplay (deps: {
  computed: <T>(getter: () => T) => I_computedRef<T>
}): {
    DIALOG_KEYBIND_CAPTURE_HELP_LINE_KEYS: readonly string[]
    useDialogKeybindSettingsCaptureFieldDisplay: (
      props: I_dialogKeybindSettingsCaptureFieldProps
    ) => {
      activeFieldMessage: I_computedRef<string>
      hasError: I_computedRef<boolean>
    }
  } {
  const DIALOG_KEYBIND_CAPTURE_HELP_LINE_KEYS = [
    'dialogs.keybindSettings.captureHelpLineCtrl',
    'dialogs.keybindSettings.captureHelpLineAlt',
    'dialogs.keybindSettings.captureHelpLineCtrlAlt',
    'dialogs.keybindSettings.captureHelpLineCtrlShift',
    'dialogs.keybindSettings.captureHelpLineAltShift',
    'dialogs.keybindSettings.captureHelpLineCtrlAltShift'
  ] as const

  function useDialogKeybindSettingsCaptureFieldDisplay (
    props: I_dialogKeybindSettingsCaptureFieldProps
  ): {
      activeFieldMessage: I_computedRef<string>
      hasError: I_computedRef<boolean>
    } {
    const hasError = deps.computed(() => {
      return props.captureError && props.captureErrorMessage.length > 0
    })

    const activeFieldMessage = deps.computed(() => {
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

  return {
    DIALOG_KEYBIND_CAPTURE_HELP_LINE_KEYS,
    useDialogKeybindSettingsCaptureFieldDisplay
  }
}
