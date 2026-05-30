import type {
  I_vueRouter,
  I_vueRouterCreateOptions,
  RouterHistory,
  T_vueRouterHistoryFactory,
  T_vueRouterRouteRecords
} from 'app/types/I_vueRouterShims'

export function createFantasiaArchiveRouter (deps: {
  createMemoryHistory: T_vueRouterHistoryFactory
  createWebHashHistory: T_vueRouterHistoryFactory
  createWebHistory: T_vueRouterHistoryFactory
  createRouter: (options: I_vueRouterCreateOptions) => I_vueRouter
  resolveRouterHistoryMode: (
    hasServer: boolean,
    vueRouterMode: string | undefined
  ) => 'hash' | 'history' | 'memory'
  routes: T_vueRouterRouteRecords
  getServer: () => boolean
  getVueRouterMode: () => string | undefined
  getVueRouterBase: () => string | undefined
}): I_vueRouter {
  const historyMode = deps.resolveRouterHistoryMode(
    deps.getServer(),
    deps.getVueRouterMode()
  )

  const createHistory = historyMode === 'memory'
    ? deps.createMemoryHistory
    : (historyMode === 'history' ? deps.createWebHistory : deps.createWebHashHistory)

  return deps.createRouter({
    history: createHistory(deps.getVueRouterBase()) as RouterHistory,
    routes: deps.routes,
    scrollBehavior: () => ({
      left: 0,
      top: 0
    })
  })
}
