import { onMounted, watch, type WatchStopHandle } from 'vue'

import { resolveFaAppRouterCurrentPath } from 'app/src/scripts/appInternals/faAppRouterSession'
import { runSkipWelcomeScreenRedirect } from 'app/src/scripts/appInternals/faAppStartupSkipWelcomeScreen'
import { hasWelcomeScreenAutoLoadBootBeenAttempted } from 'app/src/scripts/projectManagement/faWelcomeScreenAutoLoadSession'

const FA_WELCOME_ROUTE_PATH = '/'

/**
 * Loads the latest project and leaves the welcome route when skipWelcomeScreen is on and a path is available.
 */
export async function maybeRunSkipWelcomeScreenFromWelcomeRoute (): Promise<void> {
  if (resolveFaAppRouterCurrentPath() !== FA_WELCOME_ROUTE_PATH) {
    return
  }

  await runSkipWelcomeScreenRedirect()
}

/**
 * On splash mount (only when boot did not already run skip) and when skipWelcomeScreen turns on, redirect off the welcome screen into the workspace shell.
 */
export function bindSplashPageSkipWelcomeScreenLifecycle (
  resolveSkipWelcomeScreenEnabled: () => boolean,
  resolveSkipWelcomeScreenSetting: () => boolean | undefined
): WatchStopHandle {
  onMounted(() => {
    if (resolveSkipWelcomeScreenEnabled() !== true) {
      return
    }
    if (hasWelcomeScreenAutoLoadBootBeenAttempted()) {
      return
    }

    void maybeRunSkipWelcomeScreenFromWelcomeRoute()
  })

  return watch(resolveSkipWelcomeScreenSetting, (enabled, previous) => {
    if (enabled !== true || previous === true) {
      return
    }
    // Pinia settings hydrate after boot already tried skip — do not auto-load the next MRU row.
    if (hasWelcomeScreenAutoLoadBootBeenAttempted() && previous === undefined) {
      return
    }

    void maybeRunSkipWelcomeScreenFromWelcomeRoute()
  })
}
