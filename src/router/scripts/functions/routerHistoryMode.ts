import type { T_routerHistoryMode } from 'app/types/T_routerHistoryMode'

/**
 * Chooses vue-router history implementation for the current build target.
 */
export function resolveRouterHistoryMode (
  isServer: boolean,
  vueRouterMode: string | undefined
): T_routerHistoryMode {
  if (isServer) {
    return 'memory'
  }

  if (vueRouterMode === 'history') {
    return 'history'
  }

  return 'hash'
}
