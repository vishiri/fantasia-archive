import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import type { T_dialogProjectSettingsUseHookDeps } from 'app/types/I_dialogProjectSettings'

import { createDialogProjectSettingsValidationComputeds } from './createDialogProjectSettingsValidationComputedsWiring'

export function useDialogProjectSettingsImpl (
  deps: T_dialogProjectSettingsUseHookDeps,
  props: I_dialogProjectSettingsProps
) {
  const refs = deps.createDialogProjectSettingsRefs()
  deps.registerComponentDialogStackGuard(refs.dialogModel)
  const {
    dialogModel,
    documentName,
    localDocumentTemplates,
    localSettings,
    localWorlds,
    selectedCategoryTab
  } = refs
  const actions = deps.createDialogProjectSettingsDialogActions({
    dialogModel,
    documentName,
    localDocumentTemplates,
    localSettings,
    localWorlds,
    props,
    selectedCategoryTab
  })
  deps.registerDialogProjectSettingsWatchers({
    openDialog: actions.openDialog,
    props
  })

  const validation = createDialogProjectSettingsValidationComputeds({
    buildDialogProjectSettingsSaveValidationTooltipForDraft:
      deps.buildDialogProjectSettingsSaveValidationTooltipForDraft,
    computed: deps.computed,
    hasDialogProjectSettingsDocumentTemplateNameValidationError:
      deps.hasDialogProjectSettingsDocumentTemplateNameValidationError,
    hasDialogProjectSettingsWorldColorPalleteValidationError:
      deps.hasDialogProjectSettingsWorldColorPalleteValidationError,
    hasDialogProjectSettingsWorldNameValidationError: deps.hasDialogProjectSettingsWorldNameValidationError,
    hasDialogProjectSettingsWorldTemplateLayoutValidationError:
      deps.hasDialogProjectSettingsWorldTemplateLayoutValidationError,
    isDialogProjectSettingsFullDialogSaveDisabled: deps.isDialogProjectSettingsFullDialogSaveDisabled,
    isDialogProjectSettingsProjectNameInvalid: deps.isDialogProjectSettingsProjectNameInvalid,
    localDocumentTemplates,
    localSettings,
    localWorlds
  })

  return {
    addDocumentTemplate: actions.addDocumentTemplate,
    addWorld: actions.addWorld,
    dialogModel,
    documentName,
    hasDocumentTemplatesSettingsValidationError: validation.hasDocumentTemplatesSettingsValidationError,
    hasGeneralSettingsValidationError: validation.hasGeneralSettingsValidationError,
    hasWorldsSettingsValidationError: validation.hasWorldsSettingsValidationError,
    isSaveDisabled: validation.isSaveDisabled,
    localDocumentTemplates,
    localSettings,
    localWorlds,
    removeDocumentTemplate: actions.removeDocumentTemplate,
    removeWorld: actions.removeWorld,
    saveAndCloseDialog: actions.saveAndCloseDialog,
    saveValidationErrorsTooltip: validation.saveValidationErrorsTooltip,
    selectedCategoryTab,
    updateDocumentTemplateDisplayName: actions.updateDocumentTemplateDisplayName,
    updateDocumentTemplateIcon: actions.updateDocumentTemplateIcon,
    updateDocumentTemplateWorldAppendix: actions.updateDocumentTemplateWorldAppendix,
    updateWorldColor: actions.updateWorldColor,
    updateWorldColorPallete: actions.updateWorldColorPallete,
    updateWorldDisplayName: actions.updateWorldDisplayName,
    updateWorldTemplateLayout: actions.updateWorldTemplateLayout
  }
}
