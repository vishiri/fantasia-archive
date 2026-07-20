/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'
import { computed, ref, watch } from 'vue'
import debounce from 'lodash-es/debounce.js'

import { createUseProjectHierarchyTreeSearch } from '../../functions/createUseProjectHierarchyTreeSearch'
import { resolveProjectHierarchyTreeSearchLayout } from '../../functions/resolveProjectHierarchyTreeSearchLayout'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { createUseProjectHierarchyTreeSearchDebounced } from '../projectHierarchyTreeSearchDebouncedWiring'

const runProjectHierarchyTreeSearchQuery = vi.fn(async () => undefined)

beforeEach(() => {
  runProjectHierarchyTreeSearchQuery.mockClear()
})

/**
 * createUseProjectHierarchyTreeSearchDebounced debounces search and clears on empty query.
 */
test('Test that createUseProjectHierarchyTreeSearchDebounced debounces search queries', async () => {
  vi.useFakeTimers()
  const clearSearch = vi.fn()
  const hierarchyStore = {
    clearSearch
  }
  const useDebounced = createUseProjectHierarchyTreeSearchDebounced({
    SEARCH_DEBOUNCE_MS: 50,
    S_FaProjectHierarchyTree: (() => hierarchyStore) as unknown as typeof S_FaProjectHierarchyTree,
    computed,
    createUseProjectHierarchyTreeSearch,
    debounce,
    fixedSearchWidthPx: 375,
    ref,
    resolveProjectHierarchyTreeSearchLayout,
    runProjectHierarchyTreeSearchQuery,
    S_FaProjectSidebar: () => ({
      liveWidthPx: ref(400)
    }) as never,
    S_FaUserSettings: () => ({
      settings: ref({
        disableAppControlBar: false,
        languageCode: 'en-US'
      })
    }) as never,
    storeToRefs: (store) => store as never,
    watch
  })
  const api = useDebounced()
  api.searchQuery.value = 'hero'
  await vi.advanceTimersByTimeAsync(60)
  expect(runProjectHierarchyTreeSearchQuery).toHaveBeenCalledWith('hero', hierarchyStore)
  api.searchQuery.value = '   '
  await vi.advanceTimersByTimeAsync(60)
  expect(clearSearch).toHaveBeenCalled()
  vi.useRealTimers()
})
