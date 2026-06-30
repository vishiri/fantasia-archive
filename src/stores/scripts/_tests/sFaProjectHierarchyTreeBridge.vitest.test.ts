/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'

const {
  getHierarchyTreeUiStateMock,
  listWorkspaceHierarchyLayoutMock,
  setHierarchyTreeUiStateMock
} = vi.hoisted(() => {
  return {
    getHierarchyTreeUiStateMock: vi.fn(async () => ({
      expandedNodeIds: ['world-1'],
      schemaVersion: 1 as const,
      scrollTopPx: 42
    })),
    listWorkspaceHierarchyLayoutMock: vi.fn(async () => ({
      worlds: [
        {
          color: '#ff0000',
          displayName: 'World One',
          groups: [],
          id: 'world-1',
          placements: [],
          sortOrder: 0
        }
      ]
    })),
    setHierarchyTreeUiStateMock: vi.fn(async () => true)
  }
})

beforeEach(() => {
  getHierarchyTreeUiStateMock.mockReset()
  getHierarchyTreeUiStateMock.mockResolvedValue({
    expandedNodeIds: ['world-1'],
    schemaVersion: 1,
    scrollTopPx: 42
  })
  listWorkspaceHierarchyLayoutMock.mockReset()
  listWorkspaceHierarchyLayoutMock.mockResolvedValue({
    worlds: [
      {
        color: '#ff0000',
        displayName: 'World One',
        groups: [],
        id: 'world-1',
        placements: [],
        sortOrder: 0
      }
    ]
  })
  setHierarchyTreeUiStateMock.mockReset()
  setHierarchyTreeUiStateMock.mockResolvedValue(true)

  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          listWorkspaceHierarchyLayout: listWorkspaceHierarchyLayoutMock
        },
        projectManagement: {
          getHierarchyTreeUiState: getHierarchyTreeUiStateMock,
          setHierarchyTreeUiState: setHierarchyTreeUiStateMock
        }
      }
    },
    configurable: true,
    writable: true
  })
})

/**
 * createEmptyProjectHierarchyTreeUiState returns the default empty UI state.
 */
test('Test that createEmptyProjectHierarchyTreeUiState returns defaults', async () => {
  const { createEmptyProjectHierarchyTreeUiState } = await import('../sFaProjectHierarchyTreeBridge')
  expect(createEmptyProjectHierarchyTreeUiState()).toEqual({
    expandedNodeIds: [],
    schemaVersion: 1,
    scrollTopPx: 0
  })
})

/**
 * faProjectHierarchyTreeRefreshUiStateFromBridge applies bridge state.
 */
test('Test that faProjectHierarchyTreeRefreshUiStateFromBridge applies bridge state', async () => {
  const applyUiState = vi.fn()
  const { faProjectHierarchyTreeRefreshUiStateFromBridge } = await import('../sFaProjectHierarchyTreeBridge')
  await expect(
    faProjectHierarchyTreeRefreshUiStateFromBridge({ applyUiState })
  ).resolves.toBe(true)
  expect(applyUiState).toHaveBeenCalledWith({
    expandedNodeIds: ['world-1'],
    schemaVersion: 1,
    scrollTopPx: 42
  })
})

/**
 * faProjectHierarchyTreeRefreshUiStateFromBridge returns false when API is missing.
 */
test('Test that faProjectHierarchyTreeRefreshUiStateFromBridge returns false when API is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, { projectManagement: {} })
  const { faProjectHierarchyTreeRefreshUiStateFromBridge } = await import('../sFaProjectHierarchyTreeBridge')
  await expect(
    faProjectHierarchyTreeRefreshUiStateFromBridge({ applyUiState: vi.fn() })
  ).resolves.toBe(false)
})

/**
 * faProjectHierarchyTreeRefreshUiStateFromBridge logs and returns false on read failure.
 */
test('Test that faProjectHierarchyTreeRefreshUiStateFromBridge handles read failures', async () => {
  getHierarchyTreeUiStateMock.mockRejectedValueOnce(new Error('read failed'))
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectHierarchyTreeRefreshUiStateFromBridge } = await import('../sFaProjectHierarchyTreeBridge')
  await expect(
    faProjectHierarchyTreeRefreshUiStateFromBridge({ applyUiState: vi.fn() })
  ).resolves.toBe(false)
  expect(errorSpy).toHaveBeenCalled()
  errorSpy.mockRestore()
})

/**
 * faProjectHierarchyTreePersistUiStatePatchFromBridge writes via bridge.
 */
test('Test that faProjectHierarchyTreePersistUiStatePatchFromBridge writes via bridge', async () => {
  const { faProjectHierarchyTreePersistUiStatePatchFromBridge } = await import('../sFaProjectHierarchyTreeBridge')
  await expect(
    faProjectHierarchyTreePersistUiStatePatchFromBridge({
      expandedNodeIds: ['a'],
      scrollTopPx: 10
    })
  ).resolves.toBe(true)
  expect(setHierarchyTreeUiStateMock).toHaveBeenCalledWith({
    expandedNodeIds: ['a'],
    scrollTopPx: 10
  })
})

/**
 * faProjectHierarchyTreePersistUiStatePatchFromBridge warns when API is missing.
 */
test('Test that faProjectHierarchyTreePersistUiStatePatchFromBridge returns false when API is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, { projectManagement: {} })
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  const { faProjectHierarchyTreePersistUiStatePatchFromBridge } = await import('../sFaProjectHierarchyTreeBridge')
  await expect(
    faProjectHierarchyTreePersistUiStatePatchFromBridge({ scrollTopPx: 1 })
  ).resolves.toBe(false)
  expect(warnSpy).toHaveBeenCalled()
  warnSpy.mockRestore()
})

/**
 * faProjectHierarchyTreePersistUiStatePatchFromBridge logs write failures.
 */
test('Test that faProjectHierarchyTreePersistUiStatePatchFromBridge handles write failures', async () => {
  setHierarchyTreeUiStateMock.mockRejectedValueOnce(new Error('write failed'))
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectHierarchyTreePersistUiStatePatchFromBridge } = await import('../sFaProjectHierarchyTreeBridge')
  await expect(
    faProjectHierarchyTreePersistUiStatePatchFromBridge({ scrollTopPx: 1 })
  ).resolves.toBe(false)
  expect(errorSpy).toHaveBeenCalled()
  errorSpy.mockRestore()
})

/**
 * faProjectHierarchyTreePersistUiStatePatchFromBridge warns when bridge returns false.
 */
test('Test that faProjectHierarchyTreePersistUiStatePatchFromBridge warns when bridge returns false', async () => {
  setHierarchyTreeUiStateMock.mockResolvedValueOnce(false)
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  const { faProjectHierarchyTreePersistUiStatePatchFromBridge } = await import('../sFaProjectHierarchyTreeBridge')
  await expect(
    faProjectHierarchyTreePersistUiStatePatchFromBridge({ scrollTopPx: 1 })
  ).resolves.toBe(false)
  expect(warnSpy).toHaveBeenCalled()
  warnSpy.mockRestore()
})

/**
 * faProjectHierarchyTreeRefreshLayoutFromBridge returns layout from bridge.
 */
test('Test that faProjectHierarchyTreeRefreshLayoutFromBridge returns layout from bridge', async () => {
  const { faProjectHierarchyTreeRefreshLayoutFromBridge } = await import('../sFaProjectHierarchyTreeBridge')
  await expect(faProjectHierarchyTreeRefreshLayoutFromBridge()).resolves.toEqual({
    worlds: [
      {
        color: '#ff0000',
        displayName: 'World One',
        groups: [],
        id: 'world-1',
        placements: [],
        sortOrder: 0
      }
    ]
  })
})

/**
 * faProjectHierarchyTreeRefreshLayoutFromBridge returns null when API is missing.
 */
test('Test that faProjectHierarchyTreeRefreshLayoutFromBridge returns null when API is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, { projectContent: {} })
  const { faProjectHierarchyTreeRefreshLayoutFromBridge } = await import('../sFaProjectHierarchyTreeBridge')
  await expect(faProjectHierarchyTreeRefreshLayoutFromBridge()).resolves.toBeNull()
})

/**
 * faProjectHierarchyTreeRefreshLayoutFromBridge logs and returns null on read failure.
 */
test('Test that faProjectHierarchyTreeRefreshLayoutFromBridge handles read failures', async () => {
  listWorkspaceHierarchyLayoutMock.mockRejectedValueOnce(new Error('layout failed'))
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectHierarchyTreeRefreshLayoutFromBridge } = await import('../sFaProjectHierarchyTreeBridge')
  await expect(faProjectHierarchyTreeRefreshLayoutFromBridge()).resolves.toBeNull()
  expect(errorSpy).toHaveBeenCalled()
  errorSpy.mockRestore()
})
