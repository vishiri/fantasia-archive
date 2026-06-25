import type { I_faAppStylingStylingWindowStore } from 'app/types/I_faStylingWindowStoreFacade'
import type { Ref } from 'app/types/I_vueCompositionRefs'

export function createClearAppStylingLivePreviewAndRefreshFromDisk (deps: {
  getFaAppStylingStore: () => I_faAppStylingStylingWindowStore
}): (windowModel: Ref<boolean>) => void {
  return function clearAppStylingLivePreviewAndRefreshFromDisk (windowModel: Ref<boolean>): void {
    const st = deps.getFaAppStylingStore()
    if (!windowModel.value && st.cssLivePreview === null) {
      return
    }
    st.clearCssLivePreview()
    void st.refreshAppStyling()
  }
}

export function createRefreshPersistedAppStylingAndCloseWindow (deps: {
  getFaAppStylingStore: () => I_faAppStylingStylingWindowStore
}): (windowModel: Ref<boolean>) => Promise<void> {
  return async function refreshPersistedAppStylingAndCloseWindow (
    windowModel: Ref<boolean>
  ): Promise<void> {
    const st = deps.getFaAppStylingStore()
    const ok = await st.refreshAppStyling()
    if (!ok) {
      return
    }
    st.clearCssLivePreview()
    windowModel.value = false
  }
}
