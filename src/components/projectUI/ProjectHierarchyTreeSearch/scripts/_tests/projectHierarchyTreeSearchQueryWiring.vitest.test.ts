/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'

import { runProjectHierarchyTreeSearchQuery } from '../projectHierarchyTreeSearchQueryWiring'

const searchProjectHierarchyMock = vi.fn(async () => ({
  hits: [
    {
      ancestorDocumentIds: [],
      displayName: 'Hero',
      documentId: 'doc-1',
      placementId: 'placement-1',
      worldId: 'world-1'
    }
  ],
  query: 'hero'
}))

beforeEach(() => {
  searchProjectHierarchyMock.mockClear()
  window.faContentBridgeAPIs = {
    projectContent: {
      searchProjectHierarchy: searchProjectHierarchyMock
    }
  } as never
})

/**
 * runProjectHierarchyTreeSearchQuery stores hits and requests reveal for first hit.
 */
test('Test that runProjectHierarchyTreeSearchQuery stores hits and reveals first hit', async () => {
  const hierarchyStore = {
    clearSearch: vi.fn(),
    requestRevealSearchHit: vi.fn(),
    setSearchHits: vi.fn()
  }
  await runProjectHierarchyTreeSearchQuery('hero', hierarchyStore as never)
  expect(searchProjectHierarchyMock).toHaveBeenCalledWith('hero')
  expect(hierarchyStore.setSearchHits).toHaveBeenCalled()
  expect(hierarchyStore.requestRevealSearchHit).toHaveBeenCalled()
})

/**
 * runProjectHierarchyTreeSearchQuery stores empty hits without requesting reveal.
 */
test('Test that runProjectHierarchyTreeSearchQuery skips reveal when hits are empty', async () => {
  searchProjectHierarchyMock.mockResolvedValueOnce({
    hits: [],
    query: 'none'
  })
  const hierarchyStore = {
    clearSearch: vi.fn(),
    requestRevealSearchHit: vi.fn(),
    setSearchHits: vi.fn()
  }
  await runProjectHierarchyTreeSearchQuery('none', hierarchyStore as never)
  expect(hierarchyStore.setSearchHits).toHaveBeenCalledWith([])
  expect(hierarchyStore.requestRevealSearchHit).not.toHaveBeenCalled()
})

/**
 * runProjectHierarchyTreeSearchQuery clears search when bridge is missing.
 */
test('Test that runProjectHierarchyTreeSearchQuery clears search when bridge is missing', async () => {
  window.faContentBridgeAPIs = {
    projectContent: {}
  } as never
  const hierarchyStore = {
    clearSearch: vi.fn(),
    requestRevealSearchHit: vi.fn(),
    setSearchHits: vi.fn()
  }
  await runProjectHierarchyTreeSearchQuery('hero', hierarchyStore as never)
  expect(hierarchyStore.clearSearch).toHaveBeenCalled()
})
