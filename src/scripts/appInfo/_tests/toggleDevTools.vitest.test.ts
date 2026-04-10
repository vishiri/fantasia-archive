import { afterEach, expect, test, vi } from 'vitest'
import { toggleDevTools } from '../toggleDevTools'

const originalWindow = globalThis.window

afterEach(() => {
  Object.defineProperty(globalThis, 'window', {
    value: originalWindow,
    configurable: true
  })
})

/**
 * toggleDevTools
 * Test that bridge API toggle function is called.
 */
test('Test that toggleDevTools calls window faContentBridgeAPIs bridge', () => {
  const toggleDevToolsMock = vi.fn()

  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        faDevToolsControl: {
          toggleDevTools: toggleDevToolsMock
        }
      }
    },
    configurable: true
  })

  toggleDevTools()
  expect(toggleDevToolsMock).toHaveBeenCalledOnce()
})

/**
 * toggleDevTools
 * Missing bridge objects do not throw when optional chaining short-circuits.
 */
test('Test that toggleDevTools does not throw when faContentBridgeAPIs is missing', () => {
  Object.defineProperty(globalThis, 'window', {
    value: {},
    configurable: true
  })

  expect(() => {
    toggleDevTools()
  }).not.toThrow()
})

/**
 * toggleDevTools
 * Missing faDevToolsControl does not throw when optional chaining short-circuits.
 */
test('Test that toggleDevTools does not throw when faDevToolsControl is missing', () => {
  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {}
    },
    configurable: true
  })

  expect(() => {
    toggleDevTools()
  }).not.toThrow()
})

/**
 * toggleDevTools
 * Missing toggleDevTools callback does not throw when optional chaining short-circuits.
 */
test('Test that toggleDevTools does not throw when toggleDevTools callback is missing', () => {
  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        faDevToolsControl: {}
      }
    },
    configurable: true
  })

  expect(() => {
    toggleDevTools()
  }).not.toThrow()
})
