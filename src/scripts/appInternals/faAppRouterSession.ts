import type { I_appStartupRouter } from 'app/types/I_appStartupRouter'

import { isFantasiaStorybookCanvas } from 'app/src/scripts/appInternals/rendererAppInternals'

const FA_WELCOME_ROUTE_PATH = '/'
const FA_WORKSPACE_ROUTE_PATH = '/home'
const FA_COMPONENT_TESTING_ROUTE_PREFIX = '/componentTesting/'

let faAppRouterSession: I_appStartupRouter | null = null

/**
 * True when the path is the Playwright/component-harness layout (must not auto-navigate to workspace).
 */
export function isFaComponentTestingRoutePath (path: string): boolean {
  return path === '/componentTesting' || path.startsWith(FA_COMPONENT_TESTING_ROUTE_PREFIX)
}

/**
 * Registers the live Vue Router instance for session navigation from Pinia stores and action handlers.
 */
export function registerFaAppRouterSession (router: I_appStartupRouter): void {
  faAppRouterSession = router
}

/**
 * Resolves the current route path when a router session is registered; otherwise assumes the welcome route.
 */
export function resolveFaAppRouterCurrentPath (): string {
  const path = faAppRouterSession?.getCurrentPath?.()
  if (typeof path === 'string' && path.length > 0) {
    return path
  }
  return FA_WELCOME_ROUTE_PATH
}

/**
 * Navigates to the workspace route when a project session becomes active, except on component-testing routes.
 */
export async function navigateToWorkspaceRouteForActiveProject (): Promise<void> {
  if (isFantasiaStorybookCanvas()) {
    return
  }

  const router = faAppRouterSession
  if (router === null) {
    return
  }

  const currentPath = resolveFaAppRouterCurrentPath()
  if (currentPath === FA_WORKSPACE_ROUTE_PATH) {
    return
  }
  if (isFaComponentTestingRoutePath(currentPath)) {
    return
  }

  await router.push({ path: FA_WORKSPACE_ROUTE_PATH })
}

/**
 * @deprecated Prefer navigateToWorkspaceRouteForActiveProject; kept for boot registration smoke tests.
 */
export async function navigateToWorkspaceWhenOnWelcomeRoute (): Promise<void> {
  await navigateToWorkspaceRouteForActiveProject()
}
