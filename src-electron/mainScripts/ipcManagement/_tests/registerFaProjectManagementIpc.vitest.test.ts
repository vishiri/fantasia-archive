import { beforeEach, expect, test, vi } from 'vitest'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'

const { runCreateMock, ipcMainHandleMock, appOnMock, closeActiveMock } = vi.hoisted(() => {
  return {
    appOnMock: vi.fn(),
    closeActiveMock: vi.fn(),
    ipcMainHandleMock: vi.fn(),
    runCreateMock: vi.fn(async () => ({ outcome: 'canceled' as const }))
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

vi.mock('app/src-electron/mainScripts/projectManagement/faProjectActiveDatabase', () => {
  return {
    closeFaProjectActiveDatabase: closeActiveMock
  }
})

beforeEach(async () => {
  vi.resetModules()
  ipcMainHandleMock.mockReset()
  appOnMock.mockReset()
  closeActiveMock.mockReset()
  runCreateMock.mockReset()
  runCreateMock.mockResolvedValue({ outcome: 'canceled' })
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = ipcMainHandleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()
  return call?.[1] as (...args: unknown[]) => unknown
}

test('registerFaProjectManagementIpc registers createProject and before-quit hook once', async () => {
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  expect(ipcMainHandleMock).toHaveBeenCalledWith(
    FA_PROJECT_MANAGEMENT_IPC.createProjectAsync,
    expect.any(Function)
  )
  expect(appOnMock).toHaveBeenCalledWith('before-quit', expect.any(Function))

  const afterFirstHandle = ipcMainHandleMock.mock.calls.length
  const afterFirstOn = appOnMock.mock.calls.length
  registerFaProjectManagementIpc()
  expect(ipcMainHandleMock.mock.calls.length).toBe(afterFirstHandle)
  expect(appOnMock.mock.calls.length).toBe(afterFirstOn)
})

test('createProjectAsync handler delegates to runFaProjectCreateFromIpc', async () => {
  const { registerFaProjectManagementIpc } = await import('../registerFaProjectManagementIpc')
  registerFaProjectManagementIpc()
  const h = handlerFor(FA_PROJECT_MANAGEMENT_IPC.createProjectAsync)
  await expect(h({}, { projectName: 'Alpha' })).resolves.toEqual({ outcome: 'canceled' })
  expect(runCreateMock).toHaveBeenCalledOnce()
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
