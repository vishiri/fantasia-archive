import { beforeEach, expect, test, vi } from 'vitest'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'

const {
  runCreateMock,
  runOpenMock,
  ipcMainHandleMock,
  appOnMock,
  closeActiveMock,
  getRecentSnapshotMock,
  readProjectNoteboardRootMock,
  upsertProjectNoteboardKvMock,
  getFaProjectActiveDbMock
} = vi.hoisted(() => {
  return {
    appOnMock: vi.fn(),
    closeActiveMock: vi.fn(),
    getFaProjectActiveDbMock: vi.fn(),
    getRecentSnapshotMock: vi.fn((): Array<{ filePath: string, name: string }> => []),
    ipcMainHandleMock: vi.fn(),
    readProjectNoteboardRootMock: vi.fn(),
    runCreateMock: vi.fn(async () => ({ outcome: 'canceled' as const })),
    runOpenMock: vi.fn(async () => ({ outcome: 'canceled' as const })),
    upsertProjectNoteboardKvMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    app: {
      on: appOnMock
    },
    ipcMain: {
      handle: ipcMainHandleMock
    }
  }
})

vi.mock('app/src-electron/mainScripts/projectManagement/faProjectCreateRun', () => {
  return {
    runFaProjectCreateFromIpc: runCreateMock
  }
})

vi.mock('app/src-electron/mainScripts/projectManagement/faProjectOpenRun', () => {
  return {
    runFaProjectOpenFromIpc: runOpenMock
  }
})

vi.mock('app/src-electron/mainScripts/projectManagement/faProjectActiveDatabase', () => {
  return {
    closeFaProjectActiveDatabase: closeActiveMock,
    getFaProjectActiveDatabase: () => getFaProjectActiveDbMock()
  }
})

vi.mock('app/src-electron/mainScripts/projectManagement/faRecentProjectListRuntime', () => {
  return {
    getRecentProjectsSnapshot: getRecentSnapshotMock
  }
})

vi.mock(
  'app/src-electron/mainScripts/projectManagement/faProjectNoteboardPersist',
  () => {
    return {
      readFaProjectNoteboardRoot: readProjectNoteboardRootMock,
      upsertFaProjectNoteboardKv: upsertProjectNoteboardKvMock
    }
  }
)

beforeEach(async () => {
  vi.resetModules()
  ipcMainHandleMock.mockReset()
  appOnMock.mockReset()
  closeActiveMock.mockReset()
  runCreateMock.mockReset()
  runOpenMock.mockReset()
  runCreateMock.mockResolvedValue({ outcome: 'canceled' })
  runOpenMock.mockResolvedValue({ outcome: 'canceled' })
  getRecentSnapshotMock.mockReset()
  getRecentSnapshotMock.mockReturnValue([])
  readProjectNoteboardRootMock.mockReset()
  upsertProjectNoteboardKvMock.mockReset()
  getFaProjectActiveDbMock.mockReset()
  getFaProjectActiveDbMock.mockReturnValue(null)
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = ipcMainHandleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()
  return call?.[1] as (...args: unknown[]) => unknown
}

test('registerFaProjectManagementIpc registers project-noteboard IPC handlers with create, recent, open, and before-quit hook once', async () => {
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  expect(ipcMainHandleMock).toHaveBeenCalledWith(
    FA_PROJECT_MANAGEMENT_IPC.createProjectAsync,
    expect.any(Function)
  )
  expect(ipcMainHandleMock).toHaveBeenCalledWith(
    FA_PROJECT_MANAGEMENT_IPC.getRecentProjectsAsync,
    expect.any(Function)
  )
  expect(ipcMainHandleMock).toHaveBeenCalledWith(
    FA_PROJECT_MANAGEMENT_IPC.getProjectNoteboardAsync,
    expect.any(Function)
  )
  expect(ipcMainHandleMock).toHaveBeenCalledWith(
    FA_PROJECT_MANAGEMENT_IPC.setProjectNoteboardPatchAsync,
    expect.any(Function)
  )
  expect(ipcMainHandleMock).toHaveBeenCalledWith(
    FA_PROJECT_MANAGEMENT_IPC.openProjectAsync,
    expect.any(Function)
  )
  expect(appOnMock).toHaveBeenCalledWith('before-quit', expect.any(Function))

  const afterFirstHandle = ipcMainHandleMock.mock.calls.length
  const afterFirstOn = appOnMock.mock.calls.length
  registerFaProjectManagementIpc()
  expect(ipcMainHandleMock.mock.calls.length).toBe(afterFirstHandle)
  expect(appOnMock.mock.calls.length).toBe(afterFirstOn)
})

test('getRecentProjectsAsync handler returns snapshot rows', async () => {
  getRecentSnapshotMock.mockReturnValueOnce([
    {
      filePath: 'D:\\m.faproject',
      name: 'Mine'
    }
  ])
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const h = handlerFor(FA_PROJECT_MANAGEMENT_IPC.getRecentProjectsAsync)
  expect(h(undefined as never, undefined as never)).toEqual([
    {
      filePath: 'D:\\m.faproject',
      name: 'Mine'
    }
  ])
  expect(getRecentSnapshotMock).toHaveBeenCalledOnce()
})

test('createProjectAsync handler delegates to runFaProjectCreateFromIpc', async () => {
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const h = handlerFor(FA_PROJECT_MANAGEMENT_IPC.createProjectAsync)
  await expect(h({}, { projectName: 'Alpha' })).resolves.toEqual({ outcome: 'canceled' })
  expect(runCreateMock).toHaveBeenCalledOnce()
})

test('openProjectAsync handler delegates to runFaProjectOpenFromIpc', async () => {
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const h = handlerFor(FA_PROJECT_MANAGEMENT_IPC.openProjectAsync)
  await expect(h({}, {})).resolves.toEqual({ outcome: 'canceled' })
  expect(runOpenMock).toHaveBeenCalledOnce()
})

test('getProjectNoteboardAsync returns default snapshot when active database handle is absent', async () => {
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const h = handlerFor(FA_PROJECT_MANAGEMENT_IPC.getProjectNoteboardAsync)
  expect(readProjectNoteboardRootMock).not.toHaveBeenCalled()
  expect(h()).toEqual({
    frame: null,
    schemaVersion: 1,
    text: ''
  })
})

test('getProjectNoteboardAsync clones persisted root payload', async () => {
  const fakeDb = { dummy: true } as unknown
  getFaProjectActiveDbMock.mockReturnValue(fakeDb)
  readProjectNoteboardRootMock.mockImplementation(() => {
    return {
      frame: {
        height: 400,
        width: 500,
        x: 11,
        y: 22
      },
      schemaVersion: 1,
      text: 'alpha'
    }
  })
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const h = handlerFor(FA_PROJECT_MANAGEMENT_IPC.getProjectNoteboardAsync)
  const snap = h() as { frame: { x: number } }
  snap.frame.x = -1
  const second = h() as { frame: { x: number } }
  expect(second.frame.x).toBe(11)
  expect(readProjectNoteboardRootMock).toHaveBeenCalledTimes(2)
})

test('setProjectNoteboardPatchAsync upserts KV rows against the active SQLite handle', async () => {
  const fakeDb = { tag: 'db' } as unknown
  getFaProjectActiveDbMock.mockReturnValue(fakeDb)
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const h = handlerFor(FA_PROJECT_MANAGEMENT_IPC.setProjectNoteboardPatchAsync)
  const ok = h(undefined as never, {
    text: 'next'
  }) as boolean
  expect(ok).toBe(true)
  expect(upsertProjectNoteboardKvMock).toHaveBeenCalledWith(fakeDb, { text: 'next' })
})

test('setProjectNoteboardPatchAsync returns false without an active project database', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const h = handlerFor(FA_PROJECT_MANAGEMENT_IPC.setProjectNoteboardPatchAsync)
  const ok = h(undefined as never, {
    text: 'x'
  }) as boolean
  expect(ok).toBe(false)
  expect(upsertProjectNoteboardKvMock).not.toHaveBeenCalled()
  expect(warn).toHaveBeenCalledWith(
    expect.stringMatching(/setProjectNoteboard skipped/)
  )
  warn.mockRestore()
})

test('registerFaProjectManagementIpc before-quit hook closes active project database', async () => {
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const quitCall = appOnMock.mock.calls.find((c) => c[0] === 'before-quit')
  expect(quitCall).toBeDefined()
  const onQuit = quitCall?.[1] as () => void
  onQuit()
  expect(closeActiveMock).toHaveBeenCalledOnce()
})
