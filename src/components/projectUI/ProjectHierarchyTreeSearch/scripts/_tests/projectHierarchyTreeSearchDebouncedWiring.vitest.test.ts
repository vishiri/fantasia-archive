/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'
import { computed, ref, watch } from 'vue'
import debounce from 'lodash-es/debounce.js'

import { createUseProjectHierarchyTreeSearch } from '../../functions/createUseProjectHierarchyTreeSearch'
import { resolveProjectHierarchyTreeSearchLayout } from '../../functions/resolveProjectHierarchyTreeSearchLayout'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { createUseProjectHierarchyTreeSearchDebounced } from '../projectHierarchyTreeSearchDebouncedWiring'

const runProjectHierarchyTreeSearchQuery = vi.fn(async (
  _query: string,
  _hierarchyStore: unknown,
  _isCurrentQuery?: (issuedQuery: string) => boolean,
  _readProjectContentEpoch?: () => number
) => undefined)

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
    readProjectContentEpoch: () => 0,
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
  expect(runProjectHierarchyTreeSearchQuery).toHaveBeenCalledWith(
    'hero',
    hierarchyStore,
    expect.any(Function),
    expect.any(Function),
    expect.objectContaining({
      current: 0
    })
  )
  const isCurrentQuery = runProjectHierarchyTreeSearchQuery.mock.calls[0]?.[2] as
    | ((issuedQuery: string) => boolean)
    | undefined
  if (isCurrentQuery === undefined) {
    throw new Error('missing current-query check')
  }
  expect(isCurrentQuery('hero')).toBe(true)
  api.searchQuery.value = 'villain'
  expect(isCurrentQuery('hero')).toBe(false)
  api.searchQuery.value = '   '
  await vi.advanceTimersByTimeAsync(60)
  expect(clearSearch).toHaveBeenCalled()
  vi.useRealTimers()
})
