import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { computed, ref, type Ref } from 'vue'

import { createDialogProjectSettingsDialogActions } from './dialogProjectSettingsDialogActions'
import { FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB } from './dialogProjectSettingsConstants'
import { registerDialogProjectSettingsWatchers } from './dialogProjectSettingsDialogStore'

function createDialogProjectSettingsRefs (): {
  dialogModel: Ref<boolean>
  documentName: Ref<string>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  selectedCategoryTab: Ref<string>
} {
  const dialogModel = ref(false)
  const documentName = ref('')
  const localSettings = ref<I_faProjectSettingsRoot | null>(null)
  const selectedCategoryTab = ref<string>(FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB)
  return {
    dialogModel,
    documentName,
    localSettings,
    selectedCategoryTab
  }
}

export function useDialogProjectSettings (props: I_dialogProjectSettingsProps) {
  const refs = createDialogProjectSettingsRefs()
  registerComponentDialogStackGuard(refs.dialogModel)
  const {
    dialogModel,
    documentName,
    localSettings,
    selectedCategoryTab
  } = refs
  const actions = createDialogProjectSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    props,
    selectedCategoryTab
  })
  registerDialogProjectSettingsWatchers({
    openDialog: actions.openDialog,
    props
  })

  const isSaveDisabled = computed(() => {
    const name = localSettings.value?.projectName ?? ''
    return name.trim().length === 0
  })

  return {
    dialogModel,
    documentName,
    isSaveDisabled,
    localSettings,
    saveAndCloseDialog: actions.saveAndCloseDialog,
    selectedCategoryTab
  }
}
