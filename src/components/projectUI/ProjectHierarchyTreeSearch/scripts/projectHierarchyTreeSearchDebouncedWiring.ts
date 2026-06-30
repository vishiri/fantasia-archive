import type { watch as watchFn } from 'vue'
import type debounce from 'lodash-es/debounce.js'

import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'
import type { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import type { createUseProjectHierarchyTreeSearch } from '../functions/createUseProjectHierarchyTreeSearch'
import type { resolveProjectHierarchyTreeSearchLayout } from '../functions/resolveProjectHierarchyTreeSearchLayout'
import type { runProjectHierarchyTreeSearchQuery } from './projectHierarchyTreeSearchQueryWiring'

export function createUseProjectHierarchyTreeSearchDebounced (deps: {
  SEARCH_DEBOUNCE_MS: number
  S_FaProjectHierarchyTree: typeof S_FaProjectHierarchyTree
  computed: <T>(getter: () => T) => I_computedRef<T>
  createUseProjectHierarchyTreeSearch: typeof createUseProjectHierarchyTreeSearch
  debounce: typeof debounce
  fixedSearchWidthPx: number
  ref: <T>(value: T) => I_ref<T>
  resolveProjectHierarchyTreeSearchLayout: typeof resolveProjectHierarchyTreeSearchLayout
  runProjectHierarchyTreeSearchQuery: typeof runProjectHierarchyTreeSearchQuery
  S_FaProjectSidebar: () => StoreGeneric
  S_FaUserSettings: () => StoreGeneric
  storeToRefs: T_piniaStoreToRefs
  watch: typeof watchFn
}): ReturnType<typeof createUseProjectHierarchyTreeSearch> {
  const useSearchBase = deps.createUseProjectHierarchyTreeSearch({
    computed: deps.computed,
    fixedSearchWidthPx: deps.fixedSearchWidthPx,
    ref: deps.ref,
    resolveProjectHierarchyTreeSearchLayout: deps.resolveProjectHierarchyTreeSearchLayout,
    S_FaProjectSidebar: deps.S_FaProjectSidebar,
    S_FaUserSettings: deps.S_FaUserSettings,
    storeToRefs: deps.storeToRefs
  })

  return function useProjectHierarchyTreeSearchDebounced () {
    const api = useSearchBase()
    const hierarchyStore = deps.S_FaProjectHierarchyTree()

    const runDebouncedSearch = deps.debounce((query: string) => {
      void deps.runProjectHierarchyTreeSearchQuery(query, hierarchyStore)
    }, deps.SEARCH_DEBOUNCE_MS)

    deps.watch(
      () => api.searchQuery.value,
      (query) => {
        const trimmed = query.trim()
        if (trimmed.length === 0) {
          runDebouncedSearch.cancel()
          hierarchyStore.clearSearch()
          return
        }
        runDebouncedSearch(trimmed)
      }
    )

    return api
  }
}
