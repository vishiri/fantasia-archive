import { isFantasiaStorybookCanvas } from './rendererAppInternals_manager'
import { createFaAppRouterSession } from './functions/createFaAppRouterSession'

const faAppRouterSessionApi = createFaAppRouterSession({
  isFantasiaStorybookCanvas
})

export const isFaComponentTestingRoutePath = faAppRouterSessionApi.isFaComponentTestingRoutePath

export const registerFaAppRouterSession = faAppRouterSessionApi.registerFaAppRouterSession

export const resolveFaAppRouterCurrentPath = faAppRouterSessionApi.resolveFaAppRouterCurrentPath

export const navigateToWorkspaceRouteForActiveProject =
  faAppRouterSessionApi.navigateToWorkspaceRouteForActiveProject

export const navigateToWorkspaceWhenOnWelcomeRoute =
  faAppRouterSessionApi.navigateToWorkspaceWhenOnWelcomeRoute
