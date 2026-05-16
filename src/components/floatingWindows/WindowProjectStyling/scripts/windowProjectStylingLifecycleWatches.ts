import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'

import {
  clearProjectStylingLivePreviewAndRefreshFromKv,
  refreshPersistedProjectStylingAndCloseWindow
} from 'app/src/components/floatingWindows/WindowProjectStyling/scripts/windowProjectStylingStateSideEffects'
import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'
import { scheduleFaFloatingWindowDelayedHide } from 'app/src/scripts/floatingWindows/faFloatingWindowScheduleDelayedHide'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

export interface I_registerProjectStylingWindowModelDeps {
  clearLivePreview: () => void
  hideAfterTransitionId: Ref<number | null>
  onWindowHide: () => void
  onWindowShow: () => Promise<void>
  windowModel: Ref<boolean>
}

export function registerProjectStylingWindowModelWatch (
  deps: I_registerProjectStylingWindowModelDeps
): void {
  watch(deps.windowModel, async (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) {
      if (deps.hideAfterTransitionId.value !== null) {
        clearTimeout(deps.hideAfterTransitionId.value)
        deps.hideAfterTransitionId.value = null
      }
      await nextTick()
      await deps.onWindowShow()
    }
    if (!isOpen && wasOpen) {
      deps.clearLivePreview()
      deps.hideAfterTransitionId.value = scheduleFaFloatingWindowDelayedHide(
        deps.hideAfterTransitionId.value,
        FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS,
        () => {
          deps.hideAfterTransitionId.value = null
          deps.onWindowHide()
        }
      )
    }
  })
}

export function registerProjectStylingUnmount (deps: {
  hideAfterTransitionId: Ref<number | null>
  onHardHide: () => void
  windowModel: Ref<boolean>
}): void {
  onBeforeUnmount(() => {
    if (deps.hideAfterTransitionId.value !== null) {
      clearTimeout(deps.hideAfterTransitionId.value)
      deps.hideAfterTransitionId.value = null
    }
    clearProjectStylingLivePreviewAndRefreshFromKv(deps.windowModel)
    deps.onHardHide()
  })
}

export function registerProjectStylingActiveProjectWatch (windowModel: Ref<boolean>): void {
  watch(
    () => S_FaActiveProject().activeProject?.id ?? '',
    async (_nextId: string, prevId: string | undefined): Promise<void> => {
      if (!windowModel.value) {
        return
      }
      const hadPrior = typeof prevId === 'string' && prevId.length > 0
      const switchedAway = prevId !== _nextId
      if (hadPrior && switchedAway) {
        await refreshPersistedProjectStylingAndCloseWindow(windowModel)
      }
    }
  )
}
