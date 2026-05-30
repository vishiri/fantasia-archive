import { defineStore } from 'pinia'
import { ResultAsync } from 'neverthrow'
import { ref } from 'vue'

import type { Ref } from 'vue'

import type {
  I_faProjectNoteboardPatch,
  I_faProjectNoteboardRoot
} from 'app/types/I_faProjectNoteboardDomain'
import { i18n } from 'app/i18n/externalFileLoader'

import { mergeProjectNoteboardRootAfterSilentPersist } from './functions/faProjectNoteboardPersistMerge'

/**
 * Per-project noteboard: text plus floating-window open flag, persisted in the active project's SQLite KV.
 */
export const S_FaProjectNoteboard = defineStore('S_FaProjectNoteboard', () => {
  const root: Ref<I_faProjectNoteboardRoot | null> = ref(null)
  const text: Ref<string> = ref('')
  const isWindowOpen: Ref<boolean> = ref(false)

  function applyRoot (next: I_faProjectNoteboardRoot): void {
    root.value = next
    text.value = next.text
  }

  /**
   * @returns true when the bridge returned a root and 'applyRoot' ran; false when the API is missing or the read failed.
   */
  async function refreshProjectNoteboard (): Promise<boolean> {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (typeof api?.getProjectNoteboard !== 'function') {
      return false
    }
    const readResult = await ResultAsync.fromPromise(
      api.getProjectNoteboard(),
      (error): unknown => error
    )
    if (readResult.isErr()) {
      console.error('[S_FaProjectNoteboard] getProjectNoteboard failed', readResult.error)
      return false
    }
    applyRoot(readResult.value)
    return true
  }

  /**
   * Writes a partial patch (text and/or frame) without success Notify; syncs 'root' after a successful read-back.
   * When the patch omits 'text', the post-save read-back still merges the in-memory textarea value because frame-only saves can race ahead of debounced text persistence; otherwise SQLite could still hold empty text and applyRoot would wipe the draft on screen.
   */
  async function persistProjectNoteboardPartialSilent (
    patch: I_faProjectNoteboardPatch
  ): Promise<void> {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (typeof api?.setProjectNoteboard !== 'function') {
      throw new Error(i18n.global.t('globalFunctionality.faProjectNoteboard.bridgeMissing'))
    }

    const textSnapshotBeforePersist = text.value

    const writeResult = await ResultAsync.fromPromise(
      api.setProjectNoteboard(patch),
      (error): unknown => error
    )
    if (writeResult.isErr()) {
      const error = writeResult.error
      console.error('[S_FaProjectNoteboard] setProjectNoteboard (silent partial) failed', error)
      throw error instanceof Error ? error : new Error(String(error))
    }
    if (!writeResult.value) {
      return
    }

    const afterSaveResult = await ResultAsync.fromPromise(
      api.getProjectNoteboard(),
      (error): unknown => error
    )
    if (afterSaveResult.isErr()) {
      const error = afterSaveResult.error
      console.error('[S_FaProjectNoteboard] getProjectNoteboard after silent partial failed', error)
      throw error instanceof Error ? error : new Error(String(error))
    }
    applyRoot(mergeProjectNoteboardRootAfterSilentPersist(
      afterSaveResult.value,
      patch,
      textSnapshotBeforePersist
    ))
  }

  async function persistCurrentTextSilent (): Promise<void> {
    await persistProjectNoteboardPartialSilent({ text: text.value })
  }

  function setWindowOpen (open: boolean): void {
    isWindowOpen.value = open
  }

  const applyRootOut = applyRoot
  const isWindowOpenOut = isWindowOpen
  const persistCurrentTextSilentOut = persistCurrentTextSilent
  const persistProjectNoteboardPartialSilentOut = persistProjectNoteboardPartialSilent
  const refreshProjectNoteboardOut = refreshProjectNoteboard
  const rootOut = root
  const setWindowOpenOut = setWindowOpen
  const textOut = text

  return {
    applyRoot: applyRootOut,
    isWindowOpen: isWindowOpenOut,
    persistCurrentTextSilent: persistCurrentTextSilentOut,
    persistProjectNoteboardPartialSilent: persistProjectNoteboardPartialSilentOut,
    refreshProjectNoteboard: refreshProjectNoteboardOut,
    root: rootOut,
    setWindowOpen: setWindowOpenOut,
    text: textOut
  }
})
