import { expect, test, vi } from 'vitest'
import { toggleDevTools } from '../toggleDevTools'

/**
 * toggleDevTools
 * Test that bridge API toggle function is called.
 */
test('Test that toggleDevTools calls window faContentBridgeAPIs bridge', () => {
  const toggleDevToolsMock = vi.fn()
  const originalWindow = globalThis.window

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

  Object.defineProperty(globalThis, 'window', {
    value: originalWindow,
    configurable: true
  })
})
