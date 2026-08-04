import { beforeEach, expect, test, vi } from 'vitest'

import { createRendererAppInternals } from '../createRendererAppInternals'

const runFaActionMock = vi.fn()
const tryRunSkipWelcomeScreenOnLaunchMock = vi.fn()
const getPlaywrightTestEnvMock = vi.fn(async () => undefined as string | undefined)
const shouldRunStartupUpdateCheckMock = vi.fn(() => true)
const markWelcomeScreenAutoLoadBootAttemptedMock = vi.fn()
const markWelcomeScreenAutoLoadBootCompletionMock = vi.fn()
const waitForSkipWelcomeScreenBridgeWhenElectronMock = vi.fn(async () => undefined)
const refreshUserSettingsBeforeSkipWelcomeScreenOnLaunchMock = vi.fn(async () => undefined)

function buildApi () {
  return createRendererAppInternals({
    applyFaI18nLocaleFromLanguageCode: vi.fn(),
    applyFaUserSettingsLanguageSelection: vi.fn(async () => undefined),
    getPlaywrightTestEnv: getPlaywrightTestEnvMock,
    isFantasiaStorybookCanvas: () => false,
    markWelcomeScreenAutoLoadBootAttempted: markWelcomeScreenAutoLoadBootAttemptedMock,
    markWelcomeScreenAutoLoadBootCompletion: markWelcomeScreenAutoLoadBootCompletionMock,
    refreshUserSettingsBeforeSkipWelcomeScreenOnLaunch:
      refreshUserSettingsBeforeSkipWelcomeScreenOnLaunchMock,
    runFaAction: runFaActionMock,
    setFantasiaStorybookCanvasFlag: vi.fn(),
    shouldRunStartupUpdateCheck: shouldRunStartupUpdateCheckMock,
    tryRunSkipWelcomeScreenOnLaunch: tryRunSkipWelcomeScreenOnLaunchMock,
    waitForSkipWelcomeScreenBridgeWhenElectron: waitForSkipWelcomeScreenBridgeWhenElectronMock
  })
}

beforeEach(() => {
  runFaActionMock.mockReset()
  tryRunSkipWelcomeScreenOnLaunchMock.mockReset()
  tryRunSkipWelcomeScreenOnLaunchMock.mockResolvedValue(false)
  getPlaywrightTestEnvMock.mockReset()
  getPlaywrightTestEnvMock.mockResolvedValue(undefined)
  shouldRunStartupUpdateCheckMock.mockReset()
  shouldRunStartupUpdateCheckMock.mockReturnValue(true)
  markWelcomeScreenAutoLoadBootAttemptedMock.mockReset()
  markWelcomeScreenAutoLoadBootCompletionMock.mockReset()
})

/**
 * runAppStartupRouting
 * Fires tips and startup update check on the welcome path.
 */
test('Test that runAppStartupRouting fires tips and startup update check', async () => {
  const api = buildApi()
  const routerPushMock = vi.fn()

  await api.runAppStartupRouting({ push: routerPushMock }, undefined, undefined)
  await vi.waitFor(() => {
    expect(runFaActionMock).toHaveBeenCalledWith('showStartupTipsNotification', undefined)
  })
  await vi.waitFor(() => {
    expect(runFaActionMock).toHaveBeenCalledWith('checkForAppUpdates', { source: 'startup' })
  })
})

/**
 * runAppStartupRouting
 * Still fires update check when skip-welcome succeeds.
 */
test('Test that runAppStartupRouting fires update check when skip welcome succeeds', async () => {
  tryRunSkipWelcomeScreenOnLaunchMock.mockResolvedValueOnce(true)
  const api = buildApi()

  await api.runAppStartupRouting({ push: vi.fn() }, undefined, undefined)
  await vi.waitFor(() => {
    expect(runFaActionMock).toHaveBeenCalledWith('checkForAppUpdates', { source: 'startup' })
  })
  expect(runFaActionMock).not.toHaveBeenCalledWith('showStartupTipsNotification', undefined)
})

/**
 * runAppStartupRouting
 * Skips automatic update check under Playwright e2e TEST_ENV.
 */
test('Test that runAppStartupRouting skips update check for e2e TEST_ENV', async () => {
  getPlaywrightTestEnvMock.mockResolvedValueOnce('e2e')
  const api = buildApi()

  await api.runAppStartupRouting({ push: vi.fn() }, undefined, undefined)
  await vi.waitFor(() => {
    expect(runFaActionMock).toHaveBeenCalledWith('showStartupTipsNotification', undefined)
  })
  expect(runFaActionMock).not.toHaveBeenCalledWith('checkForAppUpdates', { source: 'startup' })
})

/**
 * runAppStartupRouting
 * Skips automatic update check under Playwright components TEST_ENV.
 */
test('Test that runAppStartupRouting skips update check for components TEST_ENV', async () => {
  getPlaywrightTestEnvMock.mockResolvedValueOnce('components')
  const api = buildApi()

  await api.runAppStartupRouting({ push: vi.fn() }, undefined, undefined)
  await vi.waitFor(() => {
    expect(runFaActionMock).toHaveBeenCalledWith('showStartupTipsNotification', undefined)
  })
  expect(runFaActionMock).not.toHaveBeenCalledWith('checkForAppUpdates', { source: 'startup' })
})

/**
 * runAppStartupRouting
 * Skips automatic update check when disableStartUpdateCheckMessage is on.
 */
test('Test that runAppStartupRouting skips update check when disableStartUpdateCheckMessage is on', async () => {
  shouldRunStartupUpdateCheckMock.mockReturnValueOnce(false)
  const api = buildApi()

  await api.runAppStartupRouting({ push: vi.fn() }, undefined, undefined)
  await vi.waitFor(() => {
    expect(runFaActionMock).toHaveBeenCalledWith('showStartupTipsNotification', undefined)
  })
  expect(runFaActionMock).not.toHaveBeenCalledWith('checkForAppUpdates', { source: 'startup' })
})
