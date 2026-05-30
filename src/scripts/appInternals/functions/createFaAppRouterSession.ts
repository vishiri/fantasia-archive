import type { I_appStartupRouter } from 'app/types/I_appStartupRouter'

export function createFaAppRouterSession (deps: {
  isFantasiaStorybookCanvas: () => boolean
}): {
    isFaComponentTestingRoutePath: (path: string) => boolean
    registerFaAppRouterSession: (router: I_appStartupRouter) => void
    resolveFaAppRouterCurrentPath: () => string
    navigateToWorkspaceRouteForActiveProject: () => Promise<void>
    navigateToWorkspaceWhenOnWelcomeRoute: () => Promise<void>
  } {
  const FA_WELCOME_ROUTE_PATH = '/'
  const FA_WORKSPACE_ROUTE_PATH = '/home'
  const FA_COMPONENT_TESTING_ROUTE_PREFIX = '/componentTesting/'

  let faAppRouterSession: I_appStartupRouter | null = null

  const isFaComponentTestingRoutePath = (path: string): boolean => {
    return path === '/componentTesting' || path.startsWith(FA_COMPONENT_TESTING_ROUTE_PREFIX)
  }

  const registerFaAppRouterSession = (router: I_appStartupRouter): void => {
    faAppRouterSession = router
  }

  const resolveFaAppRouterCurrentPath = (): string => {
    const path = faAppRouterSession?.getCurrentPath?.()
    if (typeof path === 'string' && path.length > 0) {
      return path
    }
    return FA_WELCOME_ROUTE_PATH
  }

  const navigateToWorkspaceRouteForActiveProject = async (): Promise<void> => {
    if (deps.isFantasiaStorybookCanvas()) {
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

  const navigateToWorkspaceWhenOnWelcomeRoute = async (): Promise<void> => {
    await navigateToWorkspaceRouteForActiveProject()
  }

  return {
    isFaComponentTestingRoutePath,
    registerFaAppRouterSession,
    resolveFaAppRouterCurrentPath,
    navigateToWorkspaceRouteForActiveProject,
    navigateToWorkspaceWhenOnWelcomeRoute
  }
}
