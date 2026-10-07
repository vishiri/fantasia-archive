import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import type { T_dialogProjectSettingsUseHookDeps } from 'app/types/I_dialogProjectSettings'

import { createDialogProjectSettingsIsDirtyComputed } from './createDialogProjectSettingsIsDirtyComputedWiring'
import { createDialogProjectSettingsValidationComputeds } from './createDialogProjectSettingsValidationComputedsWiring'
import { registerDialogProjectSettingsLanguageLayoutLabelsSyncWatcher } from './dialogProjectSettingsLanguageLayoutLabelsSyncWatcher'

import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

type T_dialogProjectSettingsDialogActions = ReturnType<
  T_dialogProjectSettingsUseHookDeps['createDialogProjectSettingsDialogActions']
>
type T_dialogProjectSettingsValidation = ReturnType<typeof createDialogProjectSettingsValidationComputeds>

function assembleUseDialogProjectSettingsApi<
  TCurrentLanguageCode,
  TDialogModel,
  TDocumentName,
  TIsDirty,
  TLocalDocumentTemplates,
  TLocalSettings,
  TLocalWorlds,
  TSelectedCategoryTab
> (
  actions: T_dialogProjectSettingsDialogActions,
  validation: T_dialogProjectSettingsValidation,
  currentLanguageCode: TCurrentLanguageCode,
  dialogModel: TDialogModel,
  documentName: TDocumentName,
  isDirty: TIsDirty,
  localDocumentTemplates: TLocalDocumentTemplates,
  localSettings: TLocalSettings,
  localWorlds: TLocalWorlds,
  selectedCategoryTab: TSelectedCategoryTab
) {
  const {
    addDocumentTemplate,
    addWorld,
    removeDocumentTemplate,
    removeWorld,
    saveAndCloseDialog,
    saveWithoutClosingDialog,
    updateDocumentTemplateIcon,
    updateDocumentTemplateTitleTranslations,
    updateDocumentTemplateWorldAppendixTranslations,
    updateWorldColor,
    updateWorldColorPalette,
    updateWorldDisplayNameTranslations,
    updateWorldTemplateLayout
  } = actions
  const {
    hasDocumentTemplatesSettingsValidationError,
    hasGeneralSettingsValidationError,
    hasWorldsSettingsValidationError,
    isSaveDisabled,
    saveValidationErrorsTooltip
  } = validation
  return {
    addDocumentTemplate,
    addWorld,
    currentLanguageCode,
    dialogModel,
    documentName,
    hasDocumentTemplatesSettingsValidationError,
    hasGeneralSettingsValidationError,
    hasWorldsSettingsValidationError,
    isDirty,
    isSaveDisabled,
    localDocumentTemplates,
    localSettings,
    localWorlds,
    removeDocumentTemplate,
    removeWorld,
    saveAndCloseDialog,
    saveWithoutClosingDialog,
    saveValidationErrorsTooltip,
    selectedCategoryTab,
    updateDocumentTemplateIcon,
    updateDocumentTemplateTitleTranslations,
    updateDocumentTemplateWorldAppendixTranslations,
    updateWorldColor,
    updateWorldColorPalette,
    updateWorldDisplayNameTranslations,
    updateWorldTemplateLayout
  }
}

export function useDialogProjectSettingsImpl (
  deps: T_dialogProjectSettingsUseHookDeps,
  props: I_dialogProjectSettingsProps
) {
  const refs = deps.createDialogProjectSettingsRefs()
  deps.registerComponentDialogStackGuard(refs.dialogModel)
  const {
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    dialogModel,
    documentName,
    hadWorldTemplatePlacementsAtDialogOpen,
    localDocumentTemplates,
    localSettings,
    localWorlds,
    selectedCategoryTab
  } = refs
  const actions = deps.createDialogProjectSettingsDialogActions({
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    dialogModel,
    documentName,
    hadWorldTemplatePlacementsAtDialogOpen,
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
    hasDialogProjectSettingsWorldColorPaletteValidationError:
      deps.hasDialogProjectSettingsWorldColorPaletteValidationError,
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

  const isDirty = createDialogProjectSettingsIsDirtyComputed({
    computed: deps.computed
  }, {
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    localDocumentTemplates,
    localSettings,
    localWorlds
  })

  return assembleUseDialogProjectSettingsApi(
    actions,
    validation,
    currentLanguageCode,
    dialogModel,
    documentName,
    isDirty,
    localDocumentTemplates,
    localSettings,
    localWorlds,
    selectedCategoryTab
  )
}
