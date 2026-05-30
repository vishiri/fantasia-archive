import {
  onMounted,
  watch
} from 'vue'
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

import {
  bindSplashPageSkipWelcomeScreenLifecycle,
  maybeRunSkipWelcomeScreenFromWelcomeRouteWithDeps
} from '../functions/splashPageSkipWelcomeScreen'

const splashSkipDeps = {
  getCurrentPath: resolveFaAppRouterCurrentPathMock,
  runSkipWelcomeScreenRedirect: runSkipWelcomeScreenRedirectMock,
  hasWelcomeScreenAutoLoadBootBeenAttempted: hasWelcomeScreenAutoLoadBootBeenAttemptedMock,
  onMounted,
  watchSkipSetting: watch
}

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

  await maybeRunSkipWelcomeScreenFromWelcomeRouteWithDeps(splashSkipDeps)

  expect(runSkipWelcomeScreenRedirectMock).not.toHaveBeenCalled()
})

/**
 * maybeRunSkipWelcomeScreenFromWelcomeRoute
 * Invokes skip redirect on the welcome route.
 */
test('Test that maybeRunSkipWelcomeScreenFromWelcomeRoute runs skip redirect on welcome route', async () => {
  await maybeRunSkipWelcomeScreenFromWelcomeRouteWithDeps(splashSkipDeps)

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
    },
    splashSkipDeps
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
    },
    splashSkipDeps
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
    },
    splashSkipDeps
  )

  enabledRef.value = true
  await Promise.resolve()
  await Promise.resolve()

  expect(runSkipWelcomeScreenRedirectMock).toHaveBeenCalled()
})
