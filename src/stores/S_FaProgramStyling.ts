import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { ref } from 'vue'
import { ResultAsync } from 'neverthrow'

import type { Ref } from 'vue'

import type {
  I_faProgramStylingPatch,
  I_faProgramStylingRoot
} from 'app/types/I_faProgramStylingDomain'
import { i18n } from 'app/i18n/externalFileLoader'

/**
 * Manages persisted user CSS sourced from the Electron main process via the IPC bridge.
 * Loads once on app start; saves go through 'updateProgramStyling' which mirrors the new value back into the reactive 'css' ref so any listener (for example _FaUserCssInjector) can react.
 *
 * 'cssLivePreview' overrides 'css' for the injected '#faUserCss' node while the program styling editor is open so edits preview live; it is cleared on save or when discarding edits (after refresh from disk).
 */
export const S_FaProgramStyling = defineStore('S_FaProgramStyling', () => {
  const root: Ref<I_faProgramStylingRoot | null> = ref(null)
  const css: Ref<string> = ref('')
  const cssLivePreview: Ref<string | null> = ref(null)

  function setRoot (next: I_faProgramStylingRoot): void {
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
  async function refreshProgramStyling (): Promise<boolean> {
    const api = window.faContentBridgeAPIs?.faProgramStyling
    if (typeof api?.getProgramStyling !== 'function') {
      return false
    }
    const readResult = await ResultAsync.fromPromise(
      api.getProgramStyling(),
      (error): unknown => error
    )
    if (readResult.isErr()) {
      const error = readResult.error
      console.error('[S_FaProgramStyling] getProgramStyling failed', error)
      Notify.create({
        group: false,
        message: i18n.global.t('globalFunctionality.faProgramStyling.loadError'),
        timeout: 0,
        type: 'negative'
      })
      return false
    }
    setRoot(readResult.value)
    return true
  }

  async function updateProgramStyling (patch: I_faProgramStylingPatch): Promise<boolean> {
    const api = window.faContentBridgeAPIs?.faProgramStyling
    if (typeof api?.setProgramStyling !== 'function') {
      return false
    }

    const writeResult = await ResultAsync.fromPromise(
      api.setProgramStyling(patch),
      (error): unknown => error
    )
    if (writeResult.isErr()) {
      const error = writeResult.error
      // Error toast handled by the action manager's unified failure reporter; only the bridge log stays here.
      console.error('[S_FaProgramStyling] setProgramStyling failed', error)
      throw error instanceof Error ? error : new Error(String(error))
    }

    const afterSaveResult = await ResultAsync.fromPromise(
      api.getProgramStyling(),
      (error): unknown => error
    )
    if (afterSaveResult.isErr()) {
      const error = afterSaveResult.error
      console.error('[S_FaProgramStyling] getProgramStyling after save failed', error)
      throw error instanceof Error ? error : new Error(String(error))
    }
    const retrieved = afterSaveResult.value

    if (retrieved.css !== patch.css) {
      console.error(`[S_FaProgramStyling] ${i18n.global.t('globalFunctionality.faProgramStyling.saveMismatchLog')}`, {
        patch,
        retrieved
      })
      // Keep 'cssLivePreview' so '#faUserCss' still reflects the open editor until the user fixes or discards.
      throw new Error(i18n.global.t('globalFunctionality.faProgramStyling.saveError'))
    }

    setRoot(retrieved)

    cssLivePreview.value = null

    Notify.create({
      group: false,
      message: i18n.global.t('globalFunctionality.faProgramStyling.saveSuccess'),
      type: 'positive'
    })
    return true
  }

  return {
    clearCssLivePreview,
    css,
    cssLivePreview,
    refreshProgramStyling,
    root,
    setCssLivePreview,
    updateProgramStyling
  }
})
