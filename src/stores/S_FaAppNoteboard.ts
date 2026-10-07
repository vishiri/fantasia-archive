import { defineStore } from 'pinia'
import { ResultAsync } from 'neverthrow'
import { ref } from 'vue'

import type { Ref } from 'vue'

import type {
  I_faAppNoteboardPatch,
  I_faAppNoteboardRoot
} from 'app/types/I_faAppNoteboardDomain'
import { i18n } from 'app/i18n/externalFileLoader'
import {
  mergeNoteboardRootKeepingTextTypedDuringRead,
  mergeProjectNoteboardRootAfterSilentPersist
} from 'app/src/stores/functions/faProjectNoteboardPersistMerge'

/**
 * Instance-wide app noteboard: text + floating window open state, persisted via the desktop bridge.
 */
export const S_FaAppNoteboard = defineStore('S_FaAppNoteboard', () => {
  const root: Ref<I_faAppNoteboardRoot | null> = ref(null)
  const text: Ref<string> = ref('')
  const isWindowOpen: Ref<boolean> = ref(false)
  let noteboardIoTail: Promise<void> = Promise.resolve()

  function enqueueNoteboardIo<T> (work: () => Promise<T>): Promise<T> {
    const run = noteboardIoTail.then(work)
    noteboardIoTail = run.then(
      () => undefined,
      () => undefined
    )
    return run
  }

  function applyRoot (next: I_faAppNoteboardRoot): void {
    root.value = next
    text.value = next.text
  }

  /**
   * @returns true when the bridge returned a root and 'applyRoot' ran; false when the API is missing or the read failed.
   */
  async function loadNoteboardFromBridge (): Promise<boolean> {
    const api = window.faContentBridgeAPIs?.faAppNoteboard
    if (typeof api?.getNoteboard !== 'function') {
      return false
    }
    const textAtStart = text.value
    const readResult = await ResultAsync.fromPromise(
      api.getNoteboard(),
      (error): unknown => error
    )
    if (readResult.isErr()) {
      console.error('[S_FaAppNoteboard] getNoteboard failed', readResult.error)
      return false
    }
    const loadedRoot = mergeNoteboardRootKeepingTextTypedDuringRead(
      readResult.value,
      text.value,
      textAtStart
    )
    applyRoot(loadedRoot)
    return true
  }

  async function refreshNoteboard (): Promise<boolean> {
    return await enqueueNoteboardIo(loadNoteboardFromBridge)
  }

  /**
   * Writes a partial patch (text and/or frame) without success Notify; syncs 'root' after a successful read-back.
   * When the patch omits 'text', the post-save read-back keeps the textarea value from after the round trip so keystrokes during the write are not replaced by the pre-save snapshot.
   */
  async function writeNoteboardPartial (patch: I_faAppNoteboardPatch): Promise<void> {
    const textAtStart = text.value
    const api = window.faContentBridgeAPIs?.faAppNoteboard
    if (typeof api?.setNoteboard !== 'function') {
      throw new Error(i18n.global.t('globalFunctionality.faAppNoteboard.bridgeMissing'))
    }

    const writeResult = await ResultAsync.fromPromise(
      api.setNoteboard(patch),
      (error): unknown => error
    )
    if (writeResult.isErr()) {
      const error = writeResult.error
      console.error('[S_FaAppNoteboard] setNoteboard (silent partial) failed', error)
      throw error instanceof Error ? error : new Error(String(error))
    }

    const afterSaveResult = await ResultAsync.fromPromise(
      api.getNoteboard(),
      (error): unknown => error
    )
    if (afterSaveResult.isErr()) {
      const error = afterSaveResult.error
      console.error('[S_FaAppNoteboard] getNoteboard after silent partial failed', error)
      throw error instanceof Error ? error : new Error(String(error))
    }
    const currentText = text.value
    applyRoot(mergeProjectNoteboardRootAfterSilentPersist(
      afterSaveResult.value,
      patch,
      currentText,
      textAtStart
    ))
  }

  async function persistNoteboardPartialSilent (patch: I_faAppNoteboardPatch): Promise<void> {
    await enqueueNoteboardIo(() => writeNoteboardPartial(patch))
  }

  async function persistCurrentTextSilent (): Promise<void> {
    await persistNoteboardPartialSilent({ text: text.value })
  }

  function setWindowOpen (open: boolean): void {
    isWindowOpen.value = open
  }

  const applyRootOut = applyRoot
  const isWindowOpenOut = isWindowOpen
  const persistCurrentTextSilentOut = persistCurrentTextSilent
  const persistNoteboardPartialSilentOut = persistNoteboardPartialSilent
  const refreshNoteboardOut = refreshNoteboard
  const rootOut = root
  const setWindowOpenOut = setWindowOpen
  const textOut = text

  return {
    applyRoot: applyRootOut,
    isWindowOpen: isWindowOpenOut,
    persistCurrentTextSilent: persistCurrentTextSilentOut,
    persistNoteboardPartialSilent: persistNoteboardPartialSilentOut,
    refreshNoteboard: refreshNoteboardOut,
    root: rootOut,
    setWindowOpen: setWindowOpenOut,
    text: textOut
  }
})
