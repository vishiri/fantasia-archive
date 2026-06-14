import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import type { T_dialogProjectSettingsUseHookDeps } from 'app/types/I_dialogProjectSettings'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'
import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsSaveValidationTooltipContent } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'

export function useDialogProjectSettingsImpl (
  deps: T_dialogProjectSettingsUseHookDeps,
  props: I_dialogProjectSettingsProps
): {
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
  const refs = deps.createDialogProjectSettingsRefs()
  deps.registerComponentDialogStackGuard(refs.dialogModel)
  const {
    dialogModel,
    documentName,
    localSettings,
    localWorlds,
    selectedCategoryTab
  } = refs
  const actions = deps.createDialogProjectSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    localWorlds,
    props,
    selectedCategoryTab
  })
  deps.registerDialogProjectSettingsWatchers({
    openDialog: actions.openDialog,
    props
  })

  const hasGeneralSettingsValidationError = deps.computed(() => {
    const name = localSettings.value?.projectName ?? ''
    return deps.isDialogProjectSettingsProjectNameInvalid(name)
  })

  const hasWorldsSettingsValidationError = deps.computed(() => {
    return deps.hasDialogProjectSettingsWorldNameValidationError(localWorlds.value) ||
      deps.hasDialogProjectSettingsWorldColorPalleteValidationError(localWorlds.value)
  })

  const isSaveDisabled = deps.computed(() => {
    const name = localSettings.value?.projectName ?? ''
    return deps.isDialogProjectSettingsDialogSaveDisabled(name, localWorlds.value)
  })

  const saveValidationErrorsTooltip = deps.computed(() => {
    const name = localSettings.value?.projectName ?? ''
    return deps.buildDialogProjectSettingsSaveValidationTooltipForDraft(name, localWorlds.value)
  })

  return {
    addWorld: actions.addWorld,
    dialogModel,
    documentName,
    hasGeneralSettingsValidationError,
    hasWorldsSettingsValidationError,
    isSaveDisabled,
    localSettings,
    localWorlds,
    removeWorld: actions.removeWorld,
    saveAndCloseDialog: actions.saveAndCloseDialog,
    saveValidationErrorsTooltip,
    selectedCategoryTab,
    updateWorldColor: actions.updateWorldColor,
    updateWorldColorPallete: actions.updateWorldColorPallete,
    updateWorldDisplayName: actions.updateWorldDisplayName
  }
}
