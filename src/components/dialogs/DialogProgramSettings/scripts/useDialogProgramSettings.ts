import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { I_dialogProgramSettingsProps } from 'app/types/I_dialogProgramSettings'
import type { T_programSettingsRenderTree } from 'app/types/I_dialogProgramSettings'
import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { ref, type Ref } from 'vue'

import { createDialogProgramSettingsDialogActions } from './dialogProgramSettingsDialogActions'
import { registerDialogProgramSettingsWatchers } from './dialogProgramSettingsDialogStore'
import { useDialogProgramSettingsSearchComputed } from './dialogProgramSettingsSearch'

function createDialogProgramSettingsRefs (): {
  dialogModel: Ref<boolean>
  documentName: Ref<string>
  localSettings: Ref<I_faUserSettings | null>
  programSettingsTree: Ref<T_programSettingsRenderTree>
  searchSettingsQuery: Ref<string | null>
  selectedCategoryTab: Ref<string>
} {
  const dialogModel = ref(false)
  const documentName = ref('')
  const localSettings = ref<I_faUserSettings | null>(null)
  const programSettingsTree = ref<T_programSettingsRenderTree>({})
  const searchSettingsQuery = ref<string | null>('')
  const selectedCategoryTab = ref<string>('')
  return {
    dialogModel,
    documentName,
    localSettings,
    programSettingsTree,
    searchSettingsQuery,
    selectedCategoryTab
  }
}

export function useDialogProgramSettings (props: I_dialogProgramSettingsProps) {
  const refs = createDialogProgramSettingsRefs()
  registerComponentDialogStackGuard(refs.dialogModel)
  const {
    dialogModel,
    documentName,
    localSettings,
    programSettingsTree,
    searchSettingsQuery,
    selectedCategoryTab
  } = refs
  const searchComputed = useDialogProgramSettingsSearchComputed({
    programSettingsTree,
    searchSettingsQuery
  })
  const actions = createDialogProgramSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    programSettingsTree,
    props,
    searchSettingsQuery
  })
  registerDialogProgramSettingsWatchers({
    openDialog: actions.openDialog,
    programSettingsTree,
    props,
    selectedCategoryTab
  })
  return {
    dialogModel,
    documentName,
    hasActiveSearchQuery: searchComputed.hasActiveSearchQuery,
    hasSearchNoMatchingSettings: searchComputed.hasSearchNoMatchingSettings,
    localSettings,
    programSettingsTree,
    saveAndCloseDialog: actions.saveAndCloseDialog,
    searchFilteredProgramSettingsTree: searchComputed.searchFilteredProgramSettingsTree,
    searchSettingsQuery,
    selectedCategoryTab,
    updateLocalSetting: actions.updateLocalSetting
  }
}
