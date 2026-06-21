import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'

import { mergeFilteredDragOrderIntoFullList } from './functions/mergeFilteredDragOrderIntoFullList'

type T_dialogProjectSettingsFilteredVerticalTabListSortableWiringDeps<T extends { id: string }> = {
  cloneList: (list: T[]) => T[]
  filterItems: (list: T[], query: string) => T[]
  filterQuery: Ref<string>
  fullList: Ref<T[]>
}

export function createDialogProjectSettingsFilteredVerticalTabListSortableWiring<T extends { id: string }> (
  deps: T_dialogProjectSettingsFilteredVerticalTabListSortableWiringDeps<T>
) {
  const sortableList = ref<T[]>([]) as Ref<T[]>

  const isFilterActive = computed(() => deps.filterQuery.value.trim().length > 0)

  const showFilterEmpty = computed(() => {
    return isFilterActive.value && sortableList.value.length === 0
  })

  function syncSortableListFromFull (): void {
    if (!isFilterActive.value) {
      sortableList.value = deps.cloneList(deps.fullList.value)
      return
    }

    sortableList.value = deps.filterItems(deps.fullList.value, deps.filterQuery.value)
  }

  function applySortableListToFull (): void {
    if (!isFilterActive.value) {
      deps.fullList.value = deps.cloneList(sortableList.value)
      return
    }

    deps.fullList.value = mergeFilteredDragOrderIntoFullList(
      deps.fullList.value,
      sortableList.value
    )
  }

  watch(deps.filterQuery, syncSortableListFromFull)

  watch(
    () => deps.fullList.value.map((item) => item.id).join('\u0001'),
    syncSortableListFromFull
  )

  syncSortableListFromFull()

  return {
    applySortableListToFull,
    isFilterActive,
    showFilterEmpty,
    sortableList,
    syncSortableListFromFull
  }
}
