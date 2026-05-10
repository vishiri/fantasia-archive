import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'

import type {
  I_faAppStylingPatch,
  I_faAppStylingRoot
} from 'app/types/I_faAppStylingDomain'
import {
  faAppStylingPersistPartialSilent,
  faAppStylingRefreshFromBridge,
  faAppStylingUpdateWithUserNotify
} from 'app/src/stores/scripts/sFaAppStylingBridge'

/**
 * Manages persisted user CSS sourced from the Electron main process via the IPC bridge.
 * Loads once on app start; saves go through 'updateAppStyling' which mirrors the new value back into the reactive 'css' ref so any listener (for example _FaUserCssInjector) can react.
 *
 * 'cssLivePreview' overrides 'css' for the injected '#faUserCss' node while the app styling editor is open so edits preview live; it is cleared on save or when discarding edits (after refresh from disk).
 */
export const S_FaAppStyling = defineStore('S_FaAppStyling', () => {
  const root: Ref<I_faAppStylingRoot | null> = ref(null)
  const css: Ref<string> = ref('')
  const cssLivePreview: Ref<string | null> = ref(null)

  function setRoot (next: I_faAppStylingRoot): void {
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
   * @returns true when the bridge returned a root and 'setRoot' ran; false when the API is missing or the read failed.
   */
  async function refreshAppStyling (): Promise<boolean> {
    return faAppStylingRefreshFromBridge({ setRoot })
  }

  /**
   * Writes a partial patch (for example floating window frame only) without success Notify; syncs 'root' after a successful read-back.
   */
  async function persistAppStylingPartialSilent (patch: I_faAppStylingPatch): Promise<void> {
    await faAppStylingPersistPartialSilent({
      patch,
      setRoot
    })
  }

  async function updateAppStyling (patch: I_faAppStylingPatch): Promise<boolean> {
    return faAppStylingUpdateWithUserNotify({
      cssLivePreview,
      patch,
      setRoot
    })
  }

  const clearCssLivePreviewOut = clearCssLivePreview
  const persistAppStylingPartialSilentOut = persistAppStylingPartialSilent
  const refreshAppStylingOut = refreshAppStyling
  const setCssLivePreviewOut = setCssLivePreview
  const updateAppStylingOut = updateAppStyling

  return {
    clearCssLivePreview: clearCssLivePreviewOut,
    css,
    cssLivePreview,
    persistAppStylingPartialSilent: persistAppStylingPartialSilentOut,
    refreshAppStyling: refreshAppStylingOut,
    root,
    setCssLivePreview: setCssLivePreviewOut,
    updateAppStyling: updateAppStylingOut
  }
})
