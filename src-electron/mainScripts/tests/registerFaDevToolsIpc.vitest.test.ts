import { beforeEach, expect, test, vi } from 'vitest'

import { FA_DEVTOOLS_IPC } from 'app/src-electron/electron-ipc-bridge'

const mocks = vi.hoisted(() => {
  const ipcMainOnMock = vi.fn()
  const isDevToolsOpenedMock = vi.fn(() => false)
  const openDevToolsMock = vi.fn()
  const closeDevToolsMock = vi.fn()
  const webContents = {
    closeDevTools: closeDevToolsMock,
    isDevToolsOpened: isDevToolsOpenedMock,
    openDevTools: openDevToolsMock
  }
  const win = {
    isVisible: () => true,
    webContents
  }
  const browserWindowState: {
    allWindows: unknown[]
    focused: typeof win | undefined
  } = {
    allWindows: [win],
    focused: undefined
  }

  return {
    browserWindowState,
    closeDevToolsMock,
    ipcMainOnMock,
    isDevToolsOpenedMock,
    openDevToolsMock,
    webContents,
    win
  }
})

vi.mock('electron', () => {
  return {
    BrowserWindow: {
      getAllWindows: vi.fn(() => mocks.browserWindowState.allWindows),
      getFocusedWindow: vi.fn(() => mocks.browserWindowState.focused)
    },
    ipcMain: {
      on: mocks.ipcMainOnMock
    }
  }
})

beforeEach(async () => {
  vi.resetModules()
  mocks.ipcMainOnMock.mockReset()
  mocks.isDevToolsOpenedMock.mockReset()
  mocks.openDevToolsMock.mockReset()
  mocks.closeDevToolsMock.mockReset()
  mocks.isDevToolsOpenedMock.mockReturnValue(false)
  mocks.browserWindowState.focused = undefined
  mocks.browserWindowState.allWindows = [mocks.win]
})

function handlerFor (channel: string): (event: { returnValue?: unknown }, ...args: unknown[]) => void {
  const call = mocks.ipcMainOnMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()
  return call?.[1] as (event: { returnValue?: unknown }, ...args: unknown[]) => void
}

/**
 * registerFaDevToolsIpc
 * Subscribes synchronous handlers for every devtools IPC channel name.
 */
test('Test that registerFaDevToolsIpc registers each devtools sync channel once', async () => {
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  expect(mocks.ipcMainOnMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.statusSync, expect.any(Function))
  expect(mocks.ipcMainOnMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.toggleSync, expect.any(Function))
  expect(mocks.ipcMainOnMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.openSync, expect.any(Function))
  expect(mocks.ipcMainOnMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.closeSync, expect.any(Function))
})

/**
 * registerFaDevToolsIpc
 * Status handler copies the active window webContents devtools flag into returnValue.
 */
test('Test that registerFaDevToolsIpc statusSync handler reports webContents devtools state', async () => {
  mocks.isDevToolsOpenedMock.mockReturnValue(true)
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const event: { returnValue?: boolean } = {}
  handlerFor(FA_DEVTOOLS_IPC.statusSync)(event)

  expect(event.returnValue).toBe(true)
})

/**
 * registerFaDevToolsIpc
 * statusSync reports false when no window is available for webContents inspection.
 */
test('Test that registerFaDevToolsIpc statusSync returns false without any BrowserWindow', async () => {
  mocks.browserWindowState.allWindows = []
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const event: { returnValue?: boolean } = {}
  handlerFor(FA_DEVTOOLS_IPC.statusSync)(event)

  expect(event.returnValue).toBe(false)
})

/**
 * registerFaDevToolsIpc
 * Second registration is a no-op so handlers are not duplicated.
 */
test('Test that registerFaDevToolsIpc skips duplicate registration', async () => {
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()
  const afterFirst = mocks.ipcMainOnMock.mock.calls.length
  registerFaDevToolsIpc()
  expect(mocks.ipcMainOnMock.mock.calls.length).toBe(afterFirst)
})

/**
 * registerFaDevToolsIpc
 * toggleSync opens DevTools when they are closed and sets returnValue to the new opened state.
 */
test('Test that registerFaDevToolsIpc toggleSync opens DevTools when closed', async () => {
  mocks.isDevToolsOpenedMock.mockReturnValueOnce(false).mockReturnValueOnce(true)
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const event: { returnValue?: boolean } = {}
  handlerFor(FA_DEVTOOLS_IPC.toggleSync)(event)

  expect(mocks.openDevToolsMock).toHaveBeenCalledTimes(1)
  expect(mocks.closeDevToolsMock).not.toHaveBeenCalled()
  expect(event.returnValue).toBe(true)
})

/**
 * registerFaDevToolsIpc
 * toggleSync closes DevTools when they are already open.
 */
test('Test that registerFaDevToolsIpc toggleSync closes DevTools when open', async () => {
  mocks.isDevToolsOpenedMock.mockReturnValueOnce(true).mockReturnValueOnce(false)
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const event: { returnValue?: boolean } = {}
  handlerFor(FA_DEVTOOLS_IPC.toggleSync)(event)

  expect(mocks.closeDevToolsMock).toHaveBeenCalledTimes(1)
  expect(mocks.openDevToolsMock).not.toHaveBeenCalled()
  expect(event.returnValue).toBe(false)
})

/**
 * registerFaDevToolsIpc
 * toggleSync returns false when no BrowserWindow is available.
 */
test('Test that registerFaDevToolsIpc toggleSync returns false without a window', async () => {
  mocks.browserWindowState.allWindows = []
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const event: { returnValue?: boolean } = {}
  handlerFor(FA_DEVTOOLS_IPC.toggleSync)(event)

  expect(event.returnValue).toBe(false)
  expect(mocks.openDevToolsMock).not.toHaveBeenCalled()
  expect(mocks.closeDevToolsMock).not.toHaveBeenCalled()
})

/**
 * registerFaDevToolsIpc
 * openSync opens DevTools and reports whether they are open afterward.
 */
test('Test that registerFaDevToolsIpc openSync opens and reports DevTools state', async () => {
  mocks.isDevToolsOpenedMock.mockReturnValue(true)
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const event: { returnValue?: boolean } = {}
  handlerFor(FA_DEVTOOLS_IPC.openSync)(event)

  expect(mocks.openDevToolsMock).toHaveBeenCalledTimes(1)
  expect(event.returnValue).toBe(true)
})

/**
 * registerFaDevToolsIpc
 * openSync returns false when no BrowserWindow is available.
 */
test('Test that registerFaDevToolsIpc openSync returns false without a window', async () => {
  mocks.browserWindowState.allWindows = []
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const event: { returnValue?: boolean } = {}
  handlerFor(FA_DEVTOOLS_IPC.openSync)(event)

  expect(event.returnValue).toBe(false)
  expect(mocks.openDevToolsMock).not.toHaveBeenCalled()
})

/**
 * registerFaDevToolsIpc
 * closeSync closes DevTools and reports whether they remain open.
 */
test('Test that registerFaDevToolsIpc closeSync closes and reports DevTools state', async () => {
  mocks.isDevToolsOpenedMock.mockReturnValue(false)
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const event: { returnValue?: boolean } = {}
  handlerFor(FA_DEVTOOLS_IPC.closeSync)(event)

  expect(mocks.closeDevToolsMock).toHaveBeenCalledTimes(1)
  expect(event.returnValue).toBe(false)
})

/**
 * registerFaDevToolsIpc
 * closeSync returns false when no BrowserWindow is available.
 */
test('Test that registerFaDevToolsIpc closeSync returns false without a window', async () => {
  mocks.browserWindowState.allWindows = []
  const { registerFaDevToolsIpc } = await import('../registerFaDevToolsIpc')
  registerFaDevToolsIpc()

  const event: { returnValue?: boolean } = {}
  handlerFor(FA_DEVTOOLS_IPC.closeSync)(event)

  expect(event.returnValue).toBe(false)
  expect(mocks.closeDevToolsMock).not.toHaveBeenCalled()
})
