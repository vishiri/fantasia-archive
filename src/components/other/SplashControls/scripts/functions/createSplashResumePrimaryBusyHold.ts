import type { I_ref } from 'app/types/I_vueCompositionShims'

/** Hold splash resume primary label + disable while project open/reroute settles. */
export const SPLASH_RESUME_PRIMARY_BUSY_HOLD_MS = 4000

type T_splashResumePrimaryLabelKey =
  'splashPage.resumeCurrentProject' | 'splashPage.resumeLatestProject'

type T_createSplashResumePrimaryBusyHoldDeps = {
  clearTimeout: (id: number) => void
  ref: <T>(value: T) => I_ref<T>
  resumePrimaryBusyHoldMs: number
  setTimeout: (handler: () => void, timeout: number) => number
}

export function resolveSplashResumePrimaryLabelKey (
  activeProject: { filePath?: string } | null
): T_splashResumePrimaryLabelKey {
  if (activeProject !== null) {
    return 'splashPage.resumeCurrentProject'
  }
  return 'splashPage.resumeLatestProject'
}

export function createSplashResumePrimaryBusyHold (
  deps: T_createSplashResumePrimaryBusyHoldDeps
): {
    beginResumePrimaryBusyHold: (activeProject: { filePath?: string } | null) => void
    clearResumePrimaryBusyTimer: () => void
    resumePrimaryBusy: I_ref<boolean>
    resumePrimaryLabelHoldKey: I_ref<T_splashResumePrimaryLabelKey | null>
  } {
  const resumePrimaryBusy = deps.ref(false)
  const resumePrimaryLabelHoldKey = deps.ref<T_splashResumePrimaryLabelKey | null>(null)
  let resumePrimaryBusyTimerId: number | null = null

  const clearResumePrimaryBusyTimer = (): void => {
    if (resumePrimaryBusyTimerId === null) {
      return
    }
    deps.clearTimeout(resumePrimaryBusyTimerId)
    resumePrimaryBusyTimerId = null
  }

  const endResumePrimaryBusyHold = (): void => {
    resumePrimaryBusyTimerId = null
    resumePrimaryBusy.value = false
    resumePrimaryLabelHoldKey.value = null
  }

  const beginResumePrimaryBusyHold = (
    activeProject: { filePath?: string } | null
  ): void => {
    clearResumePrimaryBusyTimer()
    resumePrimaryLabelHoldKey.value = resolveSplashResumePrimaryLabelKey(activeProject)
    resumePrimaryBusy.value = true
    resumePrimaryBusyTimerId = deps.setTimeout(() => {
      endResumePrimaryBusyHold()
    }, deps.resumePrimaryBusyHoldMs)
  }

  return {
    beginResumePrimaryBusyHold,
    clearResumePrimaryBusyTimer,
    resumePrimaryBusy,
    resumePrimaryLabelHoldKey
  }
}
