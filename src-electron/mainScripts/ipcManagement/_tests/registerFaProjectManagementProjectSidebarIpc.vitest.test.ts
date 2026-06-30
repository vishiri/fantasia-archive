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
  readFaProjectSidebarRoot: vi.fn(() => ({
    schemaVersion: 1,
    widthPx: 420
  })),
  runWithFaProjectDatabaseForIpcAsync: runWithDbMock,
  upsertFaProjectSidebarKv: vi.fn()
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
 * registerFaProjectManagementProjectSidebarIpc
 * Registers get/set handlers for project sidebar KV.
 */
test('Test that registerFaProjectManagementProjectSidebarIpc registers handlers', async () => {
  const { registerFaProjectManagementProjectSidebarIpc } = await import(
    '../registerFaProjectManagementProjectSidebarIpc'
  )
  registerFaProjectManagementProjectSidebarIpc()
  expect(handlerFor(FA_PROJECT_MANAGEMENT_IPC.getProjectSidebarAsync)).toBeTypeOf('function')
  expect(handlerFor(FA_PROJECT_MANAGEMENT_IPC.setProjectSidebarPatchAsync)).toBeTypeOf('function')
})

/**
 * registerFaProjectManagementProjectSidebarIpc
 * getProjectSidebarAsync returns fallback when DB unavailable.
 */
test('Test that getProjectSidebarAsync returns fallback when DB is unavailable', async () => {
  runWithDbMock.mockResolvedValueOnce({
    ok: false as const,
    reason: 'no-db'
  })
  const { registerFaProjectManagementProjectSidebarIpc } = await import(
    '../registerFaProjectManagementProjectSidebarIpc'
  )
  registerFaProjectManagementProjectSidebarIpc()
  const result = await handlerFor(FA_PROJECT_MANAGEMENT_IPC.getProjectSidebarAsync)({})
  expect(result).toEqual({
    schemaVersion: 1,
    widthPx: 375
  })
})

/**
 * registerFaProjectManagementProjectSidebarIpc
 * getProjectSidebarAsync returns DB snapshot when available.
 */
test('Test that getProjectSidebarAsync returns DB snapshot when available', async () => {
  const snapshot = {
    schemaVersion: 1 as const,
    widthPx: 512
  }
  const { readFaProjectSidebarRoot } = await import(
    'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
  )
  vi.mocked(readFaProjectSidebarRoot).mockReturnValueOnce(snapshot)
  const { registerFaProjectManagementProjectSidebarIpc } = await import(
    '../registerFaProjectManagementProjectSidebarIpc'
  )
  registerFaProjectManagementProjectSidebarIpc()
  const result = await handlerFor(FA_PROJECT_MANAGEMENT_IPC.getProjectSidebarAsync)({})
  expect(result).toEqual(snapshot)
})

/**
 * registerFaProjectManagementProjectSidebarIpc
 * setProjectSidebarPatchAsync returns false when DB unavailable.
 */
test('Test that setProjectSidebarPatchAsync returns false when DB is unavailable', async () => {
  runWithDbMock.mockResolvedValueOnce({
    ok: false as const,
    reason: 'no-db'
  })
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const { registerFaProjectManagementProjectSidebarIpc } = await import(
    '../registerFaProjectManagementProjectSidebarIpc'
  )
  registerFaProjectManagementProjectSidebarIpc()
  const result = await handlerFor(FA_PROJECT_MANAGEMENT_IPC.setProjectSidebarPatchAsync)(
    {},
    { widthPx: 400 }
  )
  expect(result).toBe(false)
  warnSpy.mockRestore()
})

/**
 * registerFaProjectManagementProjectSidebarIpc
 * setProjectSidebarPatchAsync persists patch when DB is available.
 */
test('Test that setProjectSidebarPatchAsync returns true when DB is available', async () => {
  const { upsertFaProjectSidebarKv } = await import(
    'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
  )
  const { registerFaProjectManagementProjectSidebarIpc } = await import(
    '../registerFaProjectManagementProjectSidebarIpc'
  )
  registerFaProjectManagementProjectSidebarIpc()
  const result = await handlerFor(FA_PROJECT_MANAGEMENT_IPC.setProjectSidebarPatchAsync)(
    {},
    { widthPx: 400 }
  )
  expect(result).toBe(true)
  expect(upsertFaProjectSidebarKv).toHaveBeenCalled()
})
