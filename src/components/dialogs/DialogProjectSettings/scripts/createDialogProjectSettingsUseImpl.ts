import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import type { T_dialogProjectSettingsUseHookDeps } from 'app/types/I_dialogProjectSettings'

import { createDialogProjectSettingsValidationComputeds } from './createDialogProjectSettingsValidationComputedsWiring'
import { registerDialogProjectSettingsLanguageLayoutLabelsSyncWatcher } from './dialogProjectSettingsLanguageLayoutLabelsSyncWatcher'

import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

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

  const currentLanguageCode = deps.computed(() => {
    return S_FaUserSettings().settings?.languageCode ?? 'en-US'
  })

  registerDialogProjectSettingsLanguageLayoutLabelsSyncWatcher({
    getCurrentLanguageCode: () => currentLanguageCode.value,
    localDocumentTemplates,
    localWorlds,
    watch: deps.watch
  })

  return {
    addDocumentTemplate: actions.addDocumentTemplate,
    addWorld: actions.addWorld,
    currentLanguageCode,
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
    updateDocumentTemplateIcon: actions.updateDocumentTemplateIcon,
    updateDocumentTemplateTitleTranslations: actions.updateDocumentTemplateTitleTranslations,
    updateDocumentTemplateWorldAppendixTranslations: actions.updateDocumentTemplateWorldAppendixTranslations,
    updateWorldColor: actions.updateWorldColor,
    updateWorldColorPallete: actions.updateWorldColorPallete,
    updateWorldDisplayNameTranslations: actions.updateWorldDisplayNameTranslations,
    updateWorldTemplateLayout: actions.updateWorldTemplateLayout
  }
}
