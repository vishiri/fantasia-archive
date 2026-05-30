import { beforeEach, expect, test, vi } from 'vitest'

const openWelcomeScreenAutoLoadProjectMock = vi.hoisted(() => {
  return vi.fn()
})

const userSettingsRef = vi.hoisted(() => {
  return {
    value: null as { skipWelcomeScreen: boolean } | null
  }
})

vi.mock('app/src/scripts/projectManagement/faWelcomeScreenAutoLoadProject_manager', () => {
  return {
    openWelcomeScreenAutoLoadProject: openWelcomeScreenAutoLoadProjectMock
  }
})

vi.mock('app/src/stores/S_FaUserSettings', () => {
  return {
    S_FaUserSettings: () => {
      return {
        get settings () {
          return userSettingsRef.value
        }
      }
    }
  }
})

import {
  runSkipWelcomeScreenRedirect,
  tryRunSkipWelcomeScreenOnLaunch
} from '../faAppStartupSkipWelcomeScreen_manager'

function assignFaContentBridgeApis (apis: unknown): void {
  vi.stubGlobal('window', {
    faContentBridgeAPIs: apis
  })
}

beforeEach(() => {
  openWelcomeScreenAutoLoadProjectMock.mockReset()
  userSettingsRef.value = null
  openWelcomeScreenAutoLoadProjectMock.mockResolvedValue(true)
  assignFaContentBridgeApis(undefined)
})

/**
 * runSkipWelcomeScreenRedirect
 * Returns false when the user-settings bridge is unavailable and the store is empty.
 */
test('Test that runSkipWelcomeScreenRedirect returns false without faUserSettings bridge', async () => {
  assignFaContentBridgeApis({
    projectManagement: {}
  })

  await expect(runSkipWelcomeScreenRedirect()).resolves.toBe(false)
  expect(openWelcomeScreenAutoLoadProjectMock).not.toHaveBeenCalled()
})

/**
 * runSkipWelcomeScreenRedirect
 * Returns false when skipWelcomeScreen is off in persisted settings.
 */
test('Test that runSkipWelcomeScreenRedirect returns false when skipWelcomeScreen is false', async () => {
  assignFaContentBridgeApis({
    faUserSettings: {
      async getSettings () {
        return {
          skipWelcomeScreen: false
        }
      }
    },
    projectManagement: {}
  })

  await expect(runSkipWelcomeScreenRedirect()).resolves.toBe(false)
  expect(openWelcomeScreenAutoLoadProjectMock).not.toHaveBeenCalled()
})

/**
 * runSkipWelcomeScreenRedirect
 * Returns false when skip is enabled but project management bridge is missing.
 */
test('Test that runSkipWelcomeScreenRedirect returns false without projectManagement bridge', async () => {
  userSettingsRef.value = {
    skipWelcomeScreen: true
  }
  assignFaContentBridgeApis({
    faUserSettings: {
      async getSettings () {
        return {
          skipWelcomeScreen: true
        }
      }
    }
  })

  await expect(runSkipWelcomeScreenRedirect()).resolves.toBe(false)
  expect(openWelcomeScreenAutoLoadProjectMock).not.toHaveBeenCalled()
})

/**
 * runSkipWelcomeScreenRedirect
 * Delegates to welcome auto-load when skip is enabled and project management exists.
 */
test('Test that runSkipWelcomeScreenRedirect opens welcome auto-load when skip is enabled', async () => {
  userSettingsRef.value = {
    skipWelcomeScreen: true
  }
  assignFaContentBridgeApis({
    projectManagement: {}
  })

  await expect(runSkipWelcomeScreenRedirect()).resolves.toBe(true)
  expect(openWelcomeScreenAutoLoadProjectMock).toHaveBeenCalledTimes(1)
})

/**
 * tryRunSkipWelcomeScreenOnLaunch
 * Forwards to runSkipWelcomeScreenRedirect.
 */
test('Test that tryRunSkipWelcomeScreenOnLaunch delegates to welcome auto-load', async () => {
  assignFaContentBridgeApis({
    faUserSettings: {
      async getSettings () {
        return {
          skipWelcomeScreen: true
        }
      }
    },
    projectManagement: {}
  })

  await expect(tryRunSkipWelcomeScreenOnLaunch()).resolves.toBe(true)
  expect(openWelcomeScreenAutoLoadProjectMock).toHaveBeenCalledTimes(1)
})
