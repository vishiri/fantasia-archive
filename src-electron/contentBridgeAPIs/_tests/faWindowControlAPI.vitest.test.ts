import { beforeEach, expect, test, vi } from 'vitest'

import { FA_WINDOW_CONTROL_IPC } from 'app/src-electron/electron-ipc-bridge'

const { invokeMock } = vi.hoisted(() => {
  return {
    invokeMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    ipcRenderer: {
      invoke: invokeMock
    }
  }
})

beforeEach(async () => {
  vi.resetModules()
  invokeMock.mockReset()
})

/**
 * checkWindowMaximized
 * Returns false when invoke rejects.
 */
test('Test if checkWindowMaximized returns false when invoke rejects', async () => {
  invokeMock.mockRejectedValue(new Error('ipc failed'))
  const { faWindowControlAPI } = await import('../faWindowControlAPI')

  await expect(faWindowControlAPI.checkWindowMaximized()).resolves.toBe(false)
})

/**
 * checkWindowMaximized
 * Returns true only when invoke returns strict true.
 */
test('Test that checkWindowMaximized returns true when invoke returns true', async () => {
  invokeMock.mockResolvedValue(true)
  const { faWindowControlAPI } = await import('../faWindowControlAPI')

  await expect(faWindowControlAPI.checkWindowMaximized()).resolves.toBe(true)
  expect(invokeMock).toHaveBeenCalledWith(FA_WINDOW_CONTROL_IPC.checkMaximizedAsync)
})

/**
 * checkWindowMaximized
 * Returns false when invoke returns a non-boolean truthy value.
 */
test('Test that checkWindowMaximized returns false when invoke returns non-true', async () => {
  invokeMock.mockResolvedValue('yes')
  const { faWindowControlAPI } = await import('../faWindowControlAPI')

  await expect(faWindowControlAPI.checkWindowMaximized()).resolves.toBe(false)
})

/**
 * checkWindowMaximized
 * Returns false when invoke returns false.
 */
test('Test that checkWindowMaximized returns false when invoke returns false', async () => {
  invokeMock.mockResolvedValue(false)
  const { faWindowControlAPI } = await import('../faWindowControlAPI')

  await expect(faWindowControlAPI.checkWindowMaximized()).resolves.toBe(false)
})

test('Test that minimizeWindow calls invoke with minimize channel', async () => {
  invokeMock.mockResolvedValue(undefined)
  const { faWindowControlAPI } = await import('../faWindowControlAPI')

  await faWindowControlAPI.minimizeWindow()

  expect(invokeMock).toHaveBeenCalledWith(FA_WINDOW_CONTROL_IPC.minimizeAsync)
})

/**
 * No-op when invoke rejects.
 */
test('Test that minimizeWindow does not throw when invoke rejects', async () => {
  invokeMock.mockRejectedValue(new Error('ipc failed'))
  const { faWindowControlAPI } = await import('../faWindowControlAPI')

  await expect(faWindowControlAPI.minimizeWindow()).resolves.toBeUndefined()
})

test('Test that maximizeWindow calls invoke with maximize channel', async () => {
  invokeMock.mockResolvedValue(undefined)
  const { faWindowControlAPI } = await import('../faWindowControlAPI')

  await faWindowControlAPI.maximizeWindow()

  expect(invokeMock).toHaveBeenCalledWith(FA_WINDOW_CONTROL_IPC.maximizeAsync)
})

/**
 * No-op when invoke rejects.
 */
test('Test that maximizeWindow does not throw when invoke rejects', async () => {
  invokeMock.mockRejectedValue(new Error('ipc failed'))
  const { faWindowControlAPI } = await import('../faWindowControlAPI')

  await expect(faWindowControlAPI.maximizeWindow()).resolves.toBeUndefined()
})

test('Test that resizeWindow calls invoke with resize toggle channel', async () => {
  invokeMock.mockResolvedValue(undefined)
  const { faWindowControlAPI } = await import('../faWindowControlAPI')

  await faWindowControlAPI.resizeWindow()

  expect(invokeMock).toHaveBeenCalledWith(FA_WINDOW_CONTROL_IPC.resizeToggleAsync)
})

/**
 * No-op when invoke rejects.
 */
test('Test that resizeWindow does not throw when invoke rejects', async () => {
  invokeMock.mockRejectedValue(new Error('ipc failed'))
  const { faWindowControlAPI } = await import('../faWindowControlAPI')

  await expect(faWindowControlAPI.resizeWindow()).resolves.toBeUndefined()
})

test('Test that closeWindow calls invoke with close channel', async () => {
  invokeMock.mockResolvedValue(undefined)
  const { faWindowControlAPI } = await import('../faWindowControlAPI')

  await faWindowControlAPI.closeWindow()

  expect(invokeMock).toHaveBeenCalledWith(FA_WINDOW_CONTROL_IPC.closeAsync)
})

/**
 * No-op when invoke rejects.
 */
test('Test that closeWindow does not throw when invoke rejects', async () => {
  invokeMock.mockRejectedValue(new Error('ipc failed'))
  const { faWindowControlAPI } = await import('../faWindowControlAPI')

  await expect(faWindowControlAPI.closeWindow()).resolves.toBeUndefined()
})

test('Test that refreshWebContents calls invoke with refresh channel', async () => {
  invokeMock.mockResolvedValue(undefined)
  const { faWindowControlAPI } = await import('../faWindowControlAPI')

  await faWindowControlAPI.refreshWebContents()

  expect(invokeMock).toHaveBeenCalledWith(FA_WINDOW_CONTROL_IPC.refreshWebContentsAsync)
})

test('Test that refreshWebContents does not throw when invoke rejects', async () => {
  invokeMock.mockRejectedValue(new Error('ipc failed'))
  const { faWindowControlAPI } = await import('../faWindowControlAPI')

  await expect(faWindowControlAPI.refreshWebContents()).resolves.toBeUndefined()
})
