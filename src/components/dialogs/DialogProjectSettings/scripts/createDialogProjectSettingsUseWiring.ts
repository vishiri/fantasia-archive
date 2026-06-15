import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import type { T_dialogProjectSettingsUseHookDeps } from 'app/types/I_dialogProjectSettings'

import { useDialogProjectSettingsImpl } from './createDialogProjectSettingsUseImpl'

export function createDialogProjectSettingsUseHook (
  deps: T_dialogProjectSettingsUseHookDeps
): (props: I_dialogProjectSettingsProps) => ReturnType<typeof useDialogProjectSettingsImpl> {
  return function useDialogProjectSettings (props: I_dialogProjectSettingsProps) {
    return useDialogProjectSettingsImpl(deps, props)
  }
}
