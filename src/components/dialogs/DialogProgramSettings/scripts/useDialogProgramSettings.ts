import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { I_dialogProgramSettingsProps } from 'app/types/I_dialogProgramSettings'
import type { T_programSettingsRenderTree } from 'app/types/I_dialogProgramSettings'
import { registerDialogComponentOpenLease } from 'app/src/scripts/appInfo/registerDialogComponentOpenLease'
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
  return {
    dialogModel: ref(false),
    documentName: ref(''),
    localSettings: ref<I_faUserSettings | null>(null),
    programSettingsTree: ref<T_programSettingsRenderTree>({}),
    searchSettingsQuery: ref<string | null>(''),
    selectedCategoryTab: ref<string>('')
  }
}

export function useDialogProgramSettings (props: I_dialogProgramSettingsProps) {
  const refs = createDialogProgramSettingsRefs()
  registerDialogComponentOpenLease(refs.dialogModel)
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
