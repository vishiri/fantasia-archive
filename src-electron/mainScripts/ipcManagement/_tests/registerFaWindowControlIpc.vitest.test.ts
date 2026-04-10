import type { IpcMainEvent } from 'electron'
import { beforeEach, expect, test, vi } from 'vitest'

import { FA_WINDOW_CONTROL_IPC } from 'app/src-electron/electron-ipc-bridge'

const mocks = vi.hoisted(() => {
  const ipcMainHandleMock = vi.fn()
  const fromWebContentsMock = vi.fn()
  const minimizeMock = vi.fn()
  const maximizeMock = vi.fn()
  const unmaximizeMock = vi.fn()
  const closeMock = vi.fn()
  const isMaximizedMock = vi.fn(() => false)
  const getBoundsMock = vi.fn(() => ({
    height: 200,
    width: 100,
    x: 0,
    y: 0
  }))
  const setBoundsMock = vi.fn()

  const fakeWindow = {
    close: closeMock,
    getBounds: getBoundsMock,
    id: 42,
    isMaximized: isMaximizedMock,
    maximize: maximizeMock,
    minimize: minimizeMock,
    setBounds: setBoundsMock,
    unmaximize: unmaximizeMock
  }

  return {
    closeMock,
    fakeWindow,
    fromWebContentsMock,
    getBoundsMock,
    ipcMainHandleMock,
    isMaximizedMock,
    maximizeMock,
    minimizeMock,
    setBoundsMock,
    unmaximizeMock
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
  mocks.minimizeMock.mockReset()
  mocks.maximizeMock.mockReset()
  mocks.unmaximizeMock.mockReset()
  mocks.closeMock.mockReset()
  mocks.isMaximizedMock.mockReset()
  mocks.isMaximizedMock.mockReturnValue(false)
  mocks.getBoundsMock.mockReset()
  mocks.getBoundsMock.mockReturnValue({
    height: 200,
    width: 100,
    x: 0,
    y: 0
  })
  mocks.setBoundsMock.mockReset()
  mocks.fromWebContentsMock.mockReturnValue(mocks.fakeWindow)
})

function handlerFor (channel: string): (event: { sender: unknown }, ...args: unknown[]) => unknown {
  const call = mocks.ipcMainHandleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()

  return call?.[1] as (event: { sender: unknown }, ...args: unknown[]) => unknown
}

const fakeSender = {}

/**
 * registerFaWindowControlIpc
 * Subscribes async handlers for every window control IPC channel name.
 */
test('Test that registerFaWindowControlIpc registers each window control async channel once', async () => {
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const channels = mocks.ipcMainHandleMock.mock.calls.map((c) => c[0])
  expect(channels).toEqual([
    FA_WINDOW_CONTROL_IPC.checkMaximizedAsync,
    FA_WINDOW_CONTROL_IPC.minimizeAsync,
    FA_WINDOW_CONTROL_IPC.maximizeAsync,
    FA_WINDOW_CONTROL_IPC.resizeToggleAsync,
    FA_WINDOW_CONTROL_IPC.closeAsync
  ])
})

/**
 * registerFaWindowControlIpc
 * Second registration is a no-op so handlers are not duplicated.
 */
test('Test that registerFaWindowControlIpc skips duplicate registration', async () => {
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()
  const afterFirst = mocks.ipcMainHandleMock.mock.calls.length
  registerFaWindowControlIpc()
  expect(mocks.ipcMainHandleMock.mock.calls.length).toBe(afterFirst)
})

/**
 * registerFaWindowControlIpc
 * checkMaximizedAsync returns isMaximized from the window resolved from the sender.
 */
test('Test that registerFaWindowControlIpc checkMaximizedAsync returns isMaximized', async () => {
  mocks.isMaximizedMock.mockReturnValue(true)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  const result = handlerFor(FA_WINDOW_CONTROL_IPC.checkMaximizedAsync)(event)

  expect(mocks.fromWebContentsMock).toHaveBeenCalledWith(fakeSender)
  expect(result).toBe(true)
})

/**
 * registerFaWindowControlIpc
 * checkMaximizedAsync returns false when no BrowserWindow is resolved.
 */
test('Test that registerFaWindowControlIpc checkMaximizedAsync returns false without a window', async () => {
  mocks.fromWebContentsMock.mockReturnValue(null)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  const result = handlerFor(FA_WINDOW_CONTROL_IPC.checkMaximizedAsync)(event)

  expect(result).toBe(false)
})

/**
 * registerFaWindowControlIpc
 * minimizeAsync no-ops when no BrowserWindow is resolved.
 */
test('Test that registerFaWindowControlIpc minimizeAsync no-ops without a window', async () => {
  mocks.fromWebContentsMock.mockReturnValue(null)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.minimizeAsync)(event)

  expect(mocks.minimizeMock).not.toHaveBeenCalled()
})

/**
 * registerFaWindowControlIpc
 * minimizeAsync calls minimize on the resolved window.
 */
test('Test that registerFaWindowControlIpc minimizeAsync calls minimize', async () => {
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.minimizeAsync)(event)

  expect(mocks.minimizeMock).toHaveBeenCalledOnce()
})

/**
 * registerFaWindowControlIpc
 * maximizeAsync no-ops when no BrowserWindow is resolved.
 */
test('Test that registerFaWindowControlIpc maximizeAsync no-ops without a window', async () => {
  mocks.fromWebContentsMock.mockReturnValue(null)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.maximizeAsync)(event)

  expect(mocks.maximizeMock).not.toHaveBeenCalled()
})

/**
 * registerFaWindowControlIpc
 * maximizeAsync calls maximize on the resolved window.
 */
test('Test that registerFaWindowControlIpc maximizeAsync calls maximize', async () => {
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.maximizeAsync)(event)

  expect(mocks.getBoundsMock).toHaveBeenCalledOnce()
  expect(mocks.maximizeMock).toHaveBeenCalledOnce()
})

/**
 * registerFaWindowControlIpc
 * maximizeAsync skips bounds capture when the window is already maximized.
 */
test('Test that registerFaWindowControlIpc maximizeAsync does not capture bounds when already maximized', async () => {
  mocks.isMaximizedMock.mockReturnValue(true)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.maximizeAsync)(event)

  expect(mocks.getBoundsMock).not.toHaveBeenCalled()
  expect(mocks.maximizeMock).toHaveBeenCalledOnce()
})

/**
 * registerFaWindowControlIpc
 * closeAsync no-ops when no BrowserWindow is resolved.
 */
test('Test that registerFaWindowControlIpc closeAsync no-ops without a window', async () => {
  mocks.fromWebContentsMock.mockReturnValue(null)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.closeAsync)(event)

  expect(mocks.closeMock).not.toHaveBeenCalled()
})

/**
 * registerFaWindowControlIpc
 * closeAsync calls close on the resolved window.
 */
test('Test that registerFaWindowControlIpc closeAsync calls close', async () => {
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.closeAsync)(event)

  expect(mocks.closeMock).toHaveBeenCalledOnce()
})

/**
 * registerFaWindowControlIpc
 * resizeToggleAsync unmaximizes when the window is maximized.
 */
test('Test that registerFaWindowControlIpc resizeToggleAsync unmaximizes when maximized', async () => {
  mocks.isMaximizedMock.mockReturnValue(true)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.resizeToggleAsync)(event)

  expect(mocks.unmaximizeMock).toHaveBeenCalledOnce()
  expect(mocks.maximizeMock).not.toHaveBeenCalled()
  expect(mocks.setBoundsMock).not.toHaveBeenCalled()
})

/**
 * registerFaWindowControlIpc
 * resizeToggleAsync maximizes when the window is not maximized.
 */
test('Test that registerFaWindowControlIpc resizeToggleAsync maximizes when not maximized', async () => {
  mocks.isMaximizedMock.mockReturnValue(false)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.resizeToggleAsync)(event)

  expect(mocks.getBoundsMock).toHaveBeenCalledOnce()
  expect(mocks.maximizeMock).toHaveBeenCalledOnce()
  expect(mocks.unmaximizeMock).not.toHaveBeenCalled()
})

/**
 * registerFaWindowControlIpc
 * resizeToggleAsync restore applies getBounds captured before the prior maximize.
 */
test('Test that registerFaWindowControlIpc resizeToggleAsync restore reapplies saved bounds', async () => {
  const saved = {
    height: 333,
    width: 444,
    x: 12,
    y: 34
  }
  mocks.getBoundsMock.mockReturnValue(saved)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }

  mocks.isMaximizedMock.mockReturnValue(false)
  handlerFor(FA_WINDOW_CONTROL_IPC.resizeToggleAsync)(event)

  mocks.isMaximizedMock.mockReturnValue(true)
  handlerFor(FA_WINDOW_CONTROL_IPC.resizeToggleAsync)(event)

  expect(mocks.unmaximizeMock).toHaveBeenCalledOnce()
  expect(mocks.setBoundsMock).toHaveBeenCalledWith(saved)
})

/**
 * registerFaWindowControlIpc
 * resizeToggleAsync no-ops when no BrowserWindow is resolved.
 */
test('Test that registerFaWindowControlIpc resizeToggleAsync no-ops without a window', async () => {
  mocks.fromWebContentsMock.mockReturnValue(null)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.resizeToggleAsync)(event)

  expect(mocks.maximizeMock).not.toHaveBeenCalled()
  expect(mocks.unmaximizeMock).not.toHaveBeenCalled()
})

/**
 * windowFromIpcEvent
 * Returns undefined when 'fromWebContents' yields null.
 */
test('Test that windowFromIpcEvent returns undefined when fromWebContents is null', async () => {
  mocks.fromWebContentsMock.mockReturnValue(null)
  const { windowFromIpcEvent } = await import('../registerFaWindowControlIpc')

  expect(windowFromIpcEvent({ sender: fakeSender } as IpcMainEvent)).toBeUndefined()
})
