/** @vitest-environment jsdom */
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

const listWorkspaceHierarchyLayoutMock = vi.fn(async () => ({
  worlds: [
    {
      color: '#ff0000',
      colorPalette: '',
      displayName: 'World One',
      groups: [
        {
          displayName: 'Group A',
          hasChildren: true,
          id: 'group-1',
          rootSortOrder: 0,
          isCategory: false,
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
          isCategory: false,
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

const listDocumentsMock = vi.fn(async () => ({
  items: [] as Array<{
    createdAtMs: number
    displayName: string
    documentBackgroundColor: null
    documentTextColor: null
    extraClasses: string
    id: string
    isCategory: boolean
    isDead: boolean
    isFinished: boolean
    isMinor: boolean
    parentDocumentId: string | null
    placementId: string | null
    sortOrder: number
    templateId: string
    treeOrderNumber: number
    updatedAtMs: number
    worldId: string
  }>
}))

beforeEach(() => {
  vi.useFakeTimers()
  setActivePinia(createPinia())
  listWorkspaceHierarchyLayoutMock.mockClear()
  getHierarchyTreeUiStateMock.mockClear()
  setHierarchyTreeUiStateMock.mockClear()
  listDocumentsMock.mockClear()
  listDocumentsMock.mockResolvedValue({ items: [] })
  window.faContentBridgeAPIs = {
    projectContent: {
      listDocuments: listDocumentsMock,
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
 * S_FaProjectHierarchyTree refreshLayout loads worlds from bridge without rebuilding treeData.
 */
test('Test that S_FaProjectHierarchyTree refreshLayout loads worlds from bridge without rebuilding treeData', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  store.treeData = [
    {
      children: [],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: false,
      icon: '',
      id: 'world-stale',
      label: 'Stale world',
      nodeKind: 'world',
      placementId: null,
      worldColor: '#000',
      worldId: 'world-stale'
    }
  ]
  await store.refreshLayout()
  expect(listWorkspaceHierarchyLayoutMock).toHaveBeenCalledTimes(1)
  expect(store.worlds).toHaveLength(1)
  expect(store.treeData).toHaveLength(1)
  expect(store.treeData[0]?.id).toBe('world-stale')
})

/**
 * S_FaProjectHierarchyTree refreshLayout keeps prior worlds when bridge is unavailable.
 */
test('Test that S_FaProjectHierarchyTree refreshLayout keeps prior worlds when bridge is unavailable', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshLayout()
  expect(store.worlds).toHaveLength(1)
  store.treeData = [
    {
      children: [],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: false,
      icon: '',
      id: 'world-1',
      label: 'World One',
      nodeKind: 'world',
      placementId: null,
      worldColor: '#ff0000',
      worldId: 'world-1'
    }
  ]
  Object.assign(window.faContentBridgeAPIs, { projectContent: {} })
  await store.refreshLayout()
  expect(store.worlds).toHaveLength(1)
  expect(store.treeData).toHaveLength(1)
  expect(store.treeData[0]?.id).toBe('world-1')
})

test('Test that S_FaProjectHierarchyTree refreshLayout ignores a layout read from an older project', async () => {
  let resolveLayout: ((value: { worlds: never[] }) => void) | undefined
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-a',
    name: 'A'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshLayout()
  expect(store.worlds[0]?.id).toBe('world-1')
  listWorkspaceHierarchyLayoutMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveLayout = resolve
    })
  })
  const pending = store.refreshLayout()
  await Promise.resolve()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  const finishLayout = resolveLayout
  if (finishLayout === undefined) {
    throw new Error('missing layout resolver')
  }
  finishLayout({ worlds: [] })
  await pending
  expect(store.worlds[0]?.id).toBe('world-1')
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

test('Test that S_FaProjectHierarchyTree refreshUiState ignores a read from an older project', async () => {
  let resolveUiState: ((value: {
    expandedNodeIds: string[]
    schemaVersion: 1
    scrollTopPx: number
  }) => void) | undefined
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-a',
    name: 'A'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshUiState()
  expect(store.uiState.expandedNodeIds).toEqual(['world-1'])
  getHierarchyTreeUiStateMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveUiState = resolve
    })
  })
  const pending = store.refreshUiState()
  await Promise.resolve()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  const finishUiState = resolveUiState
  if (finishUiState === undefined) {
    throw new Error('missing ui state resolver')
  }
  finishUiState({
    expandedNodeIds: ['stale-node'],
    schemaVersion: 1,
    scrollTopPx: 99
  })
  await pending
  expect(store.uiState.expandedNodeIds).toEqual(['world-1'])
  expect(store.uiState.scrollTopPx).toBe(24)
})

test('Test that a hierarchy UI refresh does not replace a later expand save', async () => {
  let resolveUiState: ((value: {
    expandedNodeIds: string[]
    schemaVersion: 1
    scrollTopPx: number
  }) => void) | undefined
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshUiState()
  getHierarchyTreeUiStateMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveUiState = resolve
    })
  })
  const pending = store.refreshUiState()
  await Promise.resolve()
  store.queuePersistExpandedNodeIds(['world-1', 'group-1'])
  store.flushUiStatePersist()
  const finishUiState = resolveUiState
  if (finishUiState === undefined) {
    throw new Error('missing ui state resolver')
  }
  finishUiState({
    expandedNodeIds: ['stale-node'],
    schemaVersion: 1,
    scrollTopPx: 99
  })
  await pending
  await vi.runAllTimersAsync()
  expect(store.uiState.expandedNodeIds).toEqual(['world-1', 'group-1'])
  expect(store.uiState.scrollTopPx).toBe(24)
})

test('Test that a hierarchy UI refresh keeps an expand queued during the read', async () => {
  let resolveUiState: ((value: {
    expandedNodeIds: string[]
    schemaVersion: 1
    scrollTopPx: number
  }) => void) | undefined
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshUiState()
  getHierarchyTreeUiStateMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveUiState = resolve
    })
  })
  const pending = store.refreshUiState()
  await Promise.resolve()
  store.queuePersistExpandedNodeIds(['world-1', 'group-1'])
  store.queuePersistScrollTopPx(40)
  const finishUiState = resolveUiState
  if (finishUiState === undefined) {
    throw new Error('missing ui state resolver')
  }
  finishUiState({
    expandedNodeIds: ['stale-node'],
    schemaVersion: 1,
    scrollTopPx: 99
  })
  await pending
  expect(store.uiState.expandedNodeIds).toEqual(['world-1', 'group-1'])
  expect(store.uiState.scrollTopPx).toBe(40)
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
    expandedNodeIdsBaseJson: '["world-1"]'
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
    scrollTopPx: 88
  })
})

/**
 * A refresh that lands after a queued expand drops that stale patch.
 */
test('Test that a hierarchy expand persist drops a patch overwritten by a newer UI refresh', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  store.queuePersistExpandedNodeIds(['stale-world'])
  await store.refreshUiState()
  setHierarchyTreeUiStateMock.mockClear()
  store.flushUiStatePersist()
  await vi.runAllTimersAsync()
  expect(setHierarchyTreeUiStateMock).not.toHaveBeenCalled()
  expect(store.uiState.expandedNodeIds).toEqual(['world-1'])
})

/**
 * An empty expand list must not replace a loaded non-empty list unless the caller collapsed.
 */
test('Test that a hierarchy expand persist ignores an empty list over a loaded snapshot', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshUiState()
  setHierarchyTreeUiStateMock.mockClear()
  store.queuePersistExpandedNodeIds([])
  store.flushUiStatePersist()
  await vi.runAllTimersAsync()
  expect(setHierarchyTreeUiStateMock).not.toHaveBeenCalled()
  expect(store.uiState.expandedNodeIds).toEqual(['world-1'])
})

/**
 * A real collapse may persist an empty expand list.
 */
test('Test that a hierarchy expand persist allows an empty list from a collapse', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshUiState()
  setHierarchyTreeUiStateMock.mockClear()
  store.queuePersistExpandedNodeIds([], {
    allowEmpty: true
  })
  store.flushUiStatePersist()
  await vi.runAllTimersAsync()
  expect(setHierarchyTreeUiStateMock).toHaveBeenCalledWith({
    expandedNodeIds: [],
    expandedNodeIdsBaseJson: '["world-1"]'
  })
})

/**
 * Project-switch flush must not rewrite expand ids the store never changed.
 */
test('Test that a hierarchy project-switch flush skips an unchanged expand list', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshUiState()
  setHierarchyTreeUiStateMock.mockClear()
  await store.flushUiStatePersistBeforeProjectReplacement()
  expect(setHierarchyTreeUiStateMock).not.toHaveBeenCalled()
  expect(store.uiState.expandedNodeIds).toEqual(['world-1'])
})

/**
 * A scroll patch must still carry an expand change that debounce replaced.
 */
test('Test that a hierarchy scroll persist keeps a dirty expand list', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshUiState()
  store.queuePersistExpandedNodeIds(['world-1', 'group-1'])
  store.queuePersistScrollTopPx(88)
  store.flushUiStatePersist()
  await vi.runAllTimersAsync()
  expect(setHierarchyTreeUiStateMock).toHaveBeenCalledWith({
    expandedNodeIds: ['world-1', 'group-1'],
    expandedNodeIdsBaseJson: '["world-1"]',
    scrollTopPx: 88
  })
})

/**
 * S_FaProjectHierarchyTree waits out an in-flight UI write before the project-switch flush.
 */
test('Test that S_FaProjectHierarchyTree flushUiStatePersistBeforeProjectReplacement waits for an in-flight UI write', async () => {
  let resolveWrite: ((value: boolean) => void) | undefined
  setHierarchyTreeUiStateMock.mockImplementationOnce(() => new Promise<boolean>((resolve) => {
    resolveWrite = resolve
  }))
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshUiState()
  store.queuePersistExpandedNodeIds(['world-1', 'group-1'])
  await vi.advanceTimersByTimeAsync(150)
  expect(setHierarchyTreeUiStateMock).toHaveBeenCalledTimes(1)

  store.queuePersistExpandedNodeIds(['world-1', 'group-1', 'placement-1'])
  let replacementDone = false
  const replacement = store.flushUiStatePersistBeforeProjectReplacement().then(() => {
    replacementDone = true
  })
  await Promise.resolve()
  expect(replacementDone).toBe(false)
  expect(setHierarchyTreeUiStateMock).toHaveBeenCalledTimes(1)

  resolveWrite?.(true)
  await replacement

  expect(replacementDone).toBe(true)
  expect(setHierarchyTreeUiStateMock).toHaveBeenCalledTimes(2)
  expect(setHierarchyTreeUiStateMock).toHaveBeenLastCalledWith({
    expandedNodeIds: ['world-1', 'group-1', 'placement-1'],
    expandedNodeIdsBaseJson: '["world-1","group-1"]'
  })
  expect(store.uiState.expandedNodeIds).toEqual(['world-1', 'group-1', 'placement-1'])
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
 * S_FaProjectHierarchyTree
 * A queued expand must not be written after the project epoch moves.
 */
test('Test that a hierarchy UI persist does not write expand state after the project changes', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-a',
    name: 'A'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshUiState()
  setHierarchyTreeUiStateMock.mockClear()
  store.queuePersistExpandedNodeIds(['world-1', 'group-1'])
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  store.flushUiStatePersist()
  await vi.runAllTimersAsync()
  expect(setHierarchyTreeUiStateMock).not.toHaveBeenCalled()
})

/**
 * S_FaProjectHierarchyTree
 * An expand queued while a project switch is in flight must not be written.
 */
test('Test that a hierarchy UI persist does not write expand state during a project switch', async () => {
  await import('../S_FaOpenedDocuments')
  await import('../S_FaProjectSidebar')
  await import('app/src/scripts/floatingWindows/faProjectReplacementPersistHooksWiring')
  let releaseOpen: ((value: { outcome: 'canceled' }) => void) | undefined
  const projectManagement = window.faContentBridgeAPIs?.projectManagement
  if (projectManagement === undefined) {
    throw new Error('missing project management bridge')
  }
  Object.assign(projectManagement, {
    openProject: () => {
      return new Promise((resolve) => {
        releaseOpen = resolve
      })
    }
  })
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-a',
    name: 'A'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshUiState()
  let openFailure: unknown = null
  const opening = S_FaActiveProject().openProjectFromKnownPath('C:\\b.faproject').then(
    () => undefined,
    (error: unknown) => {
      openFailure = error
    }
  )
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (releaseOpen !== undefined || openFailure !== null) {
      break
    }
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(0)
  }
  if (openFailure !== null) {
    throw openFailure
  }
  const finishOpen = releaseOpen
  if (finishOpen === undefined) {
    throw new Error('missing open resolver')
  }
  setHierarchyTreeUiStateMock.mockClear()
  store.queuePersistExpandedNodeIds(['world-1', 'group-1'])
  await vi.advanceTimersByTimeAsync(200)
  expect(setHierarchyTreeUiStateMock).not.toHaveBeenCalled()
  finishOpen({
    outcome: 'canceled'
  })
  await opening
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
 * S_FaProjectHierarchyTree refreshLayout clears treeData when worlds become empty.
 */
test('Test that S_FaProjectHierarchyTree refreshLayout clears treeData when worlds become empty', async () => {
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
 * S_FaProjectHierarchyTree refreshLayout re-fetches when a concurrent caller arrives mid-flight.
 */
test('Test that S_FaProjectHierarchyTree refreshLayout re-fetches after concurrent load completes', async () => {
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
  listWorkspaceHierarchyLayoutMock
    .mockReturnValueOnce(layoutPromise)
    .mockResolvedValueOnce({
      worlds: [
        {
          color: '#ff0000',
          colorPalette: '',
          displayName: 'World One',
          groups: [],
          id: 'world-1',
          placements: [
            {
              displayName: 'Blablas',
              documentTemplateId: 'template-1',
              groupId: null,
              groupSortOrder: null,
              hasChildren: true,
              icon: 'mdi-book',
              id: 'placement-1',
              nickname: 'Blablas',
              rootSortOrder: 0,
              isCategory: false,
              titlePluralTranslations: {},
              titleSingularTranslations: {},
              worldId: 'world-1'
            }
          ],
          sortOrder: 0
        }
      ]
    })
  const store = S_FaProjectHierarchyTree()
  const first = store.refreshLayout()
  const second = store.refreshLayout()
  resolveLayout({
    worlds: [
      {
        color: '#ff0000',
        colorPalette: '',
        displayName: 'World One',
        groups: [],
        id: 'world-1',
        placements: [],
        sortOrder: 0
      }
    ]
  })
  await Promise.all([first, second])
  expect(listWorkspaceHierarchyLayoutMock).toHaveBeenCalledTimes(2)
  expect(store.worlds[0]?.placements).toHaveLength(1)
  expect(store.layoutRefreshGeneration).toBe(1)
})

/**
 * S_FaProjectHierarchyTree bumpDocumentCensusRefreshGeneration notifies overview reload watchers.
 */
test('Test that S_FaProjectHierarchyTree bumpDocumentCensusRefreshGeneration increments generation', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaProjectHierarchyTree()
  expect(store.documentCensusRefreshGeneration).toBe(0)
  store.bumpDocumentCensusRefreshGeneration()
  expect(store.documentCensusRefreshGeneration).toBe(1)
  store.bumpDocumentCensusRefreshGeneration()
  expect(store.documentCensusRefreshGeneration).toBe(2)
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

test('Test that S_FaProjectHierarchyTree patchWorldColorPaletteInLayout updates matching world palette', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshLayout()
  store.patchWorldColorPaletteInLayout('world-1', '#aabbcc,#ddeeff')
  expect(store.worlds[0]?.colorPalette).toBe('#aabbcc,#ddeeff')
  store.patchWorldColorPaletteInLayout('world-missing', '#000000')
  expect(store.worlds[0]?.colorPalette).toBe('#aabbcc,#ddeeff')
})

test('Test that a layout refresh does not replace a later world palette patch', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshLayout()
  let resolveLayout: (value: Awaited<ReturnType<typeof listWorkspaceHierarchyLayoutMock>>) => void = () => undefined
  const layoutPromise = new Promise<Awaited<ReturnType<typeof listWorkspaceHierarchyLayoutMock>>>((resolve) => {
    resolveLayout = resolve
  })
  listWorkspaceHierarchyLayoutMock.mockReturnValueOnce(layoutPromise)
  const pending = store.refreshLayout()
  await Promise.resolve()
  store.patchWorldColorPaletteInLayout('world-1', '#aabbcc')
  resolveLayout({
    worlds: [
      {
        color: '#00ff00',
        colorPalette: '',
        displayName: 'World Renamed',
        groups: [],
        id: 'world-1',
        placements: [],
        sortOrder: 0
      }
    ]
  })
  await pending
  expect(store.worlds[0]?.color).toBe('#00ff00')
  expect(store.worlds[0]?.colorPalette).toBe('#aabbcc')
  expect(store.worlds[0]?.displayName).toBe('World Renamed')
  expect(store.worlds[0]?.placements).toEqual([])
})

test('Test that a layout refresh started after a world palette patch uses the bridge palette', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.refreshLayout()
  store.patchWorldColorPaletteInLayout('world-1', '#aabbcc')
  listWorkspaceHierarchyLayoutMock.mockResolvedValueOnce({
    worlds: [
      {
        color: '#ff0000',
        colorPalette: '#112233',
        displayName: 'World One',
        groups: [],
        id: 'world-1',
        placements: [],
        sortOrder: 0
      }
    ]
  })
  await store.refreshLayout()
  expect(store.worlds[0]?.colorPalette).toBe('#112233')
})

const sampleIndexDocument = {
  createdAtMs: 1,
  displayName: 'Hero',
  documentBackgroundColor: null,
  documentTextColor: null,
  extraClasses: '',
  id: 'doc-1',
  isCategory: false,
  isDead: false,
  isFinished: false,
  isMinor: false,
  parentDocumentId: null as string | null,
  placementId: 'placement-1' as string | null,
  sortOrder: 0,
  templateId: 'tpl-1',
  treeOrderNumber: 1,
  updatedAtMs: 1,
  worldId: 'world-1'
}

/**
 * S_FaProjectHierarchyTree ensureDocumentIndexLoaded
 * Fetches listDocuments once per project and does not refetch on refreshLayout.
 */
test('Test that S_FaProjectHierarchyTree loads the document index once and skips listDocuments on refreshLayout', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  listDocumentsMock.mockResolvedValue({
    items: [sampleIndexDocument]
  })
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  await store.ensureDocumentIndexLoaded()
  await store.ensureDocumentIndexLoaded()
  await store.refreshLayout()
  expect(listDocumentsMock).toHaveBeenCalledTimes(1)
  expect(store.listIndexedPlacementChildren({
    parentDocumentId: null,
    placementId: 'placement-1'
  }).map((item) => item.id)).toEqual(['doc-1'])
})

/**
 * S_FaProjectHierarchyTree resetOnProjectClose
 * Drops the session document index.
 */
test('Test that S_FaProjectHierarchyTree resetOnProjectClose clears the document index', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  store.replaceDocumentIndexFromDocuments([sampleIndexDocument])
  store.resetOnProjectClose()
  expect(store.listIndexedPlacementChildren({
    parentDocumentId: null,
    placementId: 'placement-1'
  })).toEqual([])
})

/**
 * S_FaProjectHierarchyTree ensureDocumentIndexLoaded
 * Drops a dump that finishes after the active project id changes.
 */
test('Test that S_FaProjectHierarchyTree drops a superseded document dump', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  let resolveDump: ((value: { items: typeof sampleIndexDocument[] }) => void) | undefined
  listDocumentsMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveDump = resolve
    })
  })
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-a',
    name: 'A'
  })
  const store = S_FaProjectHierarchyTree()
  const pending = store.ensureDocumentIndexLoaded()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  resolveDump?.({
    items: [sampleIndexDocument]
  })
  await pending
  expect(store.listIndexedPlacementChildren({
    parentDocumentId: null,
    placementId: 'placement-1'
  })).toEqual([])
})

/**
 * S_FaProjectHierarchyTree reloadDocumentIndexFromBridge
 * Refetches listDocuments even when an index is already loaded.
 */
test('Test that S_FaProjectHierarchyTree reloadDocumentIndexFromBridge refetches the dump', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  store.replaceDocumentIndexFromDocuments([sampleIndexDocument])
  listDocumentsMock.mockResolvedValue({
    items: [{
      ...sampleIndexDocument,
      displayName: 'Reloaded',
      id: 'doc-2'
    }]
  })
  await store.reloadDocumentIndexFromBridge()
  expect(listDocumentsMock).toHaveBeenCalledTimes(1)
  expect(store.listIndexedPlacementChildren({
    parentDocumentId: null,
    placementId: 'placement-1'
  }).map((item) => item.id)).toEqual(['doc-2'])
})

/**
 * S_FaProjectHierarchyTree ensureDocumentIndexLoaded
 * Clears the index when no project is active.
 */
test('Test that S_FaProjectHierarchyTree ensureDocumentIndexLoaded clears without an active project', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaProjectHierarchyTree()
  store.replaceDocumentIndexFromDocuments([sampleIndexDocument])
  await store.ensureDocumentIndexLoaded()
  expect(listDocumentsMock).not.toHaveBeenCalled()
  expect(store.listIndexedPlacementChildren({
    parentDocumentId: null,
    placementId: 'placement-1'
  })).toEqual([])
})

/**
 * S_FaProjectHierarchyTree ensureDocumentIndexLoaded
 * Shares one in-flight dump across callers.
 */
test('Test that S_FaProjectHierarchyTree shares in-flight document dump loads', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  let resolveDump: ((value: { items: typeof sampleIndexDocument[] }) => void) | undefined
  listDocumentsMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveDump = resolve
    })
  })
  const first = store.ensureDocumentIndexLoaded()
  const second = store.ensureDocumentIndexLoaded()
  resolveDump?.({
    items: [sampleIndexDocument]
  })
  await Promise.all([first, second])
  expect(listDocumentsMock).toHaveBeenCalledTimes(1)
  expect(store.listIndexedPlacementChildren({
    parentDocumentId: null,
    placementId: 'placement-1'
  }).map((item) => item.id)).toEqual(['doc-1'])
})

test('Test that a document index load does not replace a later indexed document', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  const indexedSidekick = {
    ...sampleIndexDocument,
    displayName: 'Sidekick',
    id: 'doc-2',
    sortOrder: 1
  }
  let resolveDump: ((value: { items: typeof sampleIndexDocument[] }) => void) | undefined
  let listCalls = 0
  listDocumentsMock.mockImplementation(() => {
    listCalls += 1
    if (listCalls === 1) {
      return new Promise((resolve) => {
        resolveDump = resolve
      })
    }
    return Promise.resolve({
      items: [sampleIndexDocument, indexedSidekick]
    })
  })
  const pending = store.ensureDocumentIndexLoaded()
  await Promise.resolve()
  store.upsertIndexedDocument(indexedSidekick)
  resolveDump?.({
    items: [sampleIndexDocument]
  })
  await pending
  expect(listDocumentsMock).toHaveBeenCalledTimes(2)
  expect(store.listIndexedPlacementChildren({
    parentDocumentId: null,
    placementId: 'placement-1'
  }).map((item) => item.id)).toEqual(['doc-1', 'doc-2'])
})

/**
 * S_FaProjectHierarchyTree reloadDocumentIndexFromBridge
 * Keeps a prior index when listDocuments fails.
 */
test('Test that S_FaProjectHierarchyTree keeps the document index when dump reload fails', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  store.replaceDocumentIndexFromDocuments([sampleIndexDocument])
  listDocumentsMock.mockRejectedValueOnce(new Error('dump failed'))
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await store.reloadDocumentIndexFromBridge()
  expect(store.listIndexedPlacementChildren({
    parentDocumentId: null,
    placementId: 'placement-1'
  }).map((item) => item.id)).toEqual(['doc-1'])
  errorSpy.mockRestore()
})

/**
 * S_FaProjectHierarchyTree ensureDocumentIndexLoaded
 * Marks a failed first dump as loaded so hydrate does not retry-loop.
 */
test('Test that S_FaProjectHierarchyTree does not retry a failed document dump without forceReload', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  listDocumentsMock.mockRejectedValueOnce(new Error('dump failed'))
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await store.ensureDocumentIndexLoaded()
  await store.ensureDocumentIndexLoaded()
  expect(listDocumentsMock).toHaveBeenCalledTimes(1)
  errorSpy.mockRestore()
})

/**
 * S_FaProjectHierarchyTree document index patches
 * upsert, reindex, and move update listed children.
 */
test('Test that S_FaProjectHierarchyTree document index patches update listed children', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  store.replaceDocumentIndexFromDocuments([
    sampleIndexDocument,
    {
      ...sampleIndexDocument,
      displayName: 'Sidekick',
      id: 'doc-2',
      sortOrder: 1
    }
  ])
  store.upsertIndexedDocument({
    ...sampleIndexDocument,
    displayName: 'Renamed Hero'
  })
  store.applyIndexedReindexBucket({
    movedDocumentId: 'doc-2',
    orderedDocumentIds: ['doc-2', 'doc-1'],
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  expect(store.listIndexedPlacementChildren({
    parentDocumentId: null,
    placementId: 'placement-1'
  }).map((item) => item.id)).toEqual(['doc-2', 'doc-1'])
  store.applyIndexedMove({
    documentId: 'doc-2',
    targetParentDocumentId: 'doc-1',
    targetSortOrder: 0
  })
  expect(store.listIndexedPlacementChildren({
    parentDocumentId: 'doc-1',
    placementId: 'placement-1'
  }).map((item) => item.id)).toEqual(['doc-2'])
})

/**
 * S_FaProjectHierarchyTree replaceSessionForComponentTesting
 * Clears the document index so component tests start dump-empty.
 */
test('Test that S_FaProjectHierarchyTree replaceSessionForComponentTesting clears the document index', async () => {
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const store = S_FaProjectHierarchyTree()
  store.replaceDocumentIndexFromDocuments([sampleIndexDocument])
  store.replaceSessionForComponentTesting({
    worlds: []
  })
  expect(store.listIndexedPlacementChildren({
    parentDocumentId: null,
    placementId: 'placement-1'
  })).toEqual([])
})
