import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'
import type { T_projectHierarchyTreeSearchLayoutMode } from 'app/types/I_faProjectHierarchyTreeSearchDomain'

export function createUseProjectHierarchyTreeSearch (deps: {
  computed: <T>(getter: () => T) => I_computedRef<T>
  fixedSearchWidthPx: number
  ref: <T>(value: T) => I_ref<T>
  resolveProjectHierarchyTreeSearchLayout: (input: {
    disableAppControlBar: boolean
    isFocused: boolean
  }) => T_projectHierarchyTreeSearchLayoutMode
  S_FaProjectSidebar: () => StoreGeneric
  S_FaUserSettings: () => StoreGeneric
  storeToRefs: T_piniaStoreToRefs
}): () => {
    clearSearchQuery: () => void
    isSearchFocused: I_ref<boolean>
    layoutMode: I_computedRef<T_projectHierarchyTreeSearchLayoutMode>
    searchQuery: I_ref<string>
    searchWrapperStyle: I_computedRef<Record<string, string>>
  } {
  return function useProjectHierarchyTreeSearch () {
    const searchQuery = deps.ref('')
    const isSearchFocused = deps.ref(false)

    const { settings } = deps.storeToRefs(deps.S_FaUserSettings())!
    const { liveWidthPx: sidebarLiveWidthPx } = deps.storeToRefs(deps.S_FaProjectSidebar())!

    const disableAppControlBar = deps.computed(() => {
      return settings!.value?.disableAppControlBar === true
    })

    const layoutMode = deps.computed(() => {
      return deps.resolveProjectHierarchyTreeSearchLayout({
        disableAppControlBar: disableAppControlBar.value,
        isFocused: isSearchFocused.value
      })
    })

    const searchWrapperStyle = deps.computed(() => {
      if (layoutMode.value === 'fullViewport') {
        return { width: '100vw' }
      }

      if (layoutMode.value === 'followSidebar') {
        return { width: `${sidebarLiveWidthPx!.value}px` }
      }

      return { width: `${deps.fixedSearchWidthPx}px` }
    })

    function clearSearchQuery (): void {
      searchQuery.value = ''
    }

    return {
      clearSearchQuery,
      isSearchFocused,
      layoutMode,
      searchQuery,
      searchWrapperStyle
    }
  }
}
