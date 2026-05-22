import { beforeEach, expect, test, vi } from 'vitest'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import type { I_faRecentProjectMruHeadResolve } from 'app/types/I_faRecentProjectsDomain'

const {
  runCreateMock,
  runOpenMock,
  ipcMainHandleMock,
  appOnMock,
  closeActiveMock,
  getRecentSnapshotMock,
  resolveRecentMruHeadMock,
  readProjectNoteboardRootMock,
  upsertProjectNoteboardKvMock,
  readProjectStylingRootMock,
  upsertProjectStylingKvMock,
  getFaProjectActiveDbMock,
  runWithForIpcMock
} = vi.hoisted(() => {
  return {
    appOnMock: vi.fn(),
    closeActiveMock: vi.fn(),
    getFaProjectActiveDbMock: vi.fn(),
    getRecentSnapshotMock: vi.fn((): Array<{ filePath: string, name: string }> => []),
    resolveRecentMruHeadMock: vi.fn((): I_faRecentProjectMruHeadResolve => {
      return { outcome: 'empty' }
    }),
    ipcMainHandleMock: vi.fn(),
    readProjectNoteboardRootMock: vi.fn(),
    readProjectStylingRootMock: vi.fn(),
    runCreateMock: vi.fn(async () => ({ outcome: 'canceled' as const })),
    runOpenMock: vi.fn(async () => ({ outcome: 'canceled' as const })),
    runWithForIpcMock: vi.fn(),
    upsertProjectNoteboardKvMock: vi.fn(),
    upsertProjectStylingKvMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    app: {
      getPath: vi.fn(() => '/fake-user-data'),
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

vi.mock('app/src-electron/mainScripts/projectManagement/faProjectDatabaseEnsureConnected', () => {
  return {
    runWithFaProjectDatabaseForIpcAsync: async (
      event: unknown,
      work: (db: unknown) => unknown
    ) => {
      return await runWithForIpcMock(event, work)
    }
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
    getRecentProjectsSnapshot: getRecentSnapshotMock,
    resolveRecentProjectMruHeadForOpen: resolveRecentMruHeadMock
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

vi.mock(
  'app/src-electron/mainScripts/projectManagement/faProjectStylingPersist',
  () => {
    return {
      readFaProjectStylingRoot: readProjectStylingRootMock,
      upsertFaProjectStylingKv: upsertProjectStylingKvMock
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
  resolveRecentMruHeadMock.mockReset()
  resolveRecentMruHeadMock.mockReturnValue({ outcome: 'empty' })
  readProjectNoteboardRootMock.mockReset()
  upsertProjectNoteboardKvMock.mockReset()
  readProjectStylingRootMock.mockReset()
  upsertProjectStylingKvMock.mockReset()
  getFaProjectActiveDbMock.mockReset()
  getFaProjectActiveDbMock.mockReturnValue(null)
  runWithForIpcMock.mockReset()
  runWithForIpcMock.mockImplementation(async (_event: unknown, work: (db: unknown) => unknown) => {
    const db = getFaProjectActiveDbMock()
    if (db === null) {
      return { ok: false }
    }
    return {
      ok: true,
      value: work(db)
    }
  })
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = ipcMainHandleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()
  return call?.[1] as (...args: unknown[]) => unknown
}

test('registerFaProjectManagementIpc registers project-noteboard and project-styling IPC handlers with create, recent, open, and before-quit hook once', async () => {
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
    FA_PROJECT_MANAGEMENT_IPC.resolveRecentProjectMruHeadForOpenAsync,
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
    FA_PROJECT_MANAGEMENT_IPC.getProjectStylingAsync,
    expect.any(Function)
  )
  expect(ipcMainHandleMock).toHaveBeenCalledWith(
    FA_PROJECT_MANAGEMENT_IPC.setProjectStylingPatchAsync,
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

test('resolveRecentProjectMruHeadForOpenAsync handler returns MRU head resolve', async () => {
  resolveRecentMruHeadMock.mockReturnValueOnce({
    entry: {
      filePath: 'D:\\head.faproject',
      name: 'Head'
    },
    outcome: 'ready'
  })
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const h = handlerFor(FA_PROJECT_MANAGEMENT_IPC.resolveRecentProjectMruHeadForOpenAsync)
  expect(h(undefined as never, undefined as never)).toEqual({
    entry: {
      filePath: 'D:\\head.faproject',
      name: 'Head'
    },
    outcome: 'ready'
  })
  expect(resolveRecentMruHeadMock).toHaveBeenCalledOnce()
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
  await expect(h({} as never, undefined as never)).resolves.toEqual({
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
  const snap = (await h({} as never, undefined as never)) as { frame: { x: number } }
  snap.frame.x = -1
  const second = (await h({} as never, undefined as never)) as { frame: { x: number } }
  expect(second.frame.x).toBe(11)
  expect(readProjectNoteboardRootMock).toHaveBeenCalledTimes(2)
})

test('setProjectNoteboardPatchAsync upserts KV rows against the active SQLite handle', async () => {
  const fakeDb = { tag: 'db' } as unknown
  getFaProjectActiveDbMock.mockReturnValue(fakeDb)
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const h = handlerFor(FA_PROJECT_MANAGEMENT_IPC.setProjectNoteboardPatchAsync)
  const ok = (await h(undefined as never, {
    text: 'next'
  })) as boolean
  expect(ok).toBe(true)
  expect(upsertProjectNoteboardKvMock).toHaveBeenCalledWith(fakeDb, { text: 'next' })
})

test('setProjectNoteboardPatchAsync returns false without an active project database', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const h = handlerFor(FA_PROJECT_MANAGEMENT_IPC.setProjectNoteboardPatchAsync)
  const ok = (await h(undefined as never, {
    text: 'x'
  })) as boolean
  expect(ok).toBe(false)
  expect(upsertProjectNoteboardKvMock).not.toHaveBeenCalled()
  expect(warn).toHaveBeenCalledWith(
    expect.stringMatching(/setProjectNoteboard skipped/)
  )
  warn.mockRestore()
})

test('getProjectStylingAsync returns default snapshot when active database handle is absent', async () => {
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const h = handlerFor(FA_PROJECT_MANAGEMENT_IPC.getProjectStylingAsync)
  expect(readProjectStylingRootMock).not.toHaveBeenCalled()
  await expect(h({} as never, undefined as never)).resolves.toEqual({
    css: '',
    frame: null,
    schemaVersion: 1
  })
})

test('getProjectStylingAsync clones persisted root payload', async () => {
  const fakeDb = { dummy: true } as unknown
  getFaProjectActiveDbMock.mockReturnValue(fakeDb)
  readProjectStylingRootMock.mockImplementation(() => {
    return {
      css: 'a{}',
      frame: {
        height: 400,
        width: 500,
        x: 11,
        y: 22
      },
      schemaVersion: 1
    }
  })
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const h = handlerFor(FA_PROJECT_MANAGEMENT_IPC.getProjectStylingAsync)
  const snap = (await h({} as never, undefined as never)) as { frame: { x: number } }
  snap.frame.x = -1
  const second = (await h({} as never, undefined as never)) as { frame: { x: number } }
  expect(second.frame.x).toBe(11)
  expect(readProjectStylingRootMock).toHaveBeenCalledTimes(2)
})

test('setProjectStylingPatchAsync upserts KV rows against the active SQLite handle', async () => {
  const fakeDb = { tag: 'db' } as unknown
  getFaProjectActiveDbMock.mockReturnValue(fakeDb)
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const h = handlerFor(FA_PROJECT_MANAGEMENT_IPC.setProjectStylingPatchAsync)
  const ok = (await h(undefined as never, {
    css: 'next'
  })) as boolean
  expect(ok).toBe(true)
  expect(upsertProjectStylingKvMock).toHaveBeenCalledWith(fakeDb, { css: 'next' })
})

test('setProjectStylingPatchAsync returns false without an active project database', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const h = handlerFor(FA_PROJECT_MANAGEMENT_IPC.setProjectStylingPatchAsync)
  const ok = (await h(undefined as never, {
    css: 'x'
  })) as boolean
  expect(ok).toBe(false)
  expect(upsertProjectStylingKvMock).not.toHaveBeenCalled()
  expect(warn).toHaveBeenCalledWith(
    expect.stringMatching(/setProjectStyling skipped/)
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
