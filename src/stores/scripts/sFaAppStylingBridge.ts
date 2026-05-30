import { Notify } from 'quasar'
import { ResultAsync } from 'neverthrow'
import type { Ref } from 'vue'

import type {
  I_faAppStylingPatch,
  I_faAppStylingRoot
} from 'app/types/I_faAppStylingDomain'
import { i18n } from 'app/i18n/externalFileLoader'

import { didCssPatchPersist } from '../functions/faPersistPatchVerify'

export async function faAppStylingRefreshFromBridge (opts: {
  setRoot: (next: I_faAppStylingRoot) => void
}): Promise<boolean> {
  const api = window.faContentBridgeAPIs?.faAppStyling
  if (typeof api?.getAppStyling !== 'function') {
    return false
  }
  const readResult = await ResultAsync.fromPromise(
    api.getAppStyling(),
    (error): unknown => error
  )
  if (readResult.isErr()) {
    const error = readResult.error
    console.error('[S_FaAppStyling] getAppStyling failed', error)
    throw new Error(i18n.global.t('globalFunctionality.faAppStyling.loadError'))
  }
  opts.setRoot(readResult.value)
  return true
}

export async function faAppStylingPersistPartialSilent (opts: {
  patch: I_faAppStylingPatch
  setRoot: (next: I_faAppStylingRoot) => void
}): Promise<void> {
  const api = window.faContentBridgeAPIs?.faAppStyling
  if (typeof api?.setAppStyling !== 'function') {
    throw new Error(i18n.global.t('globalFunctionality.faAppStyling.loadError'))
  }

  const writeResult = await ResultAsync.fromPromise(
    api.setAppStyling(opts.patch),
    (error): unknown => error
  )
  if (writeResult.isErr()) {
    const error = writeResult.error
    console.error('[S_FaAppStyling] setAppStyling (silent partial) failed', error)
    throw error instanceof Error ? error : new Error(String(error))
  }

  const afterSaveResult = await ResultAsync.fromPromise(
    api.getAppStyling(),
    (error): unknown => error
  )
  if (afterSaveResult.isErr()) {
    const error = afterSaveResult.error
    console.error('[S_FaAppStyling] getAppStyling after silent partial failed', error)
    throw error instanceof Error ? error : new Error(String(error))
  }
  opts.setRoot(afterSaveResult.value)
}

export async function faAppStylingUpdateWithUserNotify (opts: {
  cssLivePreview: Ref<string | null>
  patch: I_faAppStylingPatch
  setRoot: (next: I_faAppStylingRoot) => void
}): Promise<boolean> {
  if (typeof opts.patch.css !== 'string') {
    throw new Error(i18n.global.t('globalFunctionality.faAppStyling.saveMissingCss'))
  }

  const api = window.faContentBridgeAPIs?.faAppStyling
  if (typeof api?.setAppStyling !== 'function') {
    return false
  }

  const writeResult = await ResultAsync.fromPromise(
    api.setAppStyling(opts.patch),
    (error): unknown => error
  )
  if (writeResult.isErr()) {
    const error = writeResult.error
    console.error('[S_FaAppStyling] setAppStyling failed', error)
    throw error instanceof Error ? error : new Error(String(error))
  }

  const afterSaveResult = await ResultAsync.fromPromise(
    api.getAppStyling(),
    (error): unknown => error
  )
  if (afterSaveResult.isErr()) {
    const error = afterSaveResult.error
    console.error('[S_FaAppStyling] getAppStyling after save failed', error)
    throw error instanceof Error ? error : new Error(String(error))
  }
  const retrieved = afterSaveResult.value

  if (!didCssPatchPersist(opts.patch.css, retrieved.css)) {
    console.error(`[S_FaAppStyling] ${i18n.global.t('globalFunctionality.faAppStyling.saveMismatchLog')}`, {
      patch: opts.patch,
      retrieved
    })
    throw new Error(i18n.global.t('globalFunctionality.faAppStyling.saveError'))
  }

  opts.setRoot(retrieved)

  opts.cssLivePreview.value = null

  Notify.create({
    group: false,
    message: i18n.global.t('globalFunctionality.faAppStyling.saveSuccess'),
    type: 'positive'
  })
  return true
}
