import { test, expect, vi, beforeEach } from 'vitest'
import { faDevToolsControlAPI } from '../faDevToolsControlAPI'

const { getFocusedWindowMock } = vi.hoisted(() => {
  return {
    getFocusedWindowMock: vi.fn()
  }
})

vi.mock('@electron/remote', () => {
  return {
    BrowserWindow: {
      getFocusedWindow: getFocusedWindowMock
    }
  }
})

beforeEach(() => {
  getFocusedWindowMock.mockReset()
})

/**
 * checkDevToolsStatus
 * Test for no focused window.
 */
test('Test that checkDevToolsStatus returns false if no window is focused', () => {
  getFocusedWindowMock.mockReturnValue(null)
  expect(faDevToolsControlAPI.checkDevToolsStatus()).toBe(false)
})

/**
 * checkDevToolsStatus
 * Test for focused window with opened dev tools.
 */
test('Test that checkDevToolsStatus returns true when dev tools are open', () => {
  const isDevToolsOpened = vi.fn(() => true)
  getFocusedWindowMock.mockReturnValue({
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
  getFocusedWindowMock.mockReturnValue({
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
 * openDevTools and closeDevTools
 * Test that explicit open and close methods call the focused window APIs.
 */
test('Test that openDevTools and closeDevTools call webContents APIs', () => {
  const openDevTools = vi.fn()
  const closeDevTools = vi.fn()
  getFocusedWindowMock.mockReturnValue({
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
