import { beforeEach, expect, test, vi } from 'vitest'

import { FA_APP_DETAILS_IPC } from 'app/src-electron/electron-ipc-bridge'

const mocks = vi.hoisted(() => {
  const ipcMainHandleMock = vi.fn()
  const getVersionMock = vi.fn(() => '2.4.10')

  return {
    getVersionMock,
    ipcMainHandleMock
  }
})

vi.mock('electron', () => {
  return {
    app: {
      getVersion: mocks.getVersionMock
    },
    ipcMain: {
      handle: mocks.ipcMainHandleMock
    }
  }
})

beforeEach(async () => {
  vi.resetModules()
  mocks.ipcMainHandleMock.mockReset()
  mocks.getVersionMock.mockReset()
  mocks.getVersionMock.mockReturnValue('2.4.10')
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = mocks.ipcMainHandleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()

  return call?.[1] as (...args: unknown[]) => unknown
}

/**
 * registerFaAppDetailsIpc
 * Subscribes getVersionAsync once.
 */
test('Test that registerFaAppDetailsIpc registers getVersionAsync channel once', async () => {
  const { registerFaAppDetailsIpc } = await import('../registerFaAppDetailsIpc')
  registerFaAppDetailsIpc()

  expect(mocks.ipcMainHandleMock).toHaveBeenCalledOnce()
  expect(mocks.ipcMainHandleMock.mock.calls[0][0]).toBe(FA_APP_DETAILS_IPC.getVersionAsync)
})

/**
 * registerFaAppDetailsIpc
 * Second registration is a no-op.
 */
test('Test that registerFaAppDetailsIpc skips duplicate registration', async () => {
  const { registerFaAppDetailsIpc } = await import('../registerFaAppDetailsIpc')
  registerFaAppDetailsIpc()
  const afterFirst = mocks.ipcMainHandleMock.mock.calls.length
  registerFaAppDetailsIpc()
  expect(mocks.ipcMainHandleMock.mock.calls.length).toBe(afterFirst)
})

/**
 * registerFaAppDetailsIpc
 * getVersionAsync returns app.getVersion().
 */
test('Test that registerFaAppDetailsIpc getVersionAsync returns app.getVersion', async () => {
  mocks.getVersionMock.mockReturnValue('1.0.0')
  const { registerFaAppDetailsIpc } = await import('../registerFaAppDetailsIpc')
  registerFaAppDetailsIpc()

  const result = handlerFor(FA_APP_DETAILS_IPC.getVersionAsync)()

  expect(mocks.getVersionMock).toHaveBeenCalledOnce()
  expect(result).toBe('1.0.0')
})

/**
 * registerFaAppDetailsIpc
 * getVersionAsync returns empty string when getVersion throws.
 */
test('Test that registerFaAppDetailsIpc getVersionAsync returns empty string on getVersion error', async () => {
  mocks.getVersionMock.mockImplementation(() => {
    throw new Error('no version')
  })
  const { registerFaAppDetailsIpc } = await import('../registerFaAppDetailsIpc')
  registerFaAppDetailsIpc()

  const result = handlerFor(FA_APP_DETAILS_IPC.getVersionAsync)()

  expect(result).toBe('')
})
