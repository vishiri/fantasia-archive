/**
 * Dynamic import breaks the static cycle: rendererAppInternals -> skip welcome -> welcome auto-load -> app router.
 */
export async function tryRunSkipWelcomeScreenOnLaunch (): Promise<boolean> {
  const { tryRunSkipWelcomeScreenOnLaunch: runSkipWelcomeScreenOnLaunch } =
    await import('./faAppStartupSkipWelcomeScreen_manager')
  return runSkipWelcomeScreenOnLaunch()
}
