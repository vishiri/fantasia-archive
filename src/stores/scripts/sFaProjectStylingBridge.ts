import { Notify } from 'quasar'
import { ResultAsync } from 'neverthrow'

import type { I_faProjectStylingPatch, I_faProjectStylingRoot } from 'app/types/I_faProjectStylingDomain'
import { i18n } from 'app/i18n/externalFileLoader'

import { didCssPatchPersist } from '../functions/faPersistPatchVerify'
import { mergeProjectStylingRootAfterSilentPersist } from '../functions/faProjectStylingPersistMerge'

/**
 * Hydrates reactive project CSS from SQLite via the preload bridge once a '.faproject' is active.
 */
export async function faProjectStylingRefreshFromBridge (opts: {
  applyRoot: (next: I_faProjectStylingRoot) => void
}): Promise<boolean> {
  const api = window.faContentBridgeAPIs?.projectManagement
  if (typeof api?.getProjectStyling !== 'function') {
    return false
  }
  const readResult = await ResultAsync.fromPromise(
    api.getProjectStyling(),
    (error): unknown => error
  )
  if (readResult.isErr()) {
    console.error('[S_FaProjectStyling] getProjectStyling failed', readResult.error)
    throw new Error(i18n.global.t('globalFunctionality.faProjectStyling.loadError'))
  }
  opts.applyRoot(readResult.value)
  return true
}

/**
 * SQLite-backed silent partial KV write with read-back, merging in-memory CSS when the caller omits it in 'patch'.
 */
export async function faProjectStylingPersistPartialSilent (opts: {
  applyRoot: (next: I_faProjectStylingRoot) => void
  cssSnapshotBeforePersist: string
  patch: I_faProjectStylingPatch
}): Promise<void> {
  const api = window.faContentBridgeAPIs?.projectManagement
  if (
    typeof api?.setProjectStyling !== 'function' ||
    typeof api?.getProjectStyling !== 'function'
  ) {
    throw new Error(i18n.global.t('globalFunctionality.faProjectStyling.bridgeMissing'))
  }

  const writeResult = await ResultAsync.fromPromise(
    api.setProjectStyling(opts.patch),
    (error): unknown => error
  )
  if (writeResult.isErr()) {
    const error = writeResult.error
    console.error('[S_FaProjectStyling] setProjectStyling (silent partial) failed', error)
    throw error instanceof Error ? error : new Error(String(error))
  }
  if (!writeResult.value) {
    return
  }

  const afterSaveResult = await ResultAsync.fromPromise(
    api.getProjectStyling(),
    (error): unknown => error
  )
  if (afterSaveResult.isErr()) {
    const error = afterSaveResult.error
    console.error('[S_FaProjectStyling] getProjectStyling after silent partial failed', error)
    throw error instanceof Error ? error : new Error(String(error))
  }
  opts.applyRoot(mergeProjectStylingRootAfterSilentPersist(
    afterSaveResult.value,
    opts.patch,
    opts.cssSnapshotBeforePersist
  ))
}

/**
 * Validates full CSS save writes, reloads KV, emits success Notify, clears live-preview.
 */
export async function faProjectStylingSaveCssFromEditor (opts: {
  applyRoot: (next: I_faProjectStylingRoot) => void
  clearCssLivePreview: () => void
  css: string
}): Promise<boolean> {
  const api = window.faContentBridgeAPIs?.projectManagement
  if (
    typeof api?.setProjectStyling !== 'function' ||
    typeof api?.getProjectStyling !== 'function'
  ) {
    return false
  }

  const patch: I_faProjectStylingPatch = {
    css: opts.css
  }

  const writeResult = await ResultAsync.fromPromise(
    api.setProjectStyling(patch),
    (error): unknown => error
  )
  if (writeResult.isErr()) {
    const error = writeResult.error
    console.error('[S_FaProjectStyling] setProjectStyling failed', error)
    throw error instanceof Error ? error : new Error(String(error))
  }
  if (!writeResult.value) {
    return false
  }

  const afterSaveResult = await ResultAsync.fromPromise(
    api.getProjectStyling(),
    (error): unknown => error
  )
  if (afterSaveResult.isErr()) {
    const error = afterSaveResult.error
    console.error('[S_FaProjectStyling] getProjectStyling after save failed', error)
    throw error instanceof Error ? error : new Error(String(error))
  }
  const retrieved = afterSaveResult.value

  if (!didCssPatchPersist(opts.css, retrieved.css)) {
    console.error(`[S_FaProjectStyling] ${i18n.global.t('globalFunctionality.faProjectStyling.saveMismatchLog')}`, {
      patch,
      retrieved
    })
    throw new Error(i18n.global.t('globalFunctionality.faProjectStyling.saveError'))
  }

  opts.applyRoot(retrieved)
  opts.clearCssLivePreview()

  Notify.create({
    group: false,
    message: i18n.global.t('globalFunctionality.faProjectStyling.saveSuccess'),
    type: 'positive'
  })
  return true
}
