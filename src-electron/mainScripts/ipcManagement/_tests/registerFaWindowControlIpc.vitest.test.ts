import type { IpcMainEvent } from 'electron'
import { beforeEach, expect, test, vi } from 'vitest'

import { FA_WINDOW_CONTROL_IPC } from 'app/src-electron/electron-ipc-bridge'

const mocks = vi.hoisted(() => {
  const ipcMainOnMock = vi.fn()
  const fromWebContentsMock = vi.fn()
  const minimizeMock = vi.fn()
  const maximizeMock = vi.fn()
  const unmaximizeMock = vi.fn()
  const closeMock = vi.fn()
  const isMaximizedMock = vi.fn(() => false)

  const fakeWindow = {
    close: closeMock,
    isMaximized: isMaximizedMock,
    maximize: maximizeMock,
    minimize: minimizeMock,
    unmaximize: unmaximizeMock
  }

  return {
    closeMock,
    fakeWindow,
    fromWebContentsMock,
    ipcMainOnMock,
    isMaximizedMock,
    maximizeMock,
    minimizeMock,
    unmaximizeMock
  }
})

vi.mock('electron', () => {
  return {
    BrowserWindow: {
      fromWebContents: mocks.fromWebContentsMock
    },
    ipcMain: {
      on: mocks.ipcMainOnMock
    }
  }
})

beforeEach(async () => {
  vi.resetModules()
  mocks.ipcMainOnMock.mockReset()
  mocks.fromWebContentsMock.mockReset()
  mocks.minimizeMock.mockReset()
  mocks.maximizeMock.mockReset()
  mocks.unmaximizeMock.mockReset()
  mocks.closeMock.mockReset()
  mocks.isMaximizedMock.mockReset()
  mocks.isMaximizedMock.mockReturnValue(false)
  mocks.fromWebContentsMock.mockReturnValue(mocks.fakeWindow)
})

function handlerFor (channel: string): (event: { returnValue?: unknown; sender: unknown }, ...args: unknown[]) => void {
  const call = mocks.ipcMainOnMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()
  return call?.[1] as (event: { returnValue?: unknown; sender: unknown }, ...args: unknown[]) => void
}

const fakeSender = {}

/**
 * registerFaWindowControlIpc
 * Subscribes synchronous handlers for every window control IPC channel name.
 */
test('Test that registerFaWindowControlIpc registers each window control sync channel once', async () => {
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const channels = mocks.ipcMainOnMock.mock.calls.map((c) => c[0])
  expect(channels).toEqual([
    FA_WINDOW_CONTROL_IPC.checkMaximizedSync,
    FA_WINDOW_CONTROL_IPC.minimizeSync,
    FA_WINDOW_CONTROL_IPC.maximizeSync,
    FA_WINDOW_CONTROL_IPC.resizeToggleSync,
    FA_WINDOW_CONTROL_IPC.closeSync
  ])
})

/**
 * registerFaWindowControlIpc
 * Second registration is a no-op so handlers are not duplicated.
 */
test('Test that registerFaWindowControlIpc skips duplicate registration', async () => {
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()
  const afterFirst = mocks.ipcMainOnMock.mock.calls.length
  registerFaWindowControlIpc()
  expect(mocks.ipcMainOnMock.mock.calls.length).toBe(afterFirst)
})

/**
 * registerFaWindowControlIpc
 * checkMaximizedSync reports isMaximized from the window resolved from the sender.
 */
test('Test that registerFaWindowControlIpc checkMaximizedSync sets returnValue from isMaximized', async () => {
  mocks.isMaximizedMock.mockReturnValue(true)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { returnValue?: boolean; sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.checkMaximizedSync)(event)

  expect(mocks.fromWebContentsMock).toHaveBeenCalledWith(fakeSender)
  expect(event.returnValue).toBe(true)
})

/**
 * registerFaWindowControlIpc
 * checkMaximizedSync returns false when no BrowserWindow is resolved.
 */
test('Test that registerFaWindowControlIpc checkMaximizedSync returns false without a window', async () => {
  mocks.fromWebContentsMock.mockReturnValue(null)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { returnValue?: boolean; sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.checkMaximizedSync)(event)

  expect(event.returnValue).toBe(false)
})

/**
 * registerFaWindowControlIpc
 * minimizeSync no-ops when no BrowserWindow is resolved.
 */
test('Test that registerFaWindowControlIpc minimizeSync no-ops without a window', async () => {
  mocks.fromWebContentsMock.mockReturnValue(null)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.minimizeSync)(event)

  expect(mocks.minimizeMock).not.toHaveBeenCalled()
})

/**
 * registerFaWindowControlIpc
 * minimizeSync calls minimize on the resolved window.
 */
test('Test that registerFaWindowControlIpc minimizeSync calls minimize', async () => {
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.minimizeSync)(event)

  expect(mocks.minimizeMock).toHaveBeenCalledOnce()
})

/**
 * registerFaWindowControlIpc
 * maximizeSync no-ops when no BrowserWindow is resolved.
 */
test('Test that registerFaWindowControlIpc maximizeSync no-ops without a window', async () => {
  mocks.fromWebContentsMock.mockReturnValue(null)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.maximizeSync)(event)

  expect(mocks.maximizeMock).not.toHaveBeenCalled()
})

/**
 * registerFaWindowControlIpc
 * maximizeSync calls maximize on the resolved window.
 */
test('Test that registerFaWindowControlIpc maximizeSync calls maximize', async () => {
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.maximizeSync)(event)

  expect(mocks.maximizeMock).toHaveBeenCalledOnce()
})

/**
 * registerFaWindowControlIpc
 * closeSync no-ops when no BrowserWindow is resolved.
 */
test('Test that registerFaWindowControlIpc closeSync no-ops without a window', async () => {
  mocks.fromWebContentsMock.mockReturnValue(null)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.closeSync)(event)

  expect(mocks.closeMock).not.toHaveBeenCalled()
})

/**
 * registerFaWindowControlIpc
 * closeSync calls close on the resolved window.
 */
test('Test that registerFaWindowControlIpc closeSync calls close', async () => {
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.closeSync)(event)

  expect(mocks.closeMock).toHaveBeenCalledOnce()
})

/**
 * registerFaWindowControlIpc
 * resizeToggleSync unmaximizes when the window is maximized.
 */
test('Test that registerFaWindowControlIpc resizeToggleSync unmaximizes when maximized', async () => {
  mocks.isMaximizedMock.mockReturnValue(true)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.resizeToggleSync)(event)

  expect(mocks.unmaximizeMock).toHaveBeenCalledOnce()
  expect(mocks.maximizeMock).not.toHaveBeenCalled()
})

/**
 * registerFaWindowControlIpc
 * resizeToggleSync maximizes when the window is not maximized.
 */
test('Test that registerFaWindowControlIpc resizeToggleSync maximizes when not maximized', async () => {
  mocks.isMaximizedMock.mockReturnValue(false)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.resizeToggleSync)(event)

  expect(mocks.maximizeMock).toHaveBeenCalledOnce()
  expect(mocks.unmaximizeMock).not.toHaveBeenCalled()
})

/**
 * registerFaWindowControlIpc
 * resizeToggleSync no-ops when no BrowserWindow is resolved.
 */
test('Test that registerFaWindowControlIpc resizeToggleSync no-ops without a window', async () => {
  mocks.fromWebContentsMock.mockReturnValue(null)
  const { registerFaWindowControlIpc } = await import('../registerFaWindowControlIpc')
  registerFaWindowControlIpc()

  const event: { sender: unknown } = { sender: fakeSender }
  handlerFor(FA_WINDOW_CONTROL_IPC.resizeToggleSync)(event)

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
