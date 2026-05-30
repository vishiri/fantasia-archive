import { afterEach, expect, test, vi } from 'vitest'

import {
  isFaComponentTestingRoutePath,
  navigateToWorkspaceRouteForActiveProject,
  navigateToWorkspaceWhenOnWelcomeRoute,
  registerFaAppRouterSession,
  resolveFaAppRouterCurrentPath
} from 'app/src/scripts/appInternals/appInternals_manager'
import { setFantasiaStorybookCanvasFlag } from 'app/src/scripts/appInternals/appInternals_manager'

const routerPushMock = vi.fn()
let faVitestRouterPath = '/'

afterEach(() => {
  setFantasiaStorybookCanvasFlag(false)
})

/**
 * faAppRouterSession
 * navigateToWorkspaceRouteForActiveProject pushes /home from welcome.
 */
test('Test that navigateToWorkspaceRouteForActiveProject pushes home from welcome route', async () => {
  faVitestRouterPath = '/'
  routerPushMock.mockReset()
  registerFaAppRouterSession({
    getCurrentPath (): string {
      return faVitestRouterPath
    },
    push (payload): void {
      faVitestRouterPath = payload.path
      routerPushMock(payload)
    }
  })

  await navigateToWorkspaceRouteForActiveProject()

  expect(routerPushMock).toHaveBeenCalledWith({ path: '/home' })
})

/**
 * faAppRouterSession
 * navigateToWorkspaceRouteForActiveProject pushes home from an unknown route (404 catch-all).
 */
test('Test that navigateToWorkspaceRouteForActiveProject pushes home from a catch-all route', async () => {
  faVitestRouterPath = '/this-route-does-not-exist'
  routerPushMock.mockReset()
  registerFaAppRouterSession({
    getCurrentPath (): string {
      return faVitestRouterPath
    },
    push (payload): void {
      faVitestRouterPath = payload.path
      routerPushMock(payload)
    }
  })

  await navigateToWorkspaceRouteForActiveProject()

  expect(routerPushMock).toHaveBeenCalledWith({ path: '/home' })
})

/**
 * faAppRouterSession
 * navigateToWorkspaceRouteForActiveProject is a no-op when already on /home.
 */
test('Test that navigateToWorkspaceRouteForActiveProject skips push when already on home', async () => {
  faVitestRouterPath = '/home'
  routerPushMock.mockReset()
  registerFaAppRouterSession({
    getCurrentPath (): string {
      return faVitestRouterPath
    },
    push (payload): void {
      faVitestRouterPath = payload.path
      routerPushMock(payload)
    }
  })

  await navigateToWorkspaceRouteForActiveProject()

  expect(routerPushMock).not.toHaveBeenCalled()
})

/**
 * faAppRouterSession
 * resolveFaAppRouterCurrentPath falls back to welcome when router is not registered.
 */
test('Test that resolveFaAppRouterCurrentPath returns welcome without a registered router', () => {
  registerFaAppRouterSession({
    getCurrentPath (): string {
      return ''
    },
    push (): void {
      // no-op
    }
  })
  expect(resolveFaAppRouterCurrentPath()).toBe('/')
})

/**
 * faAppRouterSession
 * isFaComponentTestingRoutePath matches harness routes only.
 */
test('Test that isFaComponentTestingRoutePath matches component testing paths', () => {
  expect(isFaComponentTestingRoutePath('/componentTesting')).toBe(true)
  expect(isFaComponentTestingRoutePath('/componentTesting/FantasiaMascotImage')).toBe(true)
  expect(isFaComponentTestingRoutePath('/')).toBe(false)
  expect(isFaComponentTestingRoutePath('/home')).toBe(false)
  expect(isFaComponentTestingRoutePath('/unknown')).toBe(false)
})

/**
 * faAppRouterSession
 * navigateToWorkspaceRouteForActiveProject skips push on component testing routes.
 */
test('Test that navigateToWorkspaceRouteForActiveProject skips push on component testing route', async () => {
  faVitestRouterPath = '/componentTesting/FantasiaMascotImage'
  routerPushMock.mockReset()
  registerFaAppRouterSession({
    getCurrentPath (): string {
      return faVitestRouterPath
    },
    push (payload): void {
      faVitestRouterPath = payload.path
      routerPushMock(payload)
    }
  })

  await navigateToWorkspaceRouteForActiveProject()

  expect(routerPushMock).not.toHaveBeenCalled()
})

/**
 * faAppRouterSession
 * navigateToWorkspaceWhenOnWelcomeRoute delegates to workspace navigation from welcome.
 */
test('Test that navigateToWorkspaceWhenOnWelcomeRoute pushes home from welcome route', async () => {
  faVitestRouterPath = '/'
  routerPushMock.mockReset()
  registerFaAppRouterSession({
    getCurrentPath (): string {
      return faVitestRouterPath
    },
    push (payload): void {
      faVitestRouterPath = payload.path
      routerPushMock(payload)
    }
  })

  await navigateToWorkspaceWhenOnWelcomeRoute()

  expect(routerPushMock).toHaveBeenCalledWith({ path: '/home' })
})

/**
 * faAppRouterSession
 * Navigation helpers no-op in Storybook canvas mode.
 */
test('Test that navigateToWorkspaceRouteForActiveProject skips push in Storybook canvas', async () => {
  setFantasiaStorybookCanvasFlag(true)
  faVitestRouterPath = '/'
  routerPushMock.mockReset()
  registerFaAppRouterSession({
    getCurrentPath (): string {
      return faVitestRouterPath
    },
    push (payload): void {
      routerPushMock(payload)
    }
  })

  await navigateToWorkspaceRouteForActiveProject()

  expect(routerPushMock).not.toHaveBeenCalled()
})

/**
 * faAppRouterSession
 * navigateToWorkspaceWhenOnWelcomeRoute skips push in Storybook canvas mode.
 */
test('Test that navigateToWorkspaceWhenOnWelcomeRoute skips push in Storybook canvas', async () => {
  setFantasiaStorybookCanvasFlag(true)
  faVitestRouterPath = '/'
  routerPushMock.mockReset()
  registerFaAppRouterSession({
    getCurrentPath (): string {
      return faVitestRouterPath
    },
    push (payload): void {
      routerPushMock(payload)
    }
  })

  await navigateToWorkspaceWhenOnWelcomeRoute()

  expect(routerPushMock).not.toHaveBeenCalled()
})

/**
 * faAppRouterSession
 * navigateToWorkspaceRouteForActiveProject no-ops when no router session is registered.
 */
test('Test that navigateToWorkspaceRouteForActiveProject no-ops without a registered router', async () => {
  vi.resetModules()
  const mod = await import('app/src/scripts/appInternals/appInternals_manager')
  await mod.navigateToWorkspaceRouteForActiveProject()
})
