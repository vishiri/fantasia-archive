import { test, expect, vi, beforeEach } from 'vitest'
import { faWindowControlAPI } from '../faWindowControlAPI'

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
 * checkWindowMaximized
 * Test when getCurrentWindow is unavailable.
 */
test('Test if the electron is maximized', () => {
  getCurrentWindowMock.mockImplementation(() => {
    throw new Error('no remote')
  })
  expect(faWindowControlAPI.checkWindowMaximized()).toBe(false)
})

/**
 * checkWindowMaximized
 * Current window reports maximized state from isMaximized().
 */
test('Test that checkWindowMaximized returns true when focused window is maximized', () => {
  getCurrentWindowMock.mockReturnValue({
    isMaximized: () => true
  })
  expect(faWindowControlAPI.checkWindowMaximized()).toBe(true)
})

/**
 * checkWindowMaximized
 * Current window reports not maximized when isMaximized is false.
 */
test('Test that checkWindowMaximized returns false when focused window is not maximized', () => {
  getCurrentWindowMock.mockReturnValue({
    isMaximized: () => false
  })
  expect(faWindowControlAPI.checkWindowMaximized()).toBe(false)
})

/**
 * checkWindowMaximized
 * Null window (no throw) is treated like missing remote.
 */
test('Test that checkWindowMaximized returns false when getCurrentWindow returns null', () => {
  getCurrentWindowMock.mockReturnValue(null)
  expect(faWindowControlAPI.checkWindowMaximized()).toBe(false)
})

/**
 * minimizeWindow
 * Test minimizing the current window.
 */
test('Test that minimizing of the electron window works', () => {
  const minimize = vi.fn()
  getCurrentWindowMock.mockReturnValue({ minimize })
  faWindowControlAPI.minimizeWindow()
  expect(minimize).toHaveBeenCalledOnce()
})

/**
 * maximizeWindow
 * Test maximizing the current window.
 */
test('Test that maximizing of the electron window works', () => {
  const maximize = vi.fn()
  getCurrentWindowMock.mockReturnValue({ maximize })
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
  getCurrentWindowMock
    .mockReturnValueOnce({
      isMaximized: () => false,
      maximize,
      unmaximize
    })
    .mockReturnValueOnce({
      isMaximized: () => true,
      maximize,
      unmaximize
    })
  faWindowControlAPI.resizeWindow()
  faWindowControlAPI.resizeWindow()

  expect(maximize).toHaveBeenCalledOnce()
  expect(unmaximize).toHaveBeenCalledOnce()
})

/**
 * closeWindow
 * Test closing the current window.
 */
test('Test that closing of the electron window works', () => {
  const close = vi.fn()
  getCurrentWindowMock.mockReturnValue({ close })
  faWindowControlAPI.closeWindow()
  expect(close).toHaveBeenCalledOnce()
})

/**
 * minimizeWindow
 * No-op when there is no current window.
 */
test('Test that minimizeWindow does nothing when getCurrentWindow throws', () => {
  getCurrentWindowMock.mockImplementation(() => {
    throw new Error('no remote')
  })
  expect(() => faWindowControlAPI.minimizeWindow()).not.toThrow()
})

/**
 * maximizeWindow
 * No-op when there is no current window.
 */
test('Test that maximizeWindow does nothing when getCurrentWindow throws', () => {
  getCurrentWindowMock.mockImplementation(() => {
    throw new Error('no remote')
  })
  expect(() => faWindowControlAPI.maximizeWindow()).not.toThrow()
})

/**
 * resizeWindow
 * No-op when there is no current window.
 */
test('Test that resizeWindow does nothing when getCurrentWindow throws', () => {
  getCurrentWindowMock.mockImplementation(() => {
    throw new Error('no remote')
  })
  expect(() => faWindowControlAPI.resizeWindow()).not.toThrow()
})

/**
 * closeWindow
 * No-op when there is no current window.
 */
test('Test that closeWindow does nothing when getCurrentWindow throws', () => {
  getCurrentWindowMock.mockImplementation(() => {
    throw new Error('no remote')
  })
  expect(() => faWindowControlAPI.closeWindow()).not.toThrow()
})
