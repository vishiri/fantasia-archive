/**
 * @vitest-environment jsdom
 */
import { beforeEach, expect, test, vi } from 'vitest'

const {
  runFaActionMock,
  tryRunSkipWelcomeScreenOnLaunchMock,
  markWelcomeScreenAutoLoadBootAttemptedMock,
  markWelcomeScreenAutoLoadBootCompletionMock,
  userSettingsState
} = vi.hoisted(() => {
  return {
    markWelcomeScreenAutoLoadBootAttemptedMock: vi.fn(),
    markWelcomeScreenAutoLoadBootCompletionMock: vi.fn(),
    runFaActionMock: vi.fn(),
    tryRunSkipWelcomeScreenOnLaunchMock: vi.fn(),
    userSettingsState: {
      disableStartUpdateCheckMessage: false
    }
  }
})

vi.mock('../faAppStartupSkipWelcomeScreen_manager', () => {
  return {
    tryRunSkipWelcomeScreenOnLaunch: tryRunSkipWelcomeScreenOnLaunchMock
  }
})

vi.mock('app/src/scripts/projectManagement/functions/faWelcomeScreenAutoLoadSession', () => {
  return {
    markWelcomeScreenAutoLoadBootAttempted: markWelcomeScreenAutoLoadBootAttemptedMock,
    markWelcomeScreenAutoLoadBootCompletion: markWelcomeScreenAutoLoadBootCompletionMock
  }
})

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => {
  return {
    runFaAction: runFaActionMock
  }
})

vi.mock('app/src/stores/S_FaUserSettings', () => {
  return {
    S_FaUserSettings: () => ({
      refreshSettings: vi.fn(async () => undefined),
      settings: userSettingsState
    })
  }
})

import { runAppStartupRouting } from '../rendererAppInternals_manager'

beforeEach(() => {
  runFaActionMock.mockReset()
  tryRunSkipWelcomeScreenOnLaunchMock.mockReset()
  tryRunSkipWelcomeScreenOnLaunchMock.mockResolvedValue(false)
  markWelcomeScreenAutoLoadBootAttemptedMock.mockReset()
  markWelcomeScreenAutoLoadBootCompletionMock.mockReset()
  userSettingsState.disableStartUpdateCheckMessage = false
  Reflect.deleteProperty(window, 'faContentBridgeAPIs')
})

/**
 * runAppStartupRouting
 * Skips startup update check when disableStartUpdateCheckMessage is on.
 */
test('Test that manager skips startup update check when disableStartUpdateCheckMessage is on', async () => {
  userSettingsState.disableStartUpdateCheckMessage = true

  await runAppStartupRouting({ push: vi.fn() }, undefined, undefined)
  await vi.waitFor(() => {
    expect(runFaActionMock).toHaveBeenCalledWith('showStartupTipsNotification', undefined)
  })
  expect(runFaActionMock).not.toHaveBeenCalledWith('checkForAppUpdates', { source: 'startup' })
})

/**
 * runAppStartupRouting
 * Skips startup update check when cached Playwright TEST_ENV is components.
 */
test('Test that manager skips startup update check for cached components TEST_ENV', async () => {
  window.faContentBridgeAPIs = {
    extraEnvVariables: {
      getCachedSnapshot: () => ({ TEST_ENV: 'components' })
    }
  } as never

  await runAppStartupRouting({ push: vi.fn() }, undefined, undefined)
  await vi.waitFor(() => {
    expect(runFaActionMock).toHaveBeenCalledWith('showStartupTipsNotification', undefined)
  })
  expect(runFaActionMock).not.toHaveBeenCalledWith('checkForAppUpdates', { source: 'startup' })
})

/**
 * runAppStartupRouting
 * Reads TEST_ENV from getSnapshot when cache is empty.
 */
test('Test that manager skips startup update check for getSnapshot e2e TEST_ENV', async () => {
  window.faContentBridgeAPIs = {
    extraEnvVariables: {
      getCachedSnapshot: () => null,
      getSnapshot: vi.fn(async () => ({ TEST_ENV: 'e2e' }))
    }
  } as never

  await runAppStartupRouting({ push: vi.fn() }, undefined, undefined)
  await vi.waitFor(() => {
    expect(runFaActionMock).toHaveBeenCalledWith('showStartupTipsNotification', undefined)
  })
  expect(runFaActionMock).not.toHaveBeenCalledWith('checkForAppUpdates', { source: 'startup' })
})

/**
 * runAppStartupRouting
 * Ignores non-string TEST_ENV values from cached snapshot.
 */
test('Test that manager ignores non-string cached TEST_ENV and still runs update check', async () => {
  window.faContentBridgeAPIs = {
    extraEnvVariables: {
      getCachedSnapshot: () => ({ TEST_ENV: 1 }),
      getSnapshot: vi.fn(async () => ({ TEST_ENV: 'e2e' }))
    }
  } as never

  await runAppStartupRouting({ push: vi.fn() }, undefined, undefined)
  await vi.waitFor(() => {
    expect(runFaActionMock).toHaveBeenCalledWith('checkForAppUpdates', { source: 'startup' })
  })
})

/**
 * runAppStartupRouting
 * Returns undefined TEST_ENV when bridge has no getSnapshot after empty cache.
 */
test('Test that manager runs update check when env bridge has no snapshot APIs', async () => {
  window.faContentBridgeAPIs = {
    extraEnvVariables: {
      getCachedSnapshot: () => undefined
    }
  } as never

  await runAppStartupRouting({ push: vi.fn() }, undefined, undefined)
  await vi.waitFor(() => {
    expect(runFaActionMock).toHaveBeenCalledWith('checkForAppUpdates', { source: 'startup' })
  })
})
