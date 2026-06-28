import { computed, ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import { FA_PROJECT_SIDEBAR_MIN_WIDTH_PX } from 'app/types/I_faProjectSidebarDomain'

import { createUseProjectHierarchyTreeSearch } from '../../functions/createUseProjectHierarchyTreeSearch'
import { resolveProjectHierarchyTreeSearchLayout } from '../../functions/resolveProjectHierarchyTreeSearchLayout'

function mountUseProjectHierarchyTreeSearch (options: {
  disableDocumentControlBar: boolean
  sidebarLiveWidthPx: number
}) {
  const settings = ref({ disableDocumentControlBar: options.disableDocumentControlBar })
  const liveWidthPx = ref(options.sidebarLiveWidthPx)

  return createUseProjectHierarchyTreeSearch({
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    fixedSearchWidthPx: FA_PROJECT_SIDEBAR_MIN_WIDTH_PX,
    ref: ref as <T>(value: T) => I_ref<T>,
    resolveProjectHierarchyTreeSearchLayout,
    S_FaProjectSidebar: () => ({}) as never,
    S_FaUserSettings: () => ({}) as never,
    storeToRefs: () => ({
      liveWidthPx,
      settings
    }) as never
  })()
}

test('Test that createUseProjectHierarchyTreeSearch applies fixed width when the document control bar is shown', () => {
  const api = mountUseProjectHierarchyTreeSearch({
    disableDocumentControlBar: false,
    sidebarLiveWidthPx: 500
  })

  expect(api.searchWrapperStyle.value.width).toBe(`${FA_PROJECT_SIDEBAR_MIN_WIDTH_PX}px`)
})

test('Test that createUseProjectHierarchyTreeSearch follows sidebar width when the document control bar is hidden', () => {
  const api = mountUseProjectHierarchyTreeSearch({
    disableDocumentControlBar: true,
    sidebarLiveWidthPx: 512
  })

  expect(api.searchWrapperStyle.value.width).toBe('512px')
})

test('Test that createUseProjectHierarchyTreeSearch stretches to the viewport when focused', () => {
  const api = mountUseProjectHierarchyTreeSearch({
    disableDocumentControlBar: false,
    sidebarLiveWidthPx: 512
  })
  api.isSearchFocused.value = true

  expect(api.layoutMode.value).toBe('fullViewport')
  expect(api.searchWrapperStyle.value.width).toBe('100vw')
})

test('Test that createUseProjectHierarchyTreeSearch clears the local search query', () => {
  const api = mountUseProjectHierarchyTreeSearch({
    disableDocumentControlBar: false,
    sidebarLiveWidthPx: 512
  })
  api.searchQuery.value = 'alpha'
  api.clearSearchQuery()

  expect(api.searchQuery.value).toBe('')
})
