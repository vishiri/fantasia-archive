import { test, expect, vi, beforeEach } from 'vitest'

import { FA_WINDOW_CONTROL_IPC } from 'app/src-electron/electron-ipc-bridge'

const { sendSyncMock } = vi.hoisted(() => {
  return {
    sendSyncMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    ipcRenderer: {
      sendSync: sendSyncMock
    }
  }
})

import { faWindowControlAPI } from '../faWindowControlAPI'

beforeEach(() => {
  sendSyncMock.mockReset()
})

/**
 * checkWindowMaximized
 * Returns false when sendSync throws.
 */
test('Test if checkWindowMaximized returns false when sendSync throws', () => {
  sendSyncMock.mockImplementation(() => {
    throw new Error('no ipc')
  })
  expect(faWindowControlAPI.checkWindowMaximized()).toBe(false)
})

/**
 * checkWindowMaximized
 * Returns true only when sendSync returns strict true.
 */
test('Test that checkWindowMaximized returns true when sendSync returns true', () => {
  sendSyncMock.mockReturnValue(true)
  expect(faWindowControlAPI.checkWindowMaximized()).toBe(true)
  expect(sendSyncMock).toHaveBeenCalledWith(FA_WINDOW_CONTROL_IPC.checkMaximizedSync)
})

/**
 * checkWindowMaximized
 * Returns false when sendSync returns a non-boolean truthy value.
 */
test('Test that checkWindowMaximized returns false when sendSync returns non-true', () => {
  sendSyncMock.mockReturnValue('yes')
  expect(faWindowControlAPI.checkWindowMaximized()).toBe(false)
})

/**
 * checkWindowMaximized
 * Returns false when sendSync returns false.
 */
test('Test that checkWindowMaximized returns false when sendSync returns false', () => {
  sendSyncMock.mockReturnValue(false)
  expect(faWindowControlAPI.checkWindowMaximized()).toBe(false)
})

/**
 * minimizeWindow
 * Invokes minimize sync channel.
 */
test('Test that minimizeWindow calls sendSync with minimize channel', () => {
  faWindowControlAPI.minimizeWindow()
  expect(sendSyncMock).toHaveBeenCalledWith(FA_WINDOW_CONTROL_IPC.minimizeSync)
})

/**
 * minimizeWindow
 * No-op when sendSync throws.
 */
test('Test that minimizeWindow does not throw when sendSync throws', () => {
  sendSyncMock.mockImplementation(() => {
    throw new Error('no ipc')
  })
  expect(() => faWindowControlAPI.minimizeWindow()).not.toThrow()
})

/**
 * maximizeWindow
 * Invokes maximize sync channel.
 */
test('Test that maximizeWindow calls sendSync with maximize channel', () => {
  faWindowControlAPI.maximizeWindow()
  expect(sendSyncMock).toHaveBeenCalledWith(FA_WINDOW_CONTROL_IPC.maximizeSync)
})

/**
 * maximizeWindow
 * No-op when sendSync throws.
 */
test('Test that maximizeWindow does not throw when sendSync throws', () => {
  sendSyncMock.mockImplementation(() => {
    throw new Error('no ipc')
  })
  expect(() => faWindowControlAPI.maximizeWindow()).not.toThrow()
})

/**
 * resizeWindow
 * Invokes resize toggle sync channel.
 */
test('Test that resizeWindow calls sendSync with resize toggle channel', () => {
  faWindowControlAPI.resizeWindow()
  expect(sendSyncMock).toHaveBeenCalledWith(FA_WINDOW_CONTROL_IPC.resizeToggleSync)
})

/**
 * resizeWindow
 * No-op when sendSync throws.
 */
test('Test that resizeWindow does not throw when sendSync throws', () => {
  sendSyncMock.mockImplementation(() => {
    throw new Error('no ipc')
  })
  expect(() => faWindowControlAPI.resizeWindow()).not.toThrow()
})

/**
 * closeWindow
 * Invokes close sync channel.
 */
test('Test that closeWindow calls sendSync with close channel', () => {
  faWindowControlAPI.closeWindow()
  expect(sendSyncMock).toHaveBeenCalledWith(FA_WINDOW_CONTROL_IPC.closeSync)
})

/**
 * closeWindow
 * No-op when sendSync throws.
 */
test('Test that closeWindow does not throw when sendSync throws', () => {
  sendSyncMock.mockImplementation(() => {
    throw new Error('no ipc')
  })
  expect(() => faWindowControlAPI.closeWindow()).not.toThrow()
})
