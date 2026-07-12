/** @vitest-environment jsdom */
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

const listWorkspaceHierarchyLayoutMock = vi.fn(async () => ({
  worlds: [
    {
      color: '#ff0000',
      colorPallete: '',
      displayName: 'World One',
      groups: [
        {
          displayName: 'Group A',
          hasChildren: true,
          id: 'group-1',
          rootSortOrder: 0,
          worldId: 'world-1'
        }
      ],
      id: 'world-1',
      placements: [
        {
          displayName: 'Characters',
          documentTemplateId: 'tmpl-1',
          groupId: null,
          groupSortOrder: null,
          hasChildren: true,
          icon: 'mdi-account',
          titlePluralTranslations: {},
          titleSingularTranslations: {},
          id: 'placement-1',
          nickname: '',
          rootSortOrder: 0,
          worldId: 'world-1'
        }
      ],
      sortOrder: 0
    }
  ]
}))

const getHierarchyTreeUiStateMock = vi.fn(async () => ({
  expandedNodeIds: ['world-1'],
  schemaVersion: 1 as const,
  scrollTopPx: 24
}))

const setHierarchyTreeUiStateMock = vi.fn(async () => true)

beforeEach(() => {
  vi.useFakeTimers()
  setActivePinia(createPinia())
  listWorkspaceHierarchyLayoutMock.mockClear()
  getHierarchyTreeUiStateMock.mockClear()
  setHierarchyTreeUiStateMock.mockClear()
  window.faContentBridgeAPIs = {
    projectContent: {
      listWorkspaceHierarchyLayout: listWorkspaceHierarchyLayoutMock
    },
    projectManagement: {
      getHierarchyTreeUiState: getHierarchyTreeUiStateMock,
      setHierarchyTreeUiState: setHierarchyTreeUiStateMock
    }
  } as never
  S_FaActiveProject().clearActiveProject()
})

afterEach(() => {
  vi.useRealTimers()
})

/**
 * S_FaProjectHierarchyTree resetOnProjectClose clears session tree state.
 */
test('Test that S_FaProjectHierarchyTree resetOnProjectClose clears session tree state', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaProjectHierarchyTree()
  store.treeData = [
    {
      children: [],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: false,
      icon: '',
      id: 'world-1',
      label: 'World',
      nodeKind: 'world',
      placementId: null,
      worldColor: '#000',
      worldId: 'world-1'
    }
  ]
  store.resetOnProjectClose()
  expect(store.treeData).toEqual([])
  expect(store.uiState.expandedNodeIds).toEqual([])
})

/**
 * S_FaProjectHierarchyTree refreshLayout clears when no project is active.
 */
test('Test that S_FaProjectHierarchyTree refreshLayout clears when no project is active', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaProjectHierarchyTree()
  await store.refreshLayout()
  expect(store.worlds).toEqual([])
  expect(listWorkspaceHierarchyLayoutMock).not.toHaveBeenCalled()
})

/**
 * S_FaProjectHierarchyTree refreshLayout loads skeleton from bridge.
 */
test('Test that S_FaProjectHierarchyTree refreshLayout loads skeleton from bridge', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshLayout()
  expect(listWorkspaceHierarchyLayoutMock).toHaveBeenCalledTimes(1)
  expect(store.worlds).toHaveLength(1)
  expect(store.treeData).toHaveLength(1)
  expect(store.treeData[0]?.nodeKind).toBe('world')
})

/**
 * S_FaProjectHierarchyTree refreshLayout keeps prior data when bridge is unavailable.
 */
test('Test that S_FaProjectHierarchyTree refreshLayout keeps prior data when bridge is unavailable', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshLayout()
  expect(store.worlds).toHaveLength(1)
  Object.assign(window.faContentBridgeAPIs, { projectContent: {} })
  await store.refreshLayout()
  expect(store.worlds).toHaveLength(1)
  expect(store.treeData).toHaveLength(1)
})

/**
 * S_FaProjectHierarchyTree refreshUiState resets when no project is active.
 */
test('Test that S_FaProjectHierarchyTree refreshUiState resets when no project is active', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaProjectHierarchyTree()
  store.queuePersistExpandedNodeIds(['world-1'])
  await store.refreshUiState()
  expect(store.uiState.expandedNodeIds).toEqual([])
  expect(getHierarchyTreeUiStateMock).not.toHaveBeenCalled()
})

/**
 * S_FaProjectHierarchyTree refreshUiState loads persisted UI state.
 */
test('Test that S_FaProjectHierarchyTree refreshUiState loads persisted UI state', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshUiState()
  expect(getHierarchyTreeUiStateMock).toHaveBeenCalledTimes(1)
  expect(store.uiState.expandedNodeIds).toEqual(['world-1'])
  expect(store.uiState.scrollTopPx).toBe(24)
})

/**
 * S_FaProjectHierarchyTree persists expanded node ids debounced.
 */
test('Test that S_FaProjectHierarchyTree persists expanded node ids debounced', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshUiState()
  store.queuePersistExpandedNodeIds(['world-1', 'group-1'])
  store.flushUiStatePersist()
  await vi.runAllTimersAsync()
  expect(setHierarchyTreeUiStateMock).toHaveBeenCalledWith({
    expandedNodeIds: ['world-1', 'group-1'],
    scrollTopPx: 24
  })
})

/**
 * S_FaProjectHierarchyTree persists scroll offset debounced.
 */
test('Test that S_FaProjectHierarchyTree persists scroll offset debounced', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshUiState()
  store.queuePersistScrollTopPx(88)
  store.flushUiStatePersist()
  await vi.runAllTimersAsync()
  expect(setHierarchyTreeUiStateMock).toHaveBeenCalledWith({
    expandedNodeIds: ['world-1'],
    scrollTopPx: 88
  })
})

/**
 * S_FaProjectHierarchyTree skips persist when values are unchanged.
 */
test('Test that S_FaProjectHierarchyTree skips persist when values are unchanged', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshUiState()
  setHierarchyTreeUiStateMock.mockClear()
  store.queuePersistExpandedNodeIds(['world-1'])
  store.flushUiStatePersist()
  await vi.runAllTimersAsync()
  expect(setHierarchyTreeUiStateMock).not.toHaveBeenCalled()
})

/**
 * S_FaProjectHierarchyTree search reveal and clear helpers update session state.
 */
test('Test that S_FaProjectHierarchyTree search reveal and clear helpers update session state', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshLayout()
  const hit = {
    ancestorDocumentIds: ['doc-parent'],
    displayName: 'Hero',
    documentId: 'doc-1',
    placementId: 'placement-1',
    worldId: 'world-1'
  }
  store.setSearchHits([hit])
  store.requestRevealSearchHit(hit)
  expect(store.pendingRevealPath.length).toBeGreaterThan(0)
  store.clearPendingRevealPath()
  expect(store.pendingRevealPath).toEqual([])
  store.clearSearch()
  expect(store.searchHits).toEqual([])
})

/**
 * S_FaProjectHierarchyTree resync clears tree when worlds become empty.
 */
test('Test that S_FaProjectHierarchyTree resync clears tree when worlds become empty', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshLayout()
  listWorkspaceHierarchyLayoutMock.mockResolvedValueOnce({ worlds: [] })
  await store.refreshLayout()
  expect(store.treeData).toEqual([])
})

/**
 * S_FaProjectHierarchyTree skips persist when no active project.
 */
test('Test that S_FaProjectHierarchyTree skips persist when no active project', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaProjectHierarchyTree()
  store.queuePersistScrollTopPx(12)
  store.flushUiStatePersist()
  await vi.runAllTimersAsync()
  expect(setHierarchyTreeUiStateMock).not.toHaveBeenCalled()
})

/**
 * S_FaProjectHierarchyTree keeps local UI state when bridge write returns false.
 */
test('Test that S_FaProjectHierarchyTree keeps local UI state when bridge write returns false', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshUiState()
  setHierarchyTreeUiStateMock.mockResolvedValueOnce(false)
  store.queuePersistScrollTopPx(99)
  store.flushUiStatePersist()
  await vi.runAllTimersAsync()
  expect(store.uiState.scrollTopPx).toBe(99)
})

/**
 * S_FaProjectHierarchyTree resync patches labels when topology is unchanged.
 */
test('Test that S_FaProjectHierarchyTree resync patches labels when topology is unchanged', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshLayout()
  const firstTreeRef = store.treeData
  listWorkspaceHierarchyLayoutMock.mockResolvedValueOnce({
    worlds: [
      {
        color: '#ff0000',
        colorPallete: '',
        displayName: 'Renamed World',
        groups: [
          {
            displayName: 'Group A',
            hasChildren: true,
            id: 'group-1',
            rootSortOrder: 0,
            worldId: 'world-1'
          }
        ],
        id: 'world-1',
        placements: [
          {
            displayName: 'Characters',
            documentTemplateId: 'tmpl-1',
            groupId: null,
            groupSortOrder: null,
            hasChildren: true,
            icon: 'mdi-account',
            titlePluralTranslations: {},
            titleSingularTranslations: {},
            id: 'placement-1',
            nickname: '',
            rootSortOrder: 0,
            worldId: 'world-1'
          }
        ],
        sortOrder: 0
      }
    ]
  })
  await store.refreshLayout()
  expect(store.treeData).toBe(firstTreeRef)
  expect(store.treeData[0]?.label).toBe('Renamed World')
})

/**
 * S_FaProjectHierarchyTree refreshLayout coalesces concurrent in-flight loads.
 */
test('Test that S_FaProjectHierarchyTree refreshLayout coalesces concurrent loads', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  let resolveLayout: (value: Awaited<ReturnType<typeof listWorkspaceHierarchyLayoutMock>>) => void = () => undefined
  const layoutPromise = new Promise<Awaited<ReturnType<typeof listWorkspaceHierarchyLayoutMock>>>((resolve) => {
    resolveLayout = resolve
  })
  listWorkspaceHierarchyLayoutMock.mockReturnValueOnce(layoutPromise)
  const store = S_FaProjectHierarchyTree()
  const first = store.refreshLayout()
  const second = store.refreshLayout()
  resolveLayout({
    worlds: [
      {
        color: '#ff0000',
        colorPallete: '',
        displayName: 'World One',
        groups: [],
        id: 'world-1',
        placements: [],
        sortOrder: 0
      }
    ]
  })
  await Promise.all([first, second])
  expect(listWorkspaceHierarchyLayoutMock).toHaveBeenCalledTimes(1)
})

/**
 * S_FaProjectHierarchyTree refreshDocumentsInTree queues document ids for session refresh.
 */
test('Test that S_FaProjectHierarchyTree refreshDocumentsInTree queues document ids', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  store.refreshDocumentsInTree(['doc-a', 'doc-b'])
  expect(store.pendingDocumentRefreshIds).toEqual(['doc-a', 'doc-b'])
  store.refreshDocumentsInTree(['doc-b', 'doc-c'])
  expect(store.pendingDocumentRefreshIds).toEqual(['doc-a', 'doc-b', 'doc-c'])
  store.clearPendingDocumentRefreshIds()
  expect(store.pendingDocumentRefreshIds).toEqual([])
})

/**
 * S_FaProjectHierarchyTree refreshHierarchyTreeNodes queues explicit node ids for session refresh.
 */
test('Test that S_FaProjectHierarchyTree refreshHierarchyTreeNodes queues node ids', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  store.refreshHierarchyTreeNodes(['placement-1', 'doc-grandparent'])
  store.refreshHierarchyTreeNodes(['doc-grandparent', 'doc-parent'])
  expect(store.pendingHierarchyNodeRefreshIds).toEqual([
    'placement-1',
    'doc-grandparent',
    'doc-parent'
  ])
  store.clearPendingHierarchyNodeRefreshIds()
  expect(store.pendingHierarchyNodeRefreshIds).toEqual([])
})

test('Test that S_FaProjectHierarchyTree refreshDocumentsInTree no-ops without active project', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().clearActiveProject()
  const store = S_FaProjectHierarchyTree()
  store.refreshDocumentsInTree(['doc-a'])
  expect(store.pendingDocumentRefreshIds).toEqual([])
})

test('Test that S_FaProjectHierarchyTree refreshDocumentsInTree no-ops for empty id lists', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  store.refreshDocumentsInTree([])
  expect(store.pendingDocumentRefreshIds).toEqual([])
})

test('Test that S_FaProjectHierarchyTree refreshHierarchyTreeNodes no-ops without active project', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().clearActiveProject()
  const store = S_FaProjectHierarchyTree()
  store.refreshHierarchyTreeNodes(['placement-1'])
  expect(store.pendingHierarchyNodeRefreshIds).toEqual([])
})

test('Test that S_FaProjectHierarchyTree patchWorldColorPalleteInLayout updates matching world palette', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshLayout()
  store.patchWorldColorPalleteInLayout('world-1', '#aabbcc,#ddeeff')
  expect(store.worlds[0]?.colorPallete).toBe('#aabbcc,#ddeeff')
  store.patchWorldColorPalleteInLayout('world-missing', '#000000')
  expect(store.worlds[0]?.colorPallete).toBe('#aabbcc,#ddeeff')
})
