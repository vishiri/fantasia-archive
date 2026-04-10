import { beforeEach, expect, test, vi } from 'vitest'

import { FA_DEVTOOLS_IPC } from 'app/src-electron/electron-ipc-bridge'

const mocks = vi.hoisted(() => {
  const ipcMainHandleMock = vi.fn()
  const isDevToolsOpenedMock = vi.fn(() => false)
  const openDevToolsMock = vi.fn()
  const closeDevToolsMock = vi.fn()
  const webContents = {
    closeDevTools: closeDevToolsMock,
    isDevToolsOpened: isDevToolsOpenedMock,
    openDevTools: openDevToolsMock
  }
  const win = {
    webContents
  }

  const fromWebContentsMock = vi.fn(() => win)

  return {
    closeDevToolsMock,
    fromWebContentsMock,
    ipcMainHandleMock,
    isDevToolsOpenedMock,
    openDevToolsMock,
    webContents,
    win
  }
})

vi.mock('electron', () => {
  return {
    BrowserWindow: {
      fromWebContents: mocks.fromWebContentsMock
    },
    ipcMain: {
      handle: mocks.ipcMainHandleMock
    }
  }
})

beforeEach(async () => {
  vi.resetModules()
  mocks.ipcMainHandleMock.mockReset()
  mocks.fromWebContentsMock.mockReset()
  mocks.isDevToolsOpenedMock.mockReset()
  mocks.openDevToolsMock.mockReset()
  mocks.closeDevToolsMock.mockReset()
  mocks.isDevToolsOpenedMock.mockReturnValue(false)
  mocks.fromWebContentsMock.mockReturnValue(mocks.win)
})

function handlerFor (channel: string): (event: { sender: unknown }, ...args: unknown[]) => unknown {
  const call = mocks.ipcMainHandleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()

  return call?.[1] as (event: { sender: unknown }, ...args: unknown[]) => unknown
}

const fakeSender = {}

/**
 * registerFaDevToolsIpc
 * Subscribes async handlers for every devtools IPC channel name.
 */
test('Test that registerFaDevToolsIpc registers each devtools async channel once', async () => {
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  expect(mocks.ipcMainHandleMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.statusAsync, expect.any(Function))
  expect(mocks.ipcMainHandleMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.toggleAsync, expect.any(Function))
  expect(mocks.ipcMainHandleMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.openAsync, expect.any(Function))
  expect(mocks.ipcMainHandleMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.closeAsync, expect.any(Function))
})

/**
 * registerFaDevToolsIpc
 * Status handler returns webContents devtools state for the sender window.
 */
test('Test that registerFaDevToolsIpc statusAsync handler reports webContents devtools state', async () => {
  mocks.isDevToolsOpenedMock.mockReturnValue(true)
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const result = handlerFor(FA_DEVTOOLS_IPC.statusAsync)({ sender: fakeSender })

  expect(mocks.fromWebContentsMock).toHaveBeenCalledWith(fakeSender)
  expect(result).toBe(true)
})

/**
 * registerFaDevToolsIpc
 * statusAsync reports false when no window is resolved from sender.
 */
test('Test that registerFaDevToolsIpc statusAsync returns false without a BrowserWindow', async () => {
  mocks.fromWebContentsMock.mockReturnValue(null as unknown as typeof mocks.win)
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const result = handlerFor(FA_DEVTOOLS_IPC.statusAsync)({ sender: fakeSender })

  expect(result).toBe(false)
})

/**
 * registerFaDevToolsIpc
 * Second registration is a no-op so handlers are not duplicated.
 */
test('Test that registerFaDevToolsIpc skips duplicate registration', async () => {
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()
  const afterFirst = mocks.ipcMainHandleMock.mock.calls.length
  registerFaDevToolsIpc()
  expect(mocks.ipcMainHandleMock.mock.calls.length).toBe(afterFirst)
})

/**
 * registerFaDevToolsIpc
 * toggleAsync opens DevTools when they are closed and returns the new opened state.
 */
test('Test that registerFaDevToolsIpc toggleAsync opens DevTools when closed', async () => {
  mocks.isDevToolsOpenedMock.mockReturnValueOnce(false).mockReturnValueOnce(true)
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const result = handlerFor(FA_DEVTOOLS_IPC.toggleAsync)({ sender: fakeSender })

  expect(mocks.openDevToolsMock).toHaveBeenCalledTimes(1)
  expect(mocks.closeDevToolsMock).not.toHaveBeenCalled()
  expect(result).toBe(true)
})

/**
 * registerFaDevToolsIpc
 * toggleAsync closes DevTools when they are already open.
 */
test('Test that registerFaDevToolsIpc toggleAsync closes DevTools when open', async () => {
  mocks.isDevToolsOpenedMock.mockReturnValueOnce(true).mockReturnValueOnce(false)
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const result = handlerFor(FA_DEVTOOLS_IPC.toggleAsync)({ sender: fakeSender })

  expect(mocks.closeDevToolsMock).toHaveBeenCalledTimes(1)
  expect(mocks.openDevToolsMock).not.toHaveBeenCalled()
  expect(result).toBe(false)
})

/**
 * registerFaDevToolsIpc
 * toggleAsync returns false when no BrowserWindow is available.
 */
test('Test that registerFaDevToolsIpc toggleAsync returns false without a window', async () => {
  mocks.fromWebContentsMock.mockReturnValue(null as unknown as typeof mocks.win)
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const result = handlerFor(FA_DEVTOOLS_IPC.toggleAsync)({ sender: fakeSender })

  expect(result).toBe(false)
  expect(mocks.openDevToolsMock).not.toHaveBeenCalled()
  expect(mocks.closeDevToolsMock).not.toHaveBeenCalled()
})

/**
 * registerFaDevToolsIpc
 * openAsync opens DevTools and reports whether they are open afterward.
 */
test('Test that registerFaDevToolsIpc openAsync opens and reports DevTools state', async () => {
  mocks.isDevToolsOpenedMock.mockReturnValue(true)
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const result = handlerFor(FA_DEVTOOLS_IPC.openAsync)({ sender: fakeSender })

  expect(mocks.openDevToolsMock).toHaveBeenCalledTimes(1)
  expect(result).toBe(true)
})

/**
 * registerFaDevToolsIpc
 * openAsync returns false when no BrowserWindow is available.
 */
test('Test that registerFaDevToolsIpc openAsync returns false without a window', async () => {
  mocks.fromWebContentsMock.mockReturnValue(null as unknown as typeof mocks.win)
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const result = handlerFor(FA_DEVTOOLS_IPC.openAsync)({ sender: fakeSender })

  expect(result).toBe(false)
  expect(mocks.openDevToolsMock).not.toHaveBeenCalled()
})

/**
 * registerFaDevToolsIpc
 * closeAsync closes DevTools and reports whether they remain open.
 */
test('Test that registerFaDevToolsIpc closeAsync closes and reports DevTools state', async () => {
  mocks.isDevToolsOpenedMock.mockReturnValue(false)
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const result = handlerFor(FA_DEVTOOLS_IPC.closeAsync)({ sender: fakeSender })

  expect(mocks.closeDevToolsMock).toHaveBeenCalledTimes(1)
  expect(result).toBe(false)
})

/**
 * registerFaDevToolsIpc
 * closeAsync returns false when no BrowserWindow is available.
 */
test('Test that registerFaDevToolsIpc closeAsync returns false without a window', async () => {
  mocks.fromWebContentsMock.mockReturnValue(null as unknown as typeof mocks.win)
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const result = handlerFor(FA_DEVTOOLS_IPC.closeAsync)({ sender: fakeSender })

  expect(result).toBe(false)
  expect(mocks.closeDevToolsMock).not.toHaveBeenCalled()
})
