import type { Ref } from 'app/types/I_vueCompositionRefs'
import type { T_vueWatch } from 'app/types/I_vueWatchInjected'

interface I_registerStylingWindowModelWatchDeps {
  clearLivePreview: () => void
  hideAfterTransitionId: Ref<number | null> | { value: number | null }
  onWindowHide: () => void
  onWindowShow: () => Promise<void>
  windowModel: Ref<boolean>
}

export function createWindowStylingFrameLifecycle (deps: {
  FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS: number
  nextTick: (fn?: () => void | Promise<void>) => Promise<void>
  onBeforeUnmount: (hook: () => void) => void
  scheduleFaFloatingWindowDelayedHide: (
    existingId: number | null,
    ms: number,
    onHide: () => void
  ) => number
  watch: T_vueWatch
}): {
    registerStylingWindowModelWatch: (modelWatchDeps: I_registerStylingWindowModelWatchDeps) => void
    registerStylingUnmount: (unmountDeps: {
      clearLivePreviewAndRefresh: (windowModel: Ref<boolean>) => void
      hideAfterTransitionId: Ref<number | null> | { value: number | null }
      onHardHide: () => void
      windowModel: Ref<boolean>
    }) => void
  } {
  function registerStylingWindowModelWatch (
    modelWatchDeps: I_registerStylingWindowModelWatchDeps
  ): void {
    deps.watch(modelWatchDeps.windowModel, async (isOpen: boolean, wasOpen: boolean) => {
      if (isOpen && !wasOpen) {
        if (modelWatchDeps.hideAfterTransitionId.value !== null) {
          clearTimeout(modelWatchDeps.hideAfterTransitionId.value)
          modelWatchDeps.hideAfterTransitionId.value = null
        }
        await deps.nextTick()
        await modelWatchDeps.onWindowShow()
      }
      if (!isOpen && wasOpen) {
        modelWatchDeps.clearLivePreview()
        modelWatchDeps.hideAfterTransitionId.value = deps.scheduleFaFloatingWindowDelayedHide(
          modelWatchDeps.hideAfterTransitionId.value,
          deps.FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS,
          () => {
            modelWatchDeps.hideAfterTransitionId.value = null
            modelWatchDeps.onWindowHide()
          }
        )
      }
    })
  }

  function registerStylingUnmount (unmountDeps: {
    clearLivePreviewAndRefresh: (windowModel: Ref<boolean>) => void
    hideAfterTransitionId: Ref<number | null> | { value: number | null }
    onHardHide: () => void
    windowModel: Ref<boolean>
  }): void {
    deps.onBeforeUnmount(() => {
      if (unmountDeps.hideAfterTransitionId.value !== null) {
        clearTimeout(unmountDeps.hideAfterTransitionId.value)
        unmountDeps.hideAfterTransitionId.value = null
      }
      unmountDeps.clearLivePreviewAndRefresh(unmountDeps.windowModel)
      unmountDeps.onHardHide()
    })
  }

  const registerStylingWindowModelWatchOut = registerStylingWindowModelWatch
  const registerStylingUnmountOut = registerStylingUnmount

  return {
    registerStylingWindowModelWatch: registerStylingWindowModelWatchOut,
    registerStylingUnmount: registerStylingUnmountOut
  }
}
