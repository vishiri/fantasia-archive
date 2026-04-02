import { test, expect, vi, beforeEach } from 'vitest'
import { FA_DEVTOOLS_IPC } from 'app/src-electron/devToolsIpcChannels'
import { faDevToolsControlAPI } from '../faDevToolsControlAPI'

const { ipcRendererSendSyncMock } = vi.hoisted(() => {
  return {
    ipcRendererSendSyncMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    ipcRenderer: {
      sendSync: ipcRendererSendSyncMock
    }
  }
})

beforeEach(() => {
  ipcRendererSendSyncMock.mockReset()
})

/**
 * checkDevToolsStatus
 * Test for IPC failure.
 */
test('Test that checkDevToolsStatus returns false if sendSync throws', () => {
  ipcRendererSendSyncMock.mockImplementation(() => {
    throw new Error('no ipc')
  })
  expect(faDevToolsControlAPI.checkDevToolsStatus()).toBe(false)
})

/**
 * checkDevToolsStatus
 * Test for current window with opened dev tools.
 */
test('Test that checkDevToolsStatus returns true when IPC reports dev tools are open', () => {
  ipcRendererSendSyncMock.mockReturnValue(true)
  expect(faDevToolsControlAPI.checkDevToolsStatus()).toBe(true)
  expect(ipcRendererSendSyncMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.statusSync)
})

/**
 * toggleDevTools
 * Test that toggling invokes the toggle channel.
 */
test('Test that toggleDevTools calls IPC toggle channel', () => {
  ipcRendererSendSyncMock.mockReturnValue(true)
  faDevToolsControlAPI.toggleDevTools()
  expect(ipcRendererSendSyncMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.toggleSync)
})

/**
 * toggleDevTools
 * No-op when sendSync throws.
 */
test('Test that toggleDevTools does not throw when sendSync throws', () => {
  ipcRendererSendSyncMock.mockImplementation(() => {
    throw new Error('no ipc')
  })
  expect(() => faDevToolsControlAPI.toggleDevTools()).not.toThrow()
})

/**
 * openDevTools
 * No-op when sendSync throws.
 */
test('Test that openDevTools does not throw when sendSync throws', () => {
  ipcRendererSendSyncMock.mockImplementation(() => {
    throw new Error('no ipc')
  })
  expect(() => faDevToolsControlAPI.openDevTools()).not.toThrow()
})

/**
 * closeDevTools
 * No-op when sendSync throws.
 */
test('Test that closeDevTools does not throw when sendSync throws', () => {
  ipcRendererSendSyncMock.mockImplementation(() => {
    throw new Error('no ipc')
  })
  expect(() => faDevToolsControlAPI.closeDevTools()).not.toThrow()
})

/**
 * openDevTools and closeDevTools
 * Test that explicit open and close methods call the expected IPC channels.
 */
test('Test that openDevTools and closeDevTools call IPC channels', () => {
  ipcRendererSendSyncMock.mockReturnValue(true)

  faDevToolsControlAPI.openDevTools()
  faDevToolsControlAPI.closeDevTools()

  expect(ipcRendererSendSyncMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.openSync)
  expect(ipcRendererSendSyncMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.closeSync)
})
