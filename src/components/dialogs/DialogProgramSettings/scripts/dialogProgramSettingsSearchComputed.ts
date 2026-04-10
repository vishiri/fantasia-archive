import type { T_programSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import { filterProgramSettingsTreeForSearch } from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsSearching'
import { computed, type ComputedRef, type Ref } from 'vue'

export function useDialogProgramSettingsSearchComputed (params: {
  programSettingsTree: Ref<T_programSettingsRenderTree>
  searchSettingsQuery: Ref<string | null>
}): {
    hasActiveSearchQuery: ComputedRef<boolean>
    hasSearchNoMatchingSettings: ComputedRef<boolean>
    searchFilteredProgramSettingsTree: ComputedRef<T_programSettingsRenderTree>
  } {
  const {
    programSettingsTree,
    searchSettingsQuery
  } = params

  const hasActiveSearchQuery = computed(
    () => (searchSettingsQuery.value ?? '').trim() !== ''
  )

  const searchFilteredProgramSettingsTree = computed((): T_programSettingsRenderTree => {
    if (!hasActiveSearchQuery.value) {
      return {}
    }

    return filterProgramSettingsTreeForSearch(programSettingsTree.value, searchSettingsQuery.value)
  })

  const hasSearchNoMatchingSettings = computed(
    () =>
      hasActiveSearchQuery.value &&
      Object.keys(searchFilteredProgramSettingsTree.value).length === 0
  )

  return {
    hasActiveSearchQuery,
    hasSearchNoMatchingSettings,
    searchFilteredProgramSettingsTree
  }
}
