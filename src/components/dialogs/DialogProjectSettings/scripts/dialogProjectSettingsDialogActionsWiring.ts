import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { Ref } from 'app/types/I_vueCompositionRefs'

import { createDialogProjectSettingsDraftMutationHandlers } from './dialogProjectSettingsDraftMutationHandlersWiring'
import { hydrateDialogProjectSettingsDrafts } from './dialogProjectSettingsDialogHydrateWiring'
import { saveDialogProjectSettingsDraftAndClose } from './dialogProjectSettingsDialogSaveWiring'

export function createDialogProjectSettingsDialogActions (deps: {
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB: string
  faProjectDocumentTemplatesFetchFreshForDialog: () => Promise<I_dialogProjectSettingsDocumentTemplateDraft[]>
  faProjectSettingsFetchFreshForDialog: () => Promise<I_faProjectSettingsRoot>
  faProjectWorldsFetchFreshForDialog: () => Promise<I_dialogProjectSettingsWorldDraft[]>
  newTemplateDefaultDisplayName: string
  newWorldDefaultDisplayName: string
  runFaActionAwait: Parameters<typeof saveDialogProjectSettingsDraftAndClose>[0]['runFaActionAwait']
}, params: {
  dialogModel: Ref<boolean>
  documentName: Ref<string>
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  props: I_dialogProjectSettingsProps
  selectedCategoryTab: Ref<string>
}): {
    addDocumentTemplate: () => void
    addWorld: () => void
    openDialog: (input: T_dialogName) => void
    removeDocumentTemplate: (id: string) => void
    removeWorld: (id: string) => void
    saveAndCloseDialog: () => Promise<void>
    updateDocumentTemplateDisplayName: (id: string, displayName: string) => void
    updateDocumentTemplateIcon: (id: string, icon: string) => void
    updateDocumentTemplateWorldAppendix: (id: string, worldAppendix: string) => void
    updateWorldColor: (id: string, color: string) => void
    updateWorldColorPallete: (id: string, colorPallete: string) => void
    updateWorldDisplayName: (id: string, displayName: string) => void
  } {
  const {
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
      localDocumentTemplates,
      localSettings,
      localWorlds,
      props
    })
  }

  async function saveAndCloseDialog (): Promise<void> {
    await saveDialogProjectSettingsDraftAndClose(deps, {
      dialogModel,
      localDocumentTemplates,
      localSettings,
      localWorlds
    })
  }

  return {
    openDialog,
    saveAndCloseDialog,
    ...mutationHandlers
  }
}
