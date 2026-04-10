import { beforeEach, expect, test, vi } from 'vitest'

import { FA_APP_DETAILS_IPC } from 'app/src-electron/electron-ipc-bridge'

const mocks = vi.hoisted(() => {
  const ipcMainOnMock = vi.fn()
  const getVersionMock = vi.fn(() => '2.4.10')

  return {
    getVersionMock,
    ipcMainOnMock
  }
})

vi.mock('electron', () => {
  return {
    app: {
      getVersion: mocks.getVersionMock
    },
    ipcMain: {
      on: mocks.ipcMainOnMock
    }
  }
})

beforeEach(async () => {
  vi.resetModules()
  mocks.ipcMainOnMock.mockReset()
  mocks.getVersionMock.mockReset()
  mocks.getVersionMock.mockReturnValue('2.4.10')
})

function handlerFor (channel: string): (event: { returnValue?: unknown }, ...args: unknown[]) => void {
  const call = mocks.ipcMainOnMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()
  return call?.[1] as (event: { returnValue?: unknown }, ...args: unknown[]) => void
}

/**
 * registerFaAppDetailsIpc
 * Subscribes getVersionSync once.
 */
test('Test that registerFaAppDetailsIpc registers getVersionSync channel once', async () => {
  const { registerFaAppDetailsIpc } = await import('../registerFaAppDetailsIpc')
  registerFaAppDetailsIpc()

  expect(mocks.ipcMainOnMock).toHaveBeenCalledOnce()
  expect(mocks.ipcMainOnMock.mock.calls[0][0]).toBe(FA_APP_DETAILS_IPC.getVersionSync)
})

/**
 * registerFaAppDetailsIpc
 * Second registration is a no-op.
 */
test('Test that registerFaAppDetailsIpc skips duplicate registration', async () => {
  const { registerFaAppDetailsIpc } = await import('../registerFaAppDetailsIpc')
  registerFaAppDetailsIpc()
  const afterFirst = mocks.ipcMainOnMock.mock.calls.length
  registerFaAppDetailsIpc()
  expect(mocks.ipcMainOnMock.mock.calls.length).toBe(afterFirst)
})

/**
 * registerFaAppDetailsIpc
 * getVersionSync sets returnValue from app.getVersion().
 */
test('Test that registerFaAppDetailsIpc getVersionSync returns app.getVersion', async () => {
  mocks.getVersionMock.mockReturnValue('1.0.0')
  const { registerFaAppDetailsIpc } = await import('../registerFaAppDetailsIpc')
  registerFaAppDetailsIpc()

  const event: { returnValue?: string } = {}
  handlerFor(FA_APP_DETAILS_IPC.getVersionSync)(event)

  expect(mocks.getVersionMock).toHaveBeenCalledOnce()
  expect(event.returnValue).toBe('1.0.0')
})

/**
 * registerFaAppDetailsIpc
 * getVersionSync sets empty string when getVersion throws.
 */
test('Test that registerFaAppDetailsIpc getVersionSync returns empty string on getVersion error', async () => {
  mocks.getVersionMock.mockImplementation(() => {
    throw new Error('no version')
  })
  const { registerFaAppDetailsIpc } = await import('../registerFaAppDetailsIpc')
  registerFaAppDetailsIpc()

  const event: { returnValue?: string } = {}
  handlerFor(FA_APP_DETAILS_IPC.getVersionSync)(event)

  expect(event.returnValue).toBe('')
})
