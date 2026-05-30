import { beforeEach, expect, test, vi } from 'vitest'

const {
  runFaActionMock,
  tryRunSkipWelcomeScreenOnLaunchMock,
  markWelcomeScreenAutoLoadBootAttemptedMock,
  markWelcomeScreenAutoLoadBootCompletionMock
} =
  vi.hoisted(() => {
    return {
      markWelcomeScreenAutoLoadBootAttemptedMock: vi.fn(),
      markWelcomeScreenAutoLoadBootCompletionMock: vi.fn(),
      runFaActionMock: vi.fn(),
      tryRunSkipWelcomeScreenOnLaunchMock: vi.fn()
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
      refreshSettings: vi.fn(async () => undefined)
    })
  }
})

import { determineTestingComponentName, runAppStartupRouting } from '../rendererAppInternals_manager'

beforeEach(() => {
  runFaActionMock.mockReset()
  tryRunSkipWelcomeScreenOnLaunchMock.mockReset()
  tryRunSkipWelcomeScreenOnLaunchMock.mockResolvedValue(false)
  markWelcomeScreenAutoLoadBootAttemptedMock.mockReset()
  markWelcomeScreenAutoLoadBootCompletionMock.mockReset()
})

/**
 * determineTestingComponentName
 * Test when component testing env values are valid.
 */
test('Test that determineTestingComponentName returns component name for component test environment', () => {
  const result = determineTestingComponentName('components', 'DialogAboutFantasiaArchive')

  expect(result).toBe('DialogAboutFantasiaArchive')
})

/**
 * determineTestingComponentName
 * Test when component testing env values are not valid.
 */
test('Test that determineTestingComponentName returns false outside component test environment', () => {
  const result = determineTestingComponentName('e2e', 'DialogAboutFantasiaArchive')

  expect(result).toBe(false)
})

/**
 * determineTestingComponentName
 * Component test mode still requires a non-empty component name string.
 */
test('Test that determineTestingComponentName returns false when component name is empty in component mode', () => {
  expect(determineTestingComponentName('components', '')).toBe(false)
})

/**
 * determineTestingComponentName
 * A component name without the component test environment does not enable the testing route.
 */
test('Test that determineTestingComponentName returns false when testing type is undefined', () => {
  expect(determineTestingComponentName(undefined, 'DialogAboutFantasiaArchive')).toBe(false)
})

/**
 * runAppStartupRouting
 * Test routing toward component testing path.
 */
test('Test that runAppStartupRouting pushes component testing route when requested', async () => {
  const routerPushMock = vi.fn()

  await runAppStartupRouting(
    { push: routerPushMock },
    'components',
    'FantasiaMascotImage'
  )

  expect(routerPushMock).toHaveBeenCalledWith({ path: '/componentTesting/FantasiaMascotImage' })
  expect(runFaActionMock).not.toHaveBeenCalled()
  expect(tryRunSkipWelcomeScreenOnLaunchMock).not.toHaveBeenCalled()
})

/**
 * runAppStartupRouting
 * Pushes welcome first, then skips tips when skipWelcomeScreen launch succeeds.
 */
test('Test that runAppStartupRouting pushes welcome before skip welcome screen succeeds', async () => {
  const routerPushMock = vi.fn()
  tryRunSkipWelcomeScreenOnLaunchMock.mockResolvedValueOnce(true)

  await runAppStartupRouting(
    { push: routerPushMock },
    undefined,
    undefined
  )
  await vi.waitFor(() => {
    expect(tryRunSkipWelcomeScreenOnLaunchMock).toHaveBeenCalled()
  })

  expect(markWelcomeScreenAutoLoadBootAttemptedMock).toHaveBeenCalled()
  expect(routerPushMock).toHaveBeenCalledWith({ path: '/' })
  expect(runFaActionMock).not.toHaveBeenCalled()
  await vi.waitFor(() => {
    expect(markWelcomeScreenAutoLoadBootCompletionMock).toHaveBeenCalled()
  })
})

/**
 * runAppStartupRouting
 * Test default route and tip side effect.
 */
test('Test that runAppStartupRouting defaults to welcome route and triggers trivia tip', async () => {
  const routerPushMock = vi.fn()

  await runAppStartupRouting(
    { push: routerPushMock },
    undefined,
    undefined
  )
  await vi.waitFor(() => {
    expect(runFaActionMock).toHaveBeenCalledWith('showStartupTipsNotification', undefined)
  })

  expect(routerPushMock).toHaveBeenCalledWith({ path: '/' })
})

/**
 * runAppStartupRouting
 * Component mode with a missing component name falls through to the home route and trivia notification.
 */
test('Test that runAppStartupRouting uses home route when component mode has no component name', async () => {
  const routerPushMock = vi.fn()

  await runAppStartupRouting(
    { push: routerPushMock },
    'components',
    ''
  )
  await vi.waitFor(() => {
    expect(runFaActionMock).toHaveBeenCalledWith('showStartupTipsNotification', undefined)
  })

  expect(routerPushMock).toHaveBeenCalledWith({ path: '/' })
})
