/**
 * @vitest-environment jsdom
 */
import { beforeEach, expect, test, vi } from 'vitest'

import { isFaSkipWelcomeScreenBridgeReady } from '../functions/isFaSkipWelcomeScreenBridgeReady'

beforeEach(() => {
  Reflect.deleteProperty(window, 'faContentBridgeAPIs')
})

/**
 * isFaSkipWelcomeScreenBridgeReady
 * Returns false when preload bridges are absent.
 */
test('Test that isFaSkipWelcomeScreenBridgeReady returns false without bridges', () => {
  expect(isFaSkipWelcomeScreenBridgeReady()).toBe(false)
})

/**
 * isFaSkipWelcomeScreenBridgeReady
 * Returns true when project management and user settings bridges are wired.
 */
test('Test that isFaSkipWelcomeScreenBridgeReady returns true when bridges exist', () => {
  window.faContentBridgeAPIs = {
    faUserSettings: {
      getSettings: vi.fn()
    },
    projectManagement: {
      resolveRecentProjectMruHeadForOpen: vi.fn()
    }
  } as never

  expect(isFaSkipWelcomeScreenBridgeReady()).toBe(true)
})
