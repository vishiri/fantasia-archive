/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'

import { setFaComponentTestingProjectContentOverrides } from 'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'
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
  setFaComponentTestingProjectContentOverrides(null)
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

test('Test that runProjectHierarchyTreeSearchQuery drops a result after the query changes', async () => {
  let resolveSearch: ((value: { hits: never[], query: string }) => void) | undefined
  let queryStillCurrent = true
  searchProjectHierarchyMock.mockImplementationOnce(() => new Promise((resolve) => {
    resolveSearch = resolve
  }))
  const hierarchyStore = {
    clearSearch: vi.fn(),
    requestRevealSearchHit: vi.fn(),
    setSearchHits: vi.fn()
  }
  const pending = runProjectHierarchyTreeSearchQuery(
    'hero',
    hierarchyStore as never,
    () => queryStillCurrent
  )
  const finishSearch = resolveSearch
  if (finishSearch === undefined) {
    throw new Error('missing search resolver')
  }
  queryStillCurrent = false
  finishSearch({
    hits: [],
    query: 'hero'
  })
  await pending
  expect(hierarchyStore.setSearchHits).not.toHaveBeenCalled()
  expect(hierarchyStore.requestRevealSearchHit).not.toHaveBeenCalled()
  expect(hierarchyStore.clearSearch).not.toHaveBeenCalled()
})

test('Test that runProjectHierarchyTreeSearchQuery ignores an older overlapping read for the same query', async () => {
  let resolveSlow: ((value: { hits: never[], query: string }) => void) | undefined
  const freshHit = {
    ancestorDocumentIds: [],
    displayName: 'Hero fresh',
    documentId: 'doc-fresh',
    placementId: 'placement-1',
    worldId: 'world-1'
  }
  searchProjectHierarchyMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveSlow = resolve
    })
  })
  searchProjectHierarchyMock.mockResolvedValueOnce({
    hits: [freshHit],
    query: 'hero'
  } as never)
  const hierarchyStore = {
    clearSearch: vi.fn(),
    requestRevealSearchHit: vi.fn(),
    setSearchHits: vi.fn()
  }
  const requestSerialBox = {
    current: 0
  }
  const slow = runProjectHierarchyTreeSearchQuery(
    'hero',
    hierarchyStore as never,
    () => true,
    () => 1,
    requestSerialBox
  )
  const fast = runProjectHierarchyTreeSearchQuery(
    'hero',
    hierarchyStore as never,
    () => true,
    () => 1,
    requestSerialBox
  )
  await fast
  const finishSlow = resolveSlow
  if (finishSlow === undefined) {
    throw new Error('missing slow search resolver')
  }
  finishSlow({
    hits: [{
      ancestorDocumentIds: [],
      displayName: 'Hero stale',
      documentId: 'doc-stale',
      placementId: 'placement-1',
      worldId: 'world-1'
    }],
    query: 'hero'
  } as never)
  await slow
  expect(hierarchyStore.setSearchHits).toHaveBeenCalledTimes(1)
  expect(hierarchyStore.setSearchHits).toHaveBeenCalledWith([freshHit])
  expect(hierarchyStore.requestRevealSearchHit).toHaveBeenCalledTimes(1)
  expect(hierarchyStore.requestRevealSearchHit).toHaveBeenCalledWith(freshHit)
})

test('Test that runProjectHierarchyTreeSearchQuery drops a result after the project changes', async () => {
  let resolveSearch: ((value: { hits: never[], query: string }) => void) | undefined
  let epoch = 1
  searchProjectHierarchyMock.mockImplementationOnce(() => new Promise((resolve) => {
    resolveSearch = resolve
  }))
  const hierarchyStore = {
    clearSearch: vi.fn(),
    requestRevealSearchHit: vi.fn(),
    setSearchHits: vi.fn()
  }
  const pending = runProjectHierarchyTreeSearchQuery(
    'hero',
    hierarchyStore as never,
    () => true,
    () => epoch
  )
  const finishSearch = resolveSearch
  if (finishSearch === undefined) {
    throw new Error('missing search resolver')
  }
  epoch = 2
  finishSearch({
    hits: [],
    query: 'hero'
  })
  await pending
  expect(hierarchyStore.setSearchHits).not.toHaveBeenCalled()
  expect(hierarchyStore.requestRevealSearchHit).not.toHaveBeenCalled()
})

test('Test that runProjectHierarchyTreeSearchQuery uses searchHitsByQuery overrides', async () => {
  window.faContentBridgeAPIs = {
    projectContent: {}
  } as never
  setFaComponentTestingProjectContentOverrides({
    searchHitsByQuery: {
      hero: [{
        ancestorDocumentIds: [],
        displayName: 'Hero',
        documentId: 'doc-1',
        placementId: 'placement-1',
        worldId: 'world-1'
      }]
    }
  })
  const hierarchyStore = {
    clearSearch: vi.fn(),
    requestRevealSearchHit: vi.fn(),
    setSearchHits: vi.fn()
  }
  await runProjectHierarchyTreeSearchQuery('hero', hierarchyStore as never)
  expect(hierarchyStore.setSearchHits).toHaveBeenCalled()
  expect(hierarchyStore.requestRevealSearchHit).toHaveBeenCalled()
  setFaComponentTestingProjectContentOverrides(null)
})
