import type {
  T_splashPageSkipWelcomeScreenDeps,
  T_splashPageSkipWelcomeScreenWatchStop
} from 'app/types/I_splashPageSkipWelcomeScreen'

const FA_WELCOME_ROUTE_PATH = '/'

/**
 * On splash mount (only when boot did not already run skip) and when skipWelcomeScreen turns on, redirect off the welcome screen into the workspace shell.
 */
export function bindSplashPageSkipWelcomeScreenLifecycle (
  resolveSkipWelcomeScreenEnabled: () => boolean,
  resolveSkipWelcomeScreenSetting: () => boolean | undefined,
  deps: T_splashPageSkipWelcomeScreenDeps
): T_splashPageSkipWelcomeScreenWatchStop {
  async function maybeRunSkipWelcomeScreenFromWelcomeRoute (): Promise<void> {
    if (deps.getCurrentPath() !== FA_WELCOME_ROUTE_PATH) {
      return
    }

    await deps.runSkipWelcomeScreenRedirect()
  }

  deps.onMounted(() => {
    if (resolveSkipWelcomeScreenEnabled() !== true) {
      return
    }
    if (deps.hasWelcomeScreenAutoLoadBootBeenAttempted()) {
      return
    }

    void maybeRunSkipWelcomeScreenFromWelcomeRoute()
  })

  return deps.watchSkipSetting(resolveSkipWelcomeScreenSetting, (enabled, previous) => {
    if (enabled !== true || previous === true) {
      return
    }
    // Pinia settings hydrate after boot already tried skip — do not auto-load the next MRU row.
    if (deps.hasWelcomeScreenAutoLoadBootBeenAttempted() && previous === undefined) {
      return
    }

    void maybeRunSkipWelcomeScreenFromWelcomeRoute()
  })
}

export async function maybeRunSkipWelcomeScreenFromWelcomeRouteWithDeps (
  deps: Pick<T_splashPageSkipWelcomeScreenDeps, 'getCurrentPath' | 'runSkipWelcomeScreenRedirect'>
): Promise<void> {
  if (deps.getCurrentPath() !== FA_WELCOME_ROUTE_PATH) {
    return
  }

  await deps.runSkipWelcomeScreenRedirect()
}
