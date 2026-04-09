import { beforeEach, expect, test, vi } from 'vitest'

import { FA_EXTERNAL_LINKS_IPC } from 'app/src-electron/electron-ipc-bridge'

const mocks = vi.hoisted(() => {
  const ipcMainHandleMock = vi.fn()
  const openExternalMock = vi.fn(() => Promise.resolve())

  return {
    ipcMainHandleMock,
    openExternalMock
  }
})

vi.mock('electron', () => {
  return {
    ipcMain: {
      handle: mocks.ipcMainHandleMock
    },
    shell: {
      openExternal: mocks.openExternalMock
    }
  }
})

beforeEach(async () => {
  vi.resetModules()
  mocks.ipcMainHandleMock.mockReset()
  mocks.openExternalMock.mockReset()
  mocks.openExternalMock.mockImplementation(() => Promise.resolve())
})

async function handlerFor (
  channel: string
): Promise<(event: unknown, url: unknown) => Promise<void>> {
  const call = mocks.ipcMainHandleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()

  return call?.[1] as (event: unknown, url: unknown) => Promise<void>
}

/**
 * registerFaExternalLinksIpc
 * Registers openExternalAsync once.
 */
test('Test that registerFaExternalLinksIpc registers openExternalAsync channel once', async () => {
  const { registerFaExternalLinksIpc } = await import('../registerFaExternalLinksIpc')
  registerFaExternalLinksIpc()

  expect(mocks.ipcMainHandleMock).toHaveBeenCalledOnce()
  expect(mocks.ipcMainHandleMock.mock.calls[0][0]).toBe(
    FA_EXTERNAL_LINKS_IPC.openExternalAsync
  )
})

/**
 * registerFaExternalLinksIpc
 * Second registration is a no-op.
 */
test('Test that registerFaExternalLinksIpc skips duplicate registration', async () => {
  const { registerFaExternalLinksIpc } = await import('../registerFaExternalLinksIpc')
  registerFaExternalLinksIpc()
  const afterFirst = mocks.ipcMainHandleMock.mock.calls.length
  registerFaExternalLinksIpc()
  expect(mocks.ipcMainHandleMock.mock.calls.length).toBe(afterFirst)
})

/**
 * registerFaExternalLinksIpc
 * Handler opens allowed external https URL in shell.
 */
test('Test that registerFaExternalLinksIpc opens external https URL', async () => {
  const { registerFaExternalLinksIpc } = await import('../registerFaExternalLinksIpc')
  registerFaExternalLinksIpc()

  const handler = await handlerFor(FA_EXTERNAL_LINKS_IPC.openExternalAsync)
  await handler({}, 'https://www.example.com/')

  expect(mocks.openExternalMock).toHaveBeenCalledWith('https://www.example.com/')
})

/**
 * registerFaExternalLinksIpc
 * Non-string url is ignored.
 */
test('Test that registerFaExternalLinksIpc ignores non-string url', async () => {
  const { registerFaExternalLinksIpc } = await import('../registerFaExternalLinksIpc')
  registerFaExternalLinksIpc()

  const handler = await handlerFor(FA_EXTERNAL_LINKS_IPC.openExternalAsync)
  await handler({}, 123)

  expect(mocks.openExternalMock).not.toHaveBeenCalled()
})

/**
 * registerFaExternalLinksIpc
 * Localhost URL is not opened (matches preload checkIfExternal rules).
 */
test('Test that registerFaExternalLinksIpc does not open localhost URL', async () => {
  const { registerFaExternalLinksIpc } = await import('../registerFaExternalLinksIpc')
  registerFaExternalLinksIpc()

  const handler = await handlerFor(FA_EXTERNAL_LINKS_IPC.openExternalAsync)
  await handler({}, 'http://localhost:3000/')

  expect(mocks.openExternalMock).not.toHaveBeenCalled()
})
