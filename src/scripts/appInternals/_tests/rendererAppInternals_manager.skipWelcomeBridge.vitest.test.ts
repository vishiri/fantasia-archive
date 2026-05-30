/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const {
  tryRunSkipWelcomeScreenOnLaunchMock,
  markWelcomeScreenAutoLoadBootCompletionMock
} = vi.hoisted(() => {
  return {
    markWelcomeScreenAutoLoadBootCompletionMock: vi.fn(),
    tryRunSkipWelcomeScreenOnLaunchMock: vi.fn()
  }
})

vi.mock('../faAppStartupSkipWelcomeScreen_manager', () => {
  return {
    tryRunSkipWelcomeScreenOnLaunch: tryRunSkipWelcomeScreenOnLaunchMock
  }
})

vi.mock('app/src/scripts/projectManagement/projectManagement_manager', () => {
  return {
    markWelcomeScreenAutoLoadBootAttempted: vi.fn(),
    markWelcomeScreenAutoLoadBootCompletion: markWelcomeScreenAutoLoadBootCompletionMock
  }
})

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => {
  return {
    runFaAction: vi.fn()
  }
})

vi.mock('app/src/stores/S_FaUserSettings', () => {
  return {
    S_FaUserSettings: () => ({
      refreshSettings: vi.fn(async () => undefined)
    })
  }
})

import { runAppStartupRouting } from '../rendererAppInternals_manager'

beforeEach(() => {
  vi.stubEnv('MODE', 'electron')
  vi.useFakeTimers()
  tryRunSkipWelcomeScreenOnLaunchMock.mockReset()
  tryRunSkipWelcomeScreenOnLaunchMock.mockResolvedValue(false)
  markWelcomeScreenAutoLoadBootCompletionMock.mockReset()
  Reflect.deleteProperty(window, 'faContentBridgeAPIs')
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

/**
 * runAppStartupRouting
 * Electron mode polls preload bridges using the manager sleepMs wiring.
 */
test('Test that runAppStartupRouting waits for skip-welcome bridges in Electron mode', async () => {
  const routerPushMock = vi.fn(async () => undefined)

  void runAppStartupRouting(
    { push: routerPushMock },
    undefined,
    undefined
  )

  await Promise.resolve()
  await Promise.resolve()

  await vi.advanceTimersByTimeAsync(100)

  window.faContentBridgeAPIs = {
    faUserSettings: {
      getSettings: vi.fn()
    },
    projectManagement: {
      resolveRecentProjectMruHeadForOpen: vi.fn()
    }
  } as never

  await vi.advanceTimersByTimeAsync(100)

  await vi.waitFor(() => {
    expect(tryRunSkipWelcomeScreenOnLaunchMock).toHaveBeenCalled()
  })
  await vi.waitFor(() => {
    expect(markWelcomeScreenAutoLoadBootCompletionMock).toHaveBeenCalled()
  })
})
