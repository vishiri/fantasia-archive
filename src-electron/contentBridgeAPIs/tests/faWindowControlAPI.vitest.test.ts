import { test, expect, vi, beforeEach } from 'vitest'
import { faWindowControlAPI } from '../faWindowControlAPI'

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
 * checkWindowMaximized
 * Test for no focused window.
 */
test('Test if the electron is maximized', () => {
  getFocusedWindowMock.mockReturnValue(null)
  expect(faWindowControlAPI.checkWindowMaximized()).toBe(false)
})

/**
 * minimizeWindow
 * Test minimizing the focused window.
 */
test('Test that minimizing of the electron window works', () => {
  const minimize = vi.fn()
  getFocusedWindowMock.mockReturnValue({ minimize })
  faWindowControlAPI.minimizeWindow()
  expect(minimize).toHaveBeenCalledOnce()
})

/**
 * maximizeWindow
 * Test maximizing the focused window.
 */
test('Test that maximizing of the electron window works', () => {
  const maximize = vi.fn()
  getFocusedWindowMock.mockReturnValue({ maximize })
  faWindowControlAPI.maximizeWindow()
  expect(maximize).toHaveBeenCalledOnce()
})

/**
 * resizeWindow
 * Test resizing toggles maximize state.
 */
test('Test that resizing of the electron window works', () => {
  const maximize = vi.fn()
  const unmaximize = vi.fn()
  getFocusedWindowMock.mockReturnValue({
    isMaximized: () => false,
    maximize,
    unmaximize
  })
  faWindowControlAPI.resizeWindow()

  getFocusedWindowMock.mockReturnValue({
    isMaximized: () => true,
    maximize,
    unmaximize
  })
  faWindowControlAPI.resizeWindow()

  expect(maximize).toHaveBeenCalledOnce()
  expect(unmaximize).toHaveBeenCalledOnce()
})

/**
 * closeWindow
 * Test closing the focused window.
 */
test('Test that closing of the electron window works', () => {
  const close = vi.fn()
  getFocusedWindowMock.mockReturnValue({ close })
  faWindowControlAPI.closeWindow()
  expect(close).toHaveBeenCalledOnce()
})
