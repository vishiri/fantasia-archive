import { beforeEach, expect, test, vi } from 'vitest'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'

const { handleMock, runWithDbMock } = vi.hoisted(() => ({
  handleMock: vi.fn(),
  runWithDbMock: vi.fn() as ReturnType<typeof vi.fn>
}))

vi.mock('electron', () => ({
  ipcMain: {
    handle: handleMock
  }
}))

vi.mock('app/src-electron/mainScripts/projectManagement/projectManagement_manager', () => ({
  readFaProjectHierarchyTreeUiState: vi.fn(() => ({
    schemaVersion: 1,
    expandedNodeIds: [],
    scrollTopPx: 0
  })),
  runWithFaProjectDatabaseForIpcAsync: runWithDbMock,
  upsertFaProjectHierarchyTreeUiStateKv: vi.fn()
}))

beforeEach(() => {
  handleMock.mockReset()
  runWithDbMock.mockReset()
  runWithDbMock.mockImplementation(async (_event: unknown, work: (db: unknown) => unknown) => {
    return {
      ok: true as const,
      value: await work({})
    }
  })
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = handleMock.mock.calls.find((c) => c[0]! === channel)
  expect(call).toBeDefined()
  return call?.[1]! as (...args: unknown[]) => unknown
}

/**
 * registerFaProjectManagementHierarchyTreeUiStateIpc
 * Registers get/set handlers for hierarchy_tree_ui_state KV.
 */
test('Test that registerFaProjectManagementHierarchyTreeUiStateIpc registers handlers', async () => {
  const { registerFaProjectManagementHierarchyTreeUiStateIpc } = await import(
    '../registerFaProjectManagementHierarchyTreeUiStateIpc'
  )
  registerFaProjectManagementHierarchyTreeUiStateIpc()
  expect(handlerFor(FA_PROJECT_MANAGEMENT_IPC.getHierarchyTreeUiStateAsync)).toBeTypeOf('function')
  expect(handlerFor(FA_PROJECT_MANAGEMENT_IPC.setHierarchyTreeUiStatePatchAsync)).toBeTypeOf('function')
})

/**
 * registerFaProjectManagementHierarchyTreeUiStateIpc
 * getHierarchyTreeUiStateAsync returns fallback when DB unavailable.
 */
test('Test that getHierarchyTreeUiStateAsync returns fallback when DB is unavailable', async () => {
  runWithDbMock.mockResolvedValueOnce({
    ok: false as const,
    reason: 'no-db'
  })
  const { registerFaProjectManagementHierarchyTreeUiStateIpc } = await import(
    '../registerFaProjectManagementHierarchyTreeUiStateIpc'
  )
  registerFaProjectManagementHierarchyTreeUiStateIpc()
  const result = await handlerFor(FA_PROJECT_MANAGEMENT_IPC.getHierarchyTreeUiStateAsync)({})
  expect(result).toEqual({
    schemaVersion: 1,
    expandedNodeIds: [],
    scrollTopPx: 0
  })
})

/**
 * registerFaProjectManagementHierarchyTreeUiStateIpc
 * setHierarchyTreeUiStatePatchAsync returns false when DB unavailable.
 */
test('Test that setHierarchyTreeUiStatePatchAsync returns false when DB is unavailable', async () => {
  runWithDbMock.mockResolvedValueOnce({
    ok: false as const,
    reason: 'no-db'
  })
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const { registerFaProjectManagementHierarchyTreeUiStateIpc } = await import(
    '../registerFaProjectManagementHierarchyTreeUiStateIpc'
  )
  registerFaProjectManagementHierarchyTreeUiStateIpc()
  const result = await handlerFor(FA_PROJECT_MANAGEMENT_IPC.setHierarchyTreeUiStatePatchAsync)(
    {},
    { scrollTopPx: 4 }
  )
  expect(result).toBe(false)
  warnSpy.mockRestore()
})

/**
 * registerFaProjectManagementHierarchyTreeUiStateIpc
 * getHierarchyTreeUiStateAsync returns persisted state when DB is available.
 */
test('Test that getHierarchyTreeUiStateAsync returns DB snapshot when available', async () => {
  const snapshot = {
    schemaVersion: 1 as const,
    expandedNodeIds: ['world-1'],
    scrollTopPx: 8
  }
  const { readFaProjectHierarchyTreeUiState, upsertFaProjectHierarchyTreeUiStateKv } = await import(
    'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
  )
  vi.mocked(readFaProjectHierarchyTreeUiState).mockReturnValueOnce(snapshot)
  const { registerFaProjectManagementHierarchyTreeUiStateIpc } = await import(
    '../registerFaProjectManagementHierarchyTreeUiStateIpc'
  )
  registerFaProjectManagementHierarchyTreeUiStateIpc()
  const result = await handlerFor(FA_PROJECT_MANAGEMENT_IPC.getHierarchyTreeUiStateAsync)({})
  expect(result).toEqual(snapshot)
  expect(readFaProjectHierarchyTreeUiState).toHaveBeenCalled()
  expect(upsertFaProjectHierarchyTreeUiStateKv).toBeDefined()
})

/**
 * registerFaProjectManagementHierarchyTreeUiStateIpc
 * setHierarchyTreeUiStatePatchAsync persists patch when DB is available.
 */
test('Test that setHierarchyTreeUiStatePatchAsync returns true when DB is available', async () => {
  const { upsertFaProjectHierarchyTreeUiStateKv } = await import(
    'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
  )
  const { registerFaProjectManagementHierarchyTreeUiStateIpc } = await import(
    '../registerFaProjectManagementHierarchyTreeUiStateIpc'
  )
  registerFaProjectManagementHierarchyTreeUiStateIpc()
  const result = await handlerFor(FA_PROJECT_MANAGEMENT_IPC.setHierarchyTreeUiStatePatchAsync)(
    {},
    { expandedNodeIds: ['world-1'] }
  )
  expect(result).toBe(true)
  expect(upsertFaProjectHierarchyTreeUiStateKv).toHaveBeenCalled()
})
