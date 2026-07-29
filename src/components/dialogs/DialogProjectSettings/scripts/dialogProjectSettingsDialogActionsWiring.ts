import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type {
  T_dialogProjectSettingsDialogActionsApi,
  T_dialogProjectSettingsDialogActionsParams
} from 'app/types/I_dialogProjectSettings'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { createDialogProjectSettingsDraftMutationHandlers } from './dialogProjectSettingsDraftMutationHandlersWiring'
import { hydrateDialogProjectSettingsDrafts } from './dialogProjectSettingsDialogHydrateWiring'
import {
  saveDialogProjectSettingsDraftAndClose,
  saveDialogProjectSettingsDraftWithoutClosing
} from './dialogProjectSettingsDialogSaveWiring'

export function createDialogProjectSettingsDialogActions (deps: {
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB: string
  faProjectDocumentTemplatesFetchFreshForDialog: () => Promise<I_dialogProjectSettingsDocumentTemplateDraft[]>
  faProjectSettingsFetchFreshForDialog: () => Promise<I_faProjectSettingsRoot>
  faProjectWorldsFetchFreshForDialog: () => Promise<I_dialogProjectSettingsWorldDraft[]>
  getCurrentLanguageCode: () => T_faUserSettingsLanguageCode
  resolveNewTemplateDefaultDisplayName: () => string
  resolveNewWorldDefaultDisplayName: () => string
  runFaActionAwait: Parameters<typeof saveDialogProjectSettingsDraftAndClose>[0]['runFaActionAwait']
}, params: T_dialogProjectSettingsDialogActionsParams): T_dialogProjectSettingsDialogActionsApi {
  const {
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    dialogModel,
    documentName,
    localDocumentTemplates,
    localSettings,
    localWorlds,
    props,
    selectedCategoryTab
  } = params

  const mutationHandlers = createDialogProjectSettingsDraftMutationHandlers(deps, {
    localDocumentTemplates,
    localWorlds
  })

  function openDialog (input: T_dialogName): void {
    documentName.value = input
    dialogModel.value = true
    selectedCategoryTab.value = deps.FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB
    void hydrateDialogProjectSettingsDrafts(deps, {
      baselineDocumentTemplates,
      baselineSettings,
      baselineWorlds,
      localDocumentTemplates,
      localSettings,
      localWorlds,
      props
    })
  }

  async function saveAndCloseDialog (): Promise<void> {
    await saveDialogProjectSettingsDraftAndClose(deps, {
      baselineDocumentTemplates,
      baselineSettings,
      baselineWorlds,
      dialogModel,
      localDocumentTemplates,
      localSettings,
      localWorlds
    })
  }

  async function saveWithoutClosingDialog (): Promise<void> {
    await saveDialogProjectSettingsDraftWithoutClosing(deps, {
      baselineDocumentTemplates,
      baselineSettings,
      baselineWorlds,
      localDocumentTemplates,
      localSettings,
      localWorlds
    })
  }

  return {
    openDialog,
    saveAndCloseDialog,
    saveWithoutClosingDialog,
    ...mutationHandlers
  }
}
