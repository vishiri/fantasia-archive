import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import type { T_dialogProjectSettingsUseHookDeps } from 'app/types/I_dialogProjectSettings'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'
import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsSaveValidationTooltipContent } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'

import { useDialogProjectSettingsImpl } from './createDialogProjectSettingsUseImpl'

export function createDialogProjectSettingsUseHook (
  deps: T_dialogProjectSettingsUseHookDeps
): (props: I_dialogProjectSettingsProps) => {
    addWorld: () => void
    dialogModel: Ref<boolean>
    documentName: Ref<string>
    hasGeneralSettingsValidationError: ComputedRef<boolean>
    hasWorldsSettingsValidationError: ComputedRef<boolean>
    isSaveDisabled: ComputedRef<boolean>
    localSettings: Ref<I_faProjectSettingsRoot | null>
    localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
    removeWorld: (id: string) => void
    saveAndCloseDialog: () => Promise<void>
    saveValidationErrorsTooltip: ComputedRef<I_dialogProjectSettingsSaveValidationTooltipContent>
    selectedCategoryTab: Ref<string>
    updateWorldColor: (id: string, color: string) => void
    updateWorldColorPallete: (id: string, colorPallete: string) => void
    updateWorldDisplayName: (id: string, displayName: string) => void
  } {
  return function useDialogProjectSettings (props: I_dialogProjectSettingsProps) {
    return useDialogProjectSettingsImpl(deps, props)
  }
}
