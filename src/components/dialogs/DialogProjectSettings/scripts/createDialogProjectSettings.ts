import type { I_dialogComponentStoreLike } from 'app/types/I_dialogComponentStoreLike'
import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import type { T_dialogProjectSettingsUseHookDeps } from 'app/types/I_dialogProjectSettings'

import type { useDialogProjectSettingsImpl } from './createDialogProjectSettingsUseImpl'

export function createDialogProjectSettings (deps: {
  S_DialogComponent: () => I_dialogComponentStoreLike
  createDialogProjectSettingsUseHook: (
    hookDeps: T_dialogProjectSettingsUseHookDeps
  ) => (props: I_dialogProjectSettingsProps) => ReturnType<typeof useDialogProjectSettingsImpl>
} & T_dialogProjectSettingsUseHookDeps) {
  function resolveDialogComponentStore (): I_dialogComponentStoreLike | null {
    try {
      return deps.S_DialogComponent()
    } catch {
      return null
    }
  }

  const {
    S_DialogComponent: _S_DialogComponent,
    createDialogProjectSettingsUseHook,
    ...hookDeps
  } = deps

  const useDialogProjectSettings = createDialogProjectSettingsUseHook(hookDeps)

  return {
    resolveDialogComponentStore,
    createDialogProjectSettingsDialogActions: hookDeps.createDialogProjectSettingsDialogActions,
    registerDialogProjectSettingsWatchers: hookDeps.registerDialogProjectSettingsWatchers,
    useDialogProjectSettings
  }
}
