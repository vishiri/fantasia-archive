import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'

import routes from '../routes'
import { createFantasiaArchiveRouter as buildFantasiaArchiveRouter } from './functions/createFantasiaArchiveRouter'
import { resolveRouterHistoryMode } from './functions/routerHistoryMode'

export const createFantasiaArchiveRouter = buildFantasiaArchiveRouter({
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  getServer: () => Boolean(process.env.SERVER),
  getVueRouterBase: () => process.env.VUE_ROUTER_BASE,
  getVueRouterMode: () => process.env.VUE_ROUTER_MODE,
  resolveRouterHistoryMode,
  routes
})
