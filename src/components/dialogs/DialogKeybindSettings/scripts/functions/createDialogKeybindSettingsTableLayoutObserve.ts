import type { I_ref } from 'app/types/I_vueCompositionShims'

import type {
  T_dialogKeybindSettingsTableLayoutObserveApi,
  T_dialogKeybindSettingsTableLayoutObserveFactoryBindings
} from 'app/types/I_dialogKeybindSettingsFactories'

export function createDialogKeybindSettingsTableLayoutObserve (
  bindings: T_dialogKeybindSettingsTableLayoutObserveFactoryBindings
): T_dialogKeybindSettingsTableLayoutObserveApi {
  const {
    layoutObserveDeps,
    resolveDialogKeybindSettingsBodySectionHTMLElement: resolveBodySectionImpl,
    useDialogKeybindSettingsTableChrome: useTableChromeImpl,
    useDialogKeybindSettingsTableLayout: useTableLayoutImpl
  } = bindings

  const useTableLayout = (
    args: Parameters<T_dialogKeybindSettingsTableLayoutObserveApi['useDialogKeybindSettingsTableLayout']>[0]
  ): ReturnType<T_dialogKeybindSettingsTableLayoutObserveApi['useDialogKeybindSettingsTableLayout']> => {
    return useTableLayoutImpl(layoutObserveDeps, args)
  }

  const useTableChrome = (
    dialogModel: I_ref<boolean>
  ): ReturnType<T_dialogKeybindSettingsTableLayoutObserveApi['useDialogKeybindSettingsTableChrome']> => {
    return useTableChromeImpl(layoutObserveDeps, dialogModel)
  }

  return {
    resolveDialogKeybindSettingsBodySectionHTMLElement: resolveBodySectionImpl,
    useDialogKeybindSettingsTableChrome: useTableChrome,
    useDialogKeybindSettingsTableLayout: useTableLayout
  }
}
