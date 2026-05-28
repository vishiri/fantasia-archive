import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { faProjectSettingsFetchFreshForDialog } from 'app/src/stores/scripts/sFaProjectSettingsBridge'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun'
import { type Ref } from 'vue'

import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import { FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB } from './dialogProjectSettingsConstants'

export function createDialogProjectSettingsDialogActions (params: {
  dialogModel: Ref<boolean>
  documentName: Ref<string>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  props: I_dialogProjectSettingsProps
  selectedCategoryTab: Ref<string>
}): {
    openDialog: (input: T_dialogName) => void
    saveAndCloseDialog: () => Promise<void>
  } {
  const {
    dialogModel,
    documentName,
    localSettings,
    props,
    selectedCategoryTab
  } = params

  async function hydrateLocalSettingsFromDatabase (): Promise<void> {
    const snapshot = await faProjectSettingsFetchFreshForDialog()
    localSettings.value = { ...snapshot }
  }

  function openDialog (input: T_dialogName): void {
    documentName.value = input
    dialogModel.value = true
    selectedCategoryTab.value = FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB
    const directSnapshot = props.directSettingsSnapshot
    if (directSnapshot !== undefined) {
      localSettings.value = { ...directSnapshot }
      return
    }

    void hydrateLocalSettingsFromDatabase()
  }

  async function saveAndCloseDialog (): Promise<void> {
    if (localSettings.value === null) {
      return
    }
    const trimmedName = localSettings.value.projectName.trim()
    if (trimmedName.length === 0) {
      return
    }
    await runFaActionAwait('saveProjectSettings', {
      settings: {
        projectName: trimmedName
      }
    })
    dialogModel.value = false
  }

  return {
    openDialog,
    saveAndCloseDialog
  }
}
