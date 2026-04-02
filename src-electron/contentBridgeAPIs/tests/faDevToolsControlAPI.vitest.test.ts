import { test, expect, vi, beforeEach } from 'vitest'
import { faDevToolsControlAPI } from '../faDevToolsControlAPI'

const { getCurrentWindowMock } = vi.hoisted(() => {
  return {
    getCurrentWindowMock: vi.fn()
  }
})

vi.mock('@electron/remote', () => {
  return {
    getCurrentWindow: getCurrentWindowMock
  }
})

beforeEach(() => {
  getCurrentWindowMock.mockReset()
})

/**
 * checkDevToolsStatus
 * Test for no current window.
 */
test('Test that checkDevToolsStatus returns false if getCurrentWindow is unavailable', () => {
  getCurrentWindowMock.mockImplementation(() => {
    throw new Error('no remote')
  })
  expect(faDevToolsControlAPI.checkDevToolsStatus()).toBe(false)
})

/**
 * checkDevToolsStatus
 * Test for current window with opened dev tools.
 */
test('Test that checkDevToolsStatus returns true when dev tools are open', () => {
  const isDevToolsOpened = vi.fn(() => true)
  getCurrentWindowMock.mockReturnValue({
    webContents: {
      isDevToolsOpened
    }
  })
  expect(faDevToolsControlAPI.checkDevToolsStatus()).toBe(true)
})

/**
 * toggleDevTools
 * Test that toggling closes opened dev tools.
 */
test('Test that toggleDevTools closes already opened dev tools', () => {
  const closeDevTools = vi.fn()
  getCurrentWindowMock.mockReturnValue({
    webContents: {
      isDevToolsOpened: () => true,
      closeDevTools,
      openDevTools: vi.fn()
    }
  })
  faDevToolsControlAPI.toggleDevTools()
  expect(closeDevTools).toHaveBeenCalledOnce()
})

/**
 * toggleDevTools
 * Opens dev tools when they are currently closed.
 */
test('Test that toggleDevTools opens dev tools when they are closed', () => {
  const openDevTools = vi.fn()
  getCurrentWindowMock.mockReturnValue({
    webContents: {
      isDevToolsOpened: () => false,
      closeDevTools: vi.fn(),
      openDevTools
    }
  })
  faDevToolsControlAPI.toggleDevTools()
  expect(openDevTools).toHaveBeenCalledOnce()
})

/**
 * toggleDevTools
 * No-op when there is no current window.
 */
test('Test that toggleDevTools does nothing when getCurrentWindow throws', () => {
  getCurrentWindowMock.mockImplementation(() => {
    throw new Error('no remote')
  })
  expect(() => faDevToolsControlAPI.toggleDevTools()).not.toThrow()
})

/**
 * openDevTools
 * No-op when there is no current window.
 */
test('Test that openDevTools does nothing when getCurrentWindow throws', () => {
  getCurrentWindowMock.mockImplementation(() => {
    throw new Error('no remote')
  })
  expect(() => faDevToolsControlAPI.openDevTools()).not.toThrow()
})

/**
 * closeDevTools
 * No-op when there is no current window.
 */
test('Test that closeDevTools does nothing when getCurrentWindow throws', () => {
  getCurrentWindowMock.mockImplementation(() => {
    throw new Error('no remote')
  })
  expect(() => faDevToolsControlAPI.closeDevTools()).not.toThrow()
})

/**
 * openDevTools and closeDevTools
 * Test that explicit open and close methods call the current window APIs.
 */
test('Test that openDevTools and closeDevTools call webContents APIs', () => {
  const openDevTools = vi.fn()
  const closeDevTools = vi.fn()
  getCurrentWindowMock.mockReturnValue({
    webContents: {
      isDevToolsOpened: () => false,
      closeDevTools,
      openDevTools
    }
  })

  faDevToolsControlAPI.openDevTools()
  faDevToolsControlAPI.closeDevTools()

  expect(openDevTools).toHaveBeenCalledOnce()
  expect(closeDevTools).toHaveBeenCalledOnce()
})
