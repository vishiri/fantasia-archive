import { defineStore } from 'pinia'
import { ResultAsync } from 'neverthrow'
import { ref } from 'vue'

import type { Ref } from 'vue'

import type {
  I_faProjectNoteboardPatch,
  I_faProjectNoteboardRoot
} from 'app/types/I_faProjectNoteboardDomain'
import { i18n } from 'app/i18n/externalFileLoader'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

import {
  mergeNoteboardRootKeepingTextTypedDuringRead,
  mergeProjectNoteboardRootAfterSilentPersist
} from './functions/faProjectNoteboardPersistMerge'

/**
 * Per-project noteboard: text plus floating-window open flag, persisted in the active project's SQLite KV.
 */
export const S_FaProjectNoteboard = defineStore('S_FaProjectNoteboard', () => {
  const root: Ref<I_faProjectNoteboardRoot | null> = ref(null)
  const text: Ref<string> = ref('')
  const isWindowOpen: Ref<boolean> = ref(false)
  let projectNoteboardIoTail: Promise<void> = Promise.resolve()

  function enqueueProjectNoteboardIo<T> (work: () => Promise<T>): Promise<T> {
    const run = projectNoteboardIoTail.then(work)
    projectNoteboardIoTail = run.then(
      () => undefined,
      () => undefined
    )
    return run
  }

  function applyRoot (next: I_faProjectNoteboardRoot): void {
    root.value = next
    text.value = next.text
  }

  /**
   * @returns true when the bridge returned a root and 'applyRoot' ran; false when the API is missing or the read failed.
   */
  async function loadProjectNoteboardFromBridge (): Promise<boolean> {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (typeof api?.getProjectNoteboard !== 'function') {
      return false
    }
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    const textAtStart = text.value
    const readResult = await ResultAsync.fromPromise(
      api.getProjectNoteboard(),
      (error): unknown => error
    )
    if (S_FaActiveProject().readProjectContentEpoch() !== epochAtStart) {
      return false
    }
    if (readResult.isErr()) {
      console.error('[S_FaProjectNoteboard] getProjectNoteboard failed', readResult.error)
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

  async function refreshProjectNoteboard (): Promise<boolean> {
    return await enqueueProjectNoteboardIo(loadProjectNoteboardFromBridge)
  }

  function projectNoteboardEpochMoved (epochAtStart: number): boolean {
    return S_FaActiveProject().readProjectContentEpoch() !== epochAtStart
  }

  /**
   * Writes a partial patch (text and/or frame) without success Notify; syncs 'root' after a successful read-back.
   * When the patch omits 'text', the post-save read-back keeps the textarea value from after the round trip so keystrokes during the write are not replaced by the pre-save snapshot.
   */
  async function writeProjectNoteboardPartial (
    patch: I_faProjectNoteboardPatch,
    epochAtStart: number
  ): Promise<void> {
    const textAtStart = text.value
    const api = window.faContentBridgeAPIs?.projectManagement
    if (typeof api?.setProjectNoteboard !== 'function') {
      throw new Error(i18n.global.t('globalFunctionality.faProjectNoteboard.bridgeMissing'))
    }
    if (projectNoteboardEpochMoved(epochAtStart)) {
      return
    }

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
    if (projectNoteboardEpochMoved(epochAtStart)) {
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
    if (projectNoteboardEpochMoved(epochAtStart)) {
      return
    }
    const currentText = text.value
    applyRoot(mergeProjectNoteboardRootAfterSilentPersist(
      afterSaveResult.value,
      patch,
      currentText,
      textAtStart
    ))
  }

  async function persistProjectNoteboardPartialSilent (
    patch: I_faProjectNoteboardPatch
  ): Promise<void> {
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    await enqueueProjectNoteboardIo(() => writeProjectNoteboardPartial(patch, epochAtStart))
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
