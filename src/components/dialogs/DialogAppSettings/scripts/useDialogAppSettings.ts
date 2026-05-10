import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { I_dialogAppSettingsProps } from 'app/types/I_dialogAppSettings'
import type { T_appSettingsRenderTree } from 'app/types/I_dialogAppSettings'
import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { ref, type Ref } from 'vue'

import { createDialogAppSettingsDialogActions } from './dialogAppSettingsDialogActions'
import { registerDialogAppSettingsWatchers } from './dialogAppSettingsDialogStore'
import { useDialogAppSettingsSearchComputed } from './dialogAppSettingsSearch'

function createDialogAppSettingsRefs (): {
  dialogModel: Ref<boolean>
  documentName: Ref<string>
  localSettings: Ref<I_faUserSettings | null>
  appSettingsTree: Ref<T_appSettingsRenderTree>
  searchSettingsQuery: Ref<string | null>
  selectedCategoryTab: Ref<string>
} {
  const dialogModel = ref(false)
  const documentName = ref('')
  const localSettings = ref<I_faUserSettings | null>(null)
  const appSettingsTree = ref<T_appSettingsRenderTree>({})
  const searchSettingsQuery = ref<string | null>('')
  const selectedCategoryTab = ref<string>('')
  return {
    dialogModel,
    documentName,
    localSettings,
    appSettingsTree,
    searchSettingsQuery,
    selectedCategoryTab
  }
}

export function useDialogAppSettings (props: I_dialogAppSettingsProps) {
  const refs = createDialogAppSettingsRefs()
  registerComponentDialogStackGuard(refs.dialogModel)
  const {
    dialogModel,
    documentName,
    localSettings,
    appSettingsTree,
    searchSettingsQuery,
    selectedCategoryTab
  } = refs
  const searchComputed = useDialogAppSettingsSearchComputed({
    appSettingsTree,
    searchSettingsQuery
  })
  const actions = createDialogAppSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    appSettingsTree,
    props,
    searchSettingsQuery
  })
  registerDialogAppSettingsWatchers({
    openDialog: actions.openDialog,
    appSettingsTree,
    props,
    selectedCategoryTab
  })
  return {
    dialogModel,
    documentName,
    hasActiveSearchQuery: searchComputed.hasActiveSearchQuery,
    hasSearchNoMatchingSettings: searchComputed.hasSearchNoMatchingSettings,
    localSettings,
    appSettingsTree,
    saveAndCloseDialog: actions.saveAndCloseDialog,
    searchFilteredAppSettingsTree: searchComputed.searchFilteredAppSettingsTree,
    searchSettingsQuery,
    selectedCategoryTab,
    updateLocalSetting: actions.updateLocalSetting
  }
}
