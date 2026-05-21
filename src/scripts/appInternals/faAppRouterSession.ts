import type { I_appStartupRouter } from 'app/types/I_appStartupRouter'

import { isFantasiaStorybookCanvas } from 'app/src/scripts/appInternals/rendererAppInternals'

const FA_WELCOME_ROUTE_PATH = '/'
const FA_WORKSPACE_ROUTE_PATH = '/home'

let faAppRouterSession: I_appStartupRouter | null = null

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
 * Moves from the welcome page to the workspace route when a project session becomes active on '/'.
 */
export async function navigateToWorkspaceWhenOnWelcomeRoute (): Promise<void> {
  if (isFantasiaStorybookCanvas()) {
    return
  }

  const router = faAppRouterSession
  if (router === null) {
    return
  }

  if (resolveFaAppRouterCurrentPath() !== FA_WELCOME_ROUTE_PATH) {
    return
  }

  await router.push({ path: FA_WORKSPACE_ROUTE_PATH })
}

/**
 * Navigates to the workspace route whenever a project is already active but the user is not on '/home' yet.
 */
export async function navigateToWorkspaceRouteForActiveProject (): Promise<void> {
  if (isFantasiaStorybookCanvas()) {
    return
  }

  const router = faAppRouterSession
  if (router === null) {
    return
  }

  if (resolveFaAppRouterCurrentPath() === FA_WORKSPACE_ROUTE_PATH) {
    return
  }

  await router.push({ path: FA_WORKSPACE_ROUTE_PATH })
}
