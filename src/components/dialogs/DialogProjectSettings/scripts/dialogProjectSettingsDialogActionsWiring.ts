import { Notify } from 'quasar'

import { i18n } from 'app/i18n/externalFileLoader'
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

function reportDialogProjectSettingsLoadFailure (error: unknown): void {
  console.error('[DialogProjectSettings] load settings failed', error)
  Notify.create({
    faSkipNotifyConsoleLog: true,
    group: false,
    message: i18n.global.t('dialogs.projectSettings.loadError'),
    type: 'negative'
  })
}

export function createDialogProjectSettingsDialogActions (deps: {
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB: string
  consumeProjectSettingsInitialTab: () => string | null
  faProjectDocumentTemplatesFetchFreshForDialog: () => Promise<I_dialogProjectSettingsDocumentTemplateDraft[]>
  faProjectSettingsFetchFreshForDialog: () => Promise<I_faProjectSettingsRoot>
  faProjectWorldsFetchFreshForDialog: () => Promise<I_dialogProjectSettingsWorldDraft[]>
  getCurrentLanguageCode: () => T_faUserSettingsLanguageCode
  patchHideHierarchyTreeSilently: (hideHierarchyTree: boolean) => Promise<void>
  readProjectContentEpoch?: () => number
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
    hadWorldTemplatePlacementsAtDialogOpen,
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

  let projectSettingsOpenGeneration = 0

  function openDialog (input: T_dialogName): void {
    projectSettingsOpenGeneration += 1
    const openGeneration = projectSettingsOpenGeneration
    const isStillCurrent = (): boolean => openGeneration === projectSettingsOpenGeneration
    documentName.value = input
    dialogModel.value = true
    const initialTab = deps.consumeProjectSettingsInitialTab()
    selectedCategoryTab.value = initialTab ?? deps.FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB
    void hydrateDialogProjectSettingsDrafts({
      ...deps,
      isStillCurrent
    }, {
      baselineDocumentTemplates,
      baselineSettings,
      baselineWorlds,
      hadWorldTemplatePlacementsAtDialogOpen,
      localDocumentTemplates,
      localSettings,
      localWorlds,
      props
    }).catch((error: unknown) => {
      if (!isStillCurrent()) {
        return
      }
      localSettings.value = null
      localWorlds.value = null
      localDocumentTemplates.value = null
      baselineSettings.value = null
      baselineWorlds.value = null
      baselineDocumentTemplates.value = null
      hadWorldTemplatePlacementsAtDialogOpen.value = false
      reportDialogProjectSettingsLoadFailure(error)
    })
  }

  async function saveAndCloseDialog (): Promise<void> {
    await saveDialogProjectSettingsDraftAndClose(deps, {
      baselineDocumentTemplates,
      baselineSettings,
      baselineWorlds,
      dialogModel,
      hadWorldTemplatePlacementsAtDialogOpen,
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
      hadWorldTemplatePlacementsAtDialogOpen,
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
