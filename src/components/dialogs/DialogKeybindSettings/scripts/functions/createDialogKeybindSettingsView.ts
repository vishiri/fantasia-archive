import type {
  T_dialogKeybindSettingsViewFactoryBindings,
  T_useDialogKeybindSettingsViewResult
} from 'app/types/I_dialogKeybindSettingsFactories'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

export function createDialogKeybindSettingsView (
  bindings: T_dialogKeybindSettingsViewFactoryBindings
): {
    useDialogKeybindSettingsView: (props: {
      directInput?: T_dialogName
    }) => T_useDialogKeybindSettingsViewResult
  } {
  const {
    useDialogKeybindSettingsViewFromDeps: useViewImpl,
    viewDeps
  } = bindings

  const useView = (props: {
    directInput?: T_dialogName
  }): T_useDialogKeybindSettingsViewResult => {
    return useViewImpl(viewDeps, props)
  }

  return {
    useDialogKeybindSettingsView: useView
  }
}
