import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { T_dialogProjectSettingsUseHookDeps } from 'app/types/I_dialogProjectSettings'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'
import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsSaveValidationTooltipContent } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'

export function createDialogProjectSettingsValidationComputeds (deps: {
  buildDialogProjectSettingsSaveValidationTooltipForDraft: T_dialogProjectSettingsUseHookDeps['buildDialogProjectSettingsSaveValidationTooltipForDraft']
  computed: T_dialogProjectSettingsUseHookDeps['computed']
  hasDialogProjectSettingsDocumentTemplateNameValidationError: T_dialogProjectSettingsUseHookDeps['hasDialogProjectSettingsDocumentTemplateNameValidationError']
  hasDialogProjectSettingsWorldColorPalleteValidationError: T_dialogProjectSettingsUseHookDeps['hasDialogProjectSettingsWorldColorPalleteValidationError']
  hasDialogProjectSettingsWorldNameValidationError: T_dialogProjectSettingsUseHookDeps['hasDialogProjectSettingsWorldNameValidationError']
  isDialogProjectSettingsFullDialogSaveDisabled: T_dialogProjectSettingsUseHookDeps['isDialogProjectSettingsFullDialogSaveDisabled']
  isDialogProjectSettingsProjectNameInvalid: T_dialogProjectSettingsUseHookDeps['isDialogProjectSettingsProjectNameInvalid']
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
}): {
    hasDocumentTemplatesSettingsValidationError: ComputedRef<boolean>
    hasGeneralSettingsValidationError: ComputedRef<boolean>
    hasWorldsSettingsValidationError: ComputedRef<boolean>
    isSaveDisabled: ComputedRef<boolean>
    saveValidationErrorsTooltip: ComputedRef<I_dialogProjectSettingsSaveValidationTooltipContent>
  } {
  const hasGeneralSettingsValidationError = deps.computed(() => {
    const name = deps.localSettings.value?.projectName ?? ''
    return deps.isDialogProjectSettingsProjectNameInvalid(name)
  })

  const hasWorldsSettingsValidationError = deps.computed(() => {
    return deps.hasDialogProjectSettingsWorldNameValidationError(deps.localWorlds.value) ||
      deps.hasDialogProjectSettingsWorldColorPalleteValidationError(deps.localWorlds.value)
  })

  const hasDocumentTemplatesSettingsValidationError = deps.computed(() => {
    return deps.hasDialogProjectSettingsDocumentTemplateNameValidationError(
      deps.localDocumentTemplates.value
    )
  })

  const isSaveDisabled = deps.computed(() => {
    const name = deps.localSettings.value?.projectName ?? ''
    return deps.isDialogProjectSettingsFullDialogSaveDisabled(
      name,
      deps.localWorlds.value,
      deps.localDocumentTemplates.value
    )
  })

  const saveValidationErrorsTooltip = deps.computed(() => {
    const name = deps.localSettings.value?.projectName ?? ''
    return deps.buildDialogProjectSettingsSaveValidationTooltipForDraft(
      name,
      deps.localWorlds.value,
      deps.localDocumentTemplates.value
    )
  })

  return {
    hasDocumentTemplatesSettingsValidationError,
    hasGeneralSettingsValidationError,
    hasWorldsSettingsValidationError,
    isSaveDisabled,
    saveValidationErrorsTooltip
  }
}
