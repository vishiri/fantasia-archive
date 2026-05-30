export type T_splashPageSkipWelcomeScreenWatchStop = () => void

export type T_splashPageSkipWelcomeScreenDeps = {
  getCurrentPath: () => string
  runSkipWelcomeScreenRedirect: () => Promise<boolean>
  hasWelcomeScreenAutoLoadBootBeenAttempted: () => boolean
  onMounted: (hook: () => void) => void
  watchSkipSetting: (
    resolveSkipWelcomeScreenSetting: () => boolean | undefined,
    listener: (enabled: boolean | undefined, previous: boolean | undefined) => void
  ) => T_splashPageSkipWelcomeScreenWatchStop
}
