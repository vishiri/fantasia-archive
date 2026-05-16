import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'

import type { I_faProjectStylingPatch, I_faProjectStylingRoot } from 'app/types/I_faProjectStylingDomain'

import {
  faProjectStylingPersistPartialSilent,
  faProjectStylingRefreshFromBridge,
  faProjectStylingSaveCssFromEditor
} from './scripts/sFaProjectStylingBridge'

/**
 * Active-project Custom CSS mirrored from SQLite KV; live preview overlays '#faProjectUserCss' while the project styling window edits.
 */
export const S_FaProjectStyling = defineStore('S_FaProjectStyling', () => {
  const root: Ref<I_faProjectStylingRoot | null> = ref(null)
  const css: Ref<string> = ref('')
  const cssLivePreview: Ref<string | null> = ref(null)

  function applyRoot (next: I_faProjectStylingRoot): void {
    root.value = next
    css.value = next.css
  }

  function setCssLivePreview (text: string): void {
    cssLivePreview.value = text
  }

  function clearCssLivePreview (): void {
    cssLivePreview.value = null
  }

  /**
   * @returns false when preload bridge misses 'getProjectStyling'.
   */
  async function refreshProjectStyling (): Promise<boolean> {
    return faProjectStylingRefreshFromBridge({ applyRoot })
  }

  /**
   * KV partial write mirroring the project noteboard race merge pattern for frame-only commits.
   */
  async function persistProjectStylingPartialSilent (
    patch: I_faProjectStylingPatch
  ): Promise<void> {
    const cssSnapshotBeforePersist = css.value
    await faProjectStylingPersistPartialSilent({
      applyRoot,
      cssSnapshotBeforePersist,
      patch
    })
  }

  async function persistCurrentCssSilent (): Promise<void> {
    await persistProjectStylingPartialSilent({ css: css.value })
  }

  /**
   * @returns false when preload APIs are unavailable; otherwise throws on KV mismatch paths like app-wide styling mismatch handling.
   */
  async function savePersistedCssFromEditor (cssValue: string): Promise<boolean> {
    return faProjectStylingSaveCssFromEditor({
      applyRoot,
      clearCssLivePreview,
      css: cssValue
    })
  }

  const applyRootBinding = applyRoot
  const clearCssLivePreviewBinding = clearCssLivePreview
  const persistCurrentCssSilentBinding = persistCurrentCssSilent
  const persistProjectStylingPartialSilentBinding = persistProjectStylingPartialSilent
  const refreshProjectStylingBinding = refreshProjectStyling
  const savePersistedCssFromEditorBinding = savePersistedCssFromEditor
  const setCssLivePreviewBinding = setCssLivePreview

  return {
    applyRoot: applyRootBinding,
    clearCssLivePreview: clearCssLivePreviewBinding,
    css,
    cssLivePreview,
    persistCurrentCssSilent: persistCurrentCssSilentBinding,
    persistProjectStylingPartialSilent: persistProjectStylingPartialSilentBinding,
    refreshProjectStyling: refreshProjectStylingBinding,
    root,
    savePersistedCssFromEditor: savePersistedCssFromEditorBinding,
    setCssLivePreview: setCssLivePreviewBinding
  }
})
