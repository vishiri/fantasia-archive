import type { I_dialogProgramSettingsProps } from './dialogProgramSettingsComposable.types'
import { createDialogProgramSettingsDialogActions } from './dialogProgramSettingsDialogActions'
import { createDialogProgramSettingsRefs } from './dialogProgramSettingsRefs'
import { useDialogProgramSettingsSearchComputed } from './dialogProgramSettingsSearchComputed'
import { registerDialogProgramSettingsWatchers } from './registerDialogProgramSettingsWatchers'

export function useDialogProgramSettings (props: I_dialogProgramSettingsProps) {
  const refs = createDialogProgramSettingsRefs()
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
