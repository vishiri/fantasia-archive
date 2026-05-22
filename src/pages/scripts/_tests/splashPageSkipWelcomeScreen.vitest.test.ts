import { beforeEach, expect, test, vi } from 'vitest'
import { ref } from 'vue'

const runSkipWelcomeScreenRedirectMock = vi.hoisted(() => {
  return vi.fn()
})

const hasWelcomeScreenAutoLoadBootBeenAttemptedMock = vi.hoisted(() => {
  return vi.fn()
})

const resolveFaAppRouterCurrentPathMock = vi.hoisted(() => {
  return vi.fn()
})

vi.mock('app/src/scripts/appInternals/faAppStartupSkipWelcomeScreen', () => {
  return {
    runSkipWelcomeScreenRedirect: runSkipWelcomeScreenRedirectMock
  }
})

vi.mock('app/src/scripts/projectManagement/faWelcomeScreenAutoLoadSession', () => {
  return {
    hasWelcomeScreenAutoLoadBootBeenAttempted: hasWelcomeScreenAutoLoadBootBeenAttemptedMock
  }
})

vi.mock('app/src/scripts/appInternals/faAppRouterSession', () => {
  return {
    resolveFaAppRouterCurrentPath: resolveFaAppRouterCurrentPathMock
  }
})

import { bindSplashPageSkipWelcomeScreenLifecycle, maybeRunSkipWelcomeScreenFromWelcomeRoute } from '../splashPageSkipWelcomeScreen'

beforeEach(() => {
  runSkipWelcomeScreenRedirectMock.mockReset()
  runSkipWelcomeScreenRedirectMock.mockResolvedValue(true)
  hasWelcomeScreenAutoLoadBootBeenAttemptedMock.mockReset()
  hasWelcomeScreenAutoLoadBootBeenAttemptedMock.mockReturnValue(false)
  resolveFaAppRouterCurrentPathMock.mockReset()
  resolveFaAppRouterCurrentPathMock.mockReturnValue('/')
})

/**
 * maybeRunSkipWelcomeScreenFromWelcomeRoute
 * Skips redirect when the current route is not the welcome path.
 */
test('Test that maybeRunSkipWelcomeScreenFromWelcomeRoute does nothing off the welcome route', async () => {
  resolveFaAppRouterCurrentPathMock.mockReturnValue('/home')

  await maybeRunSkipWelcomeScreenFromWelcomeRoute()

  expect(runSkipWelcomeScreenRedirectMock).not.toHaveBeenCalled()
})

/**
 * maybeRunSkipWelcomeScreenFromWelcomeRoute
 * Invokes skip redirect on the welcome route.
 */
test('Test that maybeRunSkipWelcomeScreenFromWelcomeRoute runs skip redirect on welcome route', async () => {
  await maybeRunSkipWelcomeScreenFromWelcomeRoute()

  expect(runSkipWelcomeScreenRedirectMock).toHaveBeenCalledTimes(1)
})

/**
 * bindSplashPageSkipWelcomeScreenLifecycle
 * Skips mount-time redirect when boot already attempted welcome auto-load.
 */
test('Test that bindSplashPageSkipWelcomeScreenLifecycle does not redirect on mount after boot auto-load', async () => {
  hasWelcomeScreenAutoLoadBootBeenAttemptedMock.mockReturnValue(true)
  const enabledRef = ref(true)

  bindSplashPageSkipWelcomeScreenLifecycle(
    () => {
      return enabledRef.value
    },
    () => {
      return enabledRef.value
    }
  )

  await Promise.resolve()
  await Promise.resolve()

  expect(runSkipWelcomeScreenRedirectMock).not.toHaveBeenCalled()
})

/**
 * bindSplashPageSkipWelcomeScreenLifecycle
 * Skips watcher redirect when settings hydrate skip on after boot already attempted auto-load.
 */
test('Test that bindSplashPageSkipWelcomeScreenLifecycle ignores settings hydration after boot auto-load', async () => {
  hasWelcomeScreenAutoLoadBootBeenAttemptedMock.mockReturnValue(true)
  const settingRef = ref<boolean | undefined>(undefined)

  bindSplashPageSkipWelcomeScreenLifecycle(
    () => {
      return settingRef.value === true
    },
    () => {
      return settingRef.value
    }
  )

  settingRef.value = true
  await Promise.resolve()
  await Promise.resolve()

  expect(runSkipWelcomeScreenRedirectMock).not.toHaveBeenCalled()
})

/**
 * bindSplashPageSkipWelcomeScreenLifecycle
 * Watcher runs skip redirect when skipWelcomeScreen flips on while mounted.
 */
test('Test that bindSplashPageSkipWelcomeScreenLifecycle redirects when skipWelcomeScreen turns on', async () => {
  const enabledRef = ref(false)

  bindSplashPageSkipWelcomeScreenLifecycle(
    () => {
      return enabledRef.value
    },
    () => {
      return enabledRef.value
    }
  )

  enabledRef.value = true
  await Promise.resolve()
  await Promise.resolve()

  expect(runSkipWelcomeScreenRedirectMock).toHaveBeenCalled()
})
