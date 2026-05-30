import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

import type { T_createDialogKeybindSettingsCaptureResult } from 'app/types/I_dialogKeybindSettings'
import type { T_dialogKeybindSettingsCaptureFactoryBindings } from 'app/types/I_dialogKeybindSettingsFactories'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'

export function createDialogKeybindSettingsCapture (
  bindings: T_dialogKeybindSettingsCaptureFactoryBindings
): {
    createDialogKeybindSettingsCapture: (params: {
      platform: I_computedRef<NodeJS.Platform>
      t: (key: string) => string
      workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
    }) => T_createDialogKeybindSettingsCaptureResult
  } {
  const {
    captureDeps,
    createDialogKeybindSettingsCaptureInstance: createInstanceImpl
  } = bindings

  const createInner = (params: {
    platform: I_computedRef<NodeJS.Platform>
    t: (key: string) => string
    workingOverrides: I_ref<I_faKeybindsRoot['overrides']>
  }): T_createDialogKeybindSettingsCaptureResult => {
    return createInstanceImpl(captureDeps, params)
  }

  return {
    createDialogKeybindSettingsCapture: createInner
  }
}
