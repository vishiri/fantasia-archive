import type { I_ref } from 'app/types/I_vueCompositionShims'
import type {
  StoreGeneric,
  T_piniaStoreToRefs
} from 'app/types/I_vuePiniaInjected'

import type {
  T_splashPageSkipWelcomeScreenDeps,
  T_splashPageSkipWelcomeScreenWatchStop
} from 'app/types/I_splashPageSkipWelcomeScreen'

export function createSplashPage (deps: {
  FA_USER_SETTINGS_DEFAULTS: {
    hideWelcomeScreenSocials: boolean
    skipWelcomeScreen: boolean
  }
  S_FaUserSettings: () => StoreGeneric
  bindSplashPageSkipWelcomeScreenLifecycle: (
    resolveSkipWelcomeScreenEnabled: () => boolean,
    resolveSkipWelcomeScreenSetting: () => boolean | undefined,
    lifecycleDeps: T_splashPageSkipWelcomeScreenDeps
  ) => T_splashPageSkipWelcomeScreenWatchStop
  computed: <T>(getter: () => T) => I_ref<T>
  hasWelcomeScreenAutoLoadBootBeenAttempted: () => boolean
  onMounted: (hook: () => void) => void
  resolveFaAppRouterCurrentPath: () => string
  runSkipWelcomeScreenRedirect: () => Promise<boolean>
  storeToRefs: T_piniaStoreToRefs
  watch: (
    source: () => boolean | undefined,
    listener: (next: boolean | undefined, previous: boolean | undefined) => void
  ) => () => void
}): {
    useSplashPage: () => { hideWelcomeScreenSocials: I_ref<boolean> }
  } {
  function useSplashPage () {
    const faUserSettingsStore = deps.S_FaUserSettings()
    const { settings } = deps.storeToRefs(faUserSettingsStore)!

    const hideWelcomeScreenSocials = deps.computed(() => {
      return settings!.value?.hideWelcomeScreenSocials ??
        deps.FA_USER_SETTINGS_DEFAULTS.hideWelcomeScreenSocials
    })

    const resolveSkipWelcomeScreenEnabled = (): boolean => {
      return settings!.value?.skipWelcomeScreen ??
        deps.FA_USER_SETTINGS_DEFAULTS.skipWelcomeScreen
    }

    deps.bindSplashPageSkipWelcomeScreenLifecycle(
      resolveSkipWelcomeScreenEnabled,
      () => settings!.value?.skipWelcomeScreen,
      {
        getCurrentPath: deps.resolveFaAppRouterCurrentPath,
        hasWelcomeScreenAutoLoadBootBeenAttempted: deps.hasWelcomeScreenAutoLoadBootBeenAttempted,
        onMounted: deps.onMounted,
        runSkipWelcomeScreenRedirect: deps.runSkipWelcomeScreenRedirect,
        watchSkipSetting: deps.watch
      }
    )

    return {
      hideWelcomeScreenSocials
    }
  }

  return {
    useSplashPage
  }
}
