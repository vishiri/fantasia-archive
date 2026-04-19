import { Notify } from 'quasar'

import type { I_faActionFailureLog, I_faActionQueueEntry } from 'app/types/I_faActionManagerDomain'
import { i18n } from 'app/i18n/externalFileLoader'

import { resolveFaActionManagerStore } from './faActionManagerStoreBridge'

/**
 * JSON-safe stringification of arbitrary action payloads.
 * Cycles or non-serializable values fall back to '[unserializable]'.
 * Overlong values are truncated to keep console + monitor rows readable.
 */
export function buildFaActionPayloadPreview (payload: unknown, maxLength = 400): string {
  if (payload === undefined) {
    return ''
  }
  let serialized: string
  try {
    serialized = JSON.stringify(payload)
  } catch {
    return '[unserializable]'
  }
  if (serialized === undefined) {
    return ''
  }
  if (serialized.length <= maxLength) {
    return serialized
  }
  return `${serialized.slice(0, maxLength)}...`
}

/**
 * Normalizes an unknown thrown value (Error, string, anything) into a structured shape used in logs and notifications.
 */
export function normalizeFaActionError (error: unknown): { name: string, message: string, stack?: string } {
  if (error instanceof Error) {
    const result: { name: string, message: string, stack?: string } = {
      message: error.message,
      name: error.name
    }
    if (typeof error.stack === 'string') {
      result.stack = error.stack
    }
    return result
  }
  if (typeof error === 'string') {
    const message = error
    return {
      message,
      name: 'Error'
    }
  }
  const message = String(error)
  return {
    message,
    name: 'Error'
  }
}

/**
 * Single-source unified failure surface: one console.error and one Notify.create per failed action.
 * Returns the structured failure record so callers may also write it to the Pinia store.
 */
export function reportFaActionFailure (
  entry: I_faActionQueueEntry,
  error: unknown
): I_faActionFailureLog {
  const normalized = normalizeFaActionError(error)
  const payloadPreview = buildFaActionPayloadPreview(entry.payload)

  console.error('[faActionManager]', {
    error: normalized,
    id: entry.id,
    kind: entry.kind,
    payload: payloadPreview === '' ? undefined : payloadPreview,
    uid: entry.uid
  })

  Notify.create({
    actions: [{
      color: 'white',
      icon: 'mdi-close'
    }],
    caption: normalized.message,
    group: false,
    message: i18n.global.t('globalFunctionality.faActionManager.actionFailed', {
      actionId: entry.id
    }),
    timeout: 6000,
    type: 'negative'
  })

  const failure: I_faActionFailureLog = {
    errorMessage: normalized.message,
    errorName: normalized.name,
    failedAt: Date.now(),
    id: entry.id,
    kind: entry.kind,
    payloadPreview,
    uid: entry.uid
  }

  const store = resolveFaActionManagerStore()
  if (store !== null) {
    store.recordFailure(failure)
  }

  return failure
}
