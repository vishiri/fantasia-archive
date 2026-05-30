import type { RouteRecordRaw, Router, RouterHistory, RouterOptions } from 'vue-router'

/**
 * vue-router Router alias for level-1 factories (real Router type, imported only under types/).
 */
export type I_vueRouter = Router

export type I_vueRouterCreateOptions = RouterOptions

export type T_vueRouterRouteRecords = readonly RouteRecordRaw[]

export type { RouterHistory }

export type T_vueRouterHistoryFactory = (base?: string) => unknown
