import { Notify } from 'quasar'

import type { I_faActionDefinition, I_faActionQueueEntry, T_faActionId } from 'app/types/I_faActionManagerDomain'
import { i18n } from 'app/i18n/externalFileLoader'

import {
  recordHistoryCompleted,
  recordHistoryOverflowDrop,
  recordHistoryStarted
} from './faActionManagerHistory'
import { reportFaActionFailure } from './faActionManagerErrorReporting'
import { resolveFaActionManagerStore } from './faActionManagerStoreBridge'

/**
 * Per-action timeout ceiling (ms). On expiry the action is reported as a failure and the queue advances.
 */
export const FA_ACTION_SYNC_TIMEOUT_MS = 30_000

/**
 * Soft cap on the pending sync queue length. Overflow drops are reported but never thrown.
 */
export const FA_ACTION_SYNC_QUEUE_MAX = 32

let isDraining = false
const drainCompletionWaiters: Array<() => void> = []

function notifyOverflow (entry: I_faActionQueueEntry): void {
  Notify.create({
    actions: [{
      color: 'white',
      icon: 'mdi-close'
    }],
    caption: entry.id,
    group: false,
    message: i18n.global.t('globalFunctionality.faActionManager.queueOverflow'),
    timeout: 6000,
    type: 'negative'
  })
}

function flushDrainCompletionWaiters (): void {
  const pending = drainCompletionWaiters.splice(0, drainCompletionWaiters.length)
  for (const waiter of pending) {
    waiter()
  }
}

function buildTimeoutError (): Error {
  return new Error(i18n.global.t('globalFunctionality.faActionManager.actionTimedOut'))
}

function runHandlerWithTimeout (
  definition: I_faActionDefinition<T_faActionId>,
  entry: I_faActionQueueEntry
): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false
    const timer = setTimeout(() => {
      if (settled) {
        return
      }
      settled = true
      reject(buildTimeoutError())
    }, FA_ACTION_SYNC_TIMEOUT_MS)
    const finish = (errorOrNull: unknown): void => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timer)
      if (errorOrNull === null) {
        resolve()
      } else {
        reject(errorOrNull)
      }
    }
    let outcome: void | Promise<void>
    try {
      outcome = (definition.handler as (payload: unknown) => void | Promise<void>)(entry.payload)
    } catch (immediateError) {
      finish(immediateError)
      return
    }
    if (outcome instanceof Promise) {
      outcome.then(() => finish(null)).catch((error: unknown) => finish(error))
      return
    }
    finish(null)
  })
}

async function executeSyncEntry (
  definition: I_faActionDefinition<T_faActionId>,
  entry: I_faActionQueueEntry
): Promise<void> {
  const store = resolveFaActionManagerStore()
  store?.setCurrent(entry)
  recordHistoryStarted(entry.uid, Date.now())
  try {
    await runHandlerWithTimeout(definition, entry)
    recordHistoryCompleted(entry.uid, { kind: 'success' }, Date.now())
  } catch (error) {
    const failure = reportFaActionFailure(entry, error)
    recordHistoryCompleted(
      entry.uid,
      {
        errorMessage: failure.errorMessage,
        kind: 'failed'
      },
      Date.now()
    )
  } finally {
    store?.setCurrent(null)
  }
}

async function processNextSyncAction (
  definitionLookup: (id: T_faActionId) => I_faActionDefinition<T_faActionId> | undefined
): Promise<void> {
  const store = resolveFaActionManagerStore()
  if (store === null) {
    isDraining = false
    flushDrainCompletionWaiters()
    return
  }
  const next = store.popSync()
  if (next === null) {
    isDraining = false
    flushDrainCompletionWaiters()
    return
  }
  const definition = definitionLookup(next.id)
  if (definition === undefined) {
    reportFaActionFailure(next, new Error(`Unknown action id: ${String(next.id)}`))
    void processNextSyncAction(definitionLookup)
    return
  }
  await executeSyncEntry(definition, next)
  void processNextSyncAction(definitionLookup)
}

/**
 * Returns 'true' when the entry was accepted into the queue, 'false' on dedup or overflow drop.
 * Starts draining if no other drain pass is active.
 */
export function enqueueSyncAction (
  entry: I_faActionQueueEntry,
  definition: I_faActionDefinition<T_faActionId>,
  definitionLookup: (id: T_faActionId) => I_faActionDefinition<T_faActionId> | undefined
): boolean {
  const store = resolveFaActionManagerStore()
  if (store === null) {
    return false
  }
  if (definition.dedup === true) {
    const sameInQueue = store.pendingSyncQueue.some((row) => row.id === entry.id)
    const sameRunning = store.currentSyncAction?.id === entry.id
    if (sameInQueue || sameRunning) {
      return false
    }
  }
  if (store.pendingSyncQueue.length >= FA_ACTION_SYNC_QUEUE_MAX) {
    const errorMessage = i18n.global.t('globalFunctionality.faActionManager.queueOverflow')
    notifyOverflow(entry)
    recordHistoryOverflowDrop(entry, errorMessage)
    console.error('[faActionManager] queue overflow', {
      droppedEntry: entry,
      queueLength: store.pendingSyncQueue.length
    })
    return false
  }
  store.pushSync(entry)
  if (!isDraining) {
    isDraining = true
    void processNextSyncAction(definitionLookup)
  }
  return true
}

/**
 * Resolves once the sync queue is fully drained (no current action and no pending entries).
 * Resolves immediately if the queue is already idle.
 */
export function awaitSyncQueueDrain (): Promise<void> {
  const store = resolveFaActionManagerStore()
  if (store === null) {
    return Promise.resolve()
  }
  if (!isDraining && store.pendingSyncQueue.length === 0 && store.currentSyncAction === null) {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    drainCompletionWaiters.push(resolve)
  })
}

/**
 * Test-only reset hook. Production code never calls this; specs use it between cases.
 */
export function _resetFaActionSyncQueueForTests (): void {
  isDraining = false
  drainCompletionWaiters.length = 0
}
