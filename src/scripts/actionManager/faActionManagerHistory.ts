import type {
  I_faActionHistoryEntry,
  I_faActionQueueEntry
} from 'app/types/I_faActionManagerDomain'

import { buildFaActionPayloadPreview } from './faActionManagerErrorReporting'
import { resolveFaActionManagerStore } from './faActionManagerStoreBridge'

/**
 * Append a new history row in 'queued' state. Used for sync actions only;
 * async actions skip 'queued' and go straight to 'running' via 'recordHistoryStartedFromEntry'.
 */
export function recordHistoryEnqueued (entry: I_faActionQueueEntry): void {
  const store = resolveFaActionManagerStore()
  if (store === null) {
    return
  }
  const historyEntry: I_faActionHistoryEntry = {
    enqueuedAt: entry.enqueuedAt,
    id: entry.id,
    kind: entry.kind,
    status: 'queued',
    uid: entry.uid
  }
  const preview = buildFaActionPayloadPreview(entry.payload)
  if (preview !== '') {
    historyEntry.payloadPreview = preview
  }
  store.appendHistoryEntry(historyEntry)
}

/**
 * Patch an existing history row to 'running' and stamp 'startedAt'.
 */
export function recordHistoryStarted (uid: string, startedAt: number): void {
  const store = resolveFaActionManagerStore()
  if (store === null) {
    return
  }
  store.updateHistoryEntryStatus(uid, {
    startedAt,
    status: 'running'
  })
}

/**
 * Append a brand-new history row in 'running' state for fire-and-forget async actions
 * (which never go through the 'queued' transition).
 */
export function recordHistoryStartedFromEntry (entry: I_faActionQueueEntry, startedAt: number): void {
  const store = resolveFaActionManagerStore()
  if (store === null) {
    return
  }
  const historyEntry: I_faActionHistoryEntry = {
    enqueuedAt: entry.enqueuedAt,
    id: entry.id,
    kind: entry.kind,
    startedAt,
    status: 'running',
    uid: entry.uid
  }
  const preview = buildFaActionPayloadPreview(entry.payload)
  if (preview !== '') {
    historyEntry.payloadPreview = preview
  }
  store.appendHistoryEntry(historyEntry)
}

/**
 * Outcome of a finished action; success has no payload, failure carries an error message.
 */
export type T_faActionHistoryOutcome =
  | { kind: 'success' }
  | { kind: 'failed', errorMessage: string }

/**
 * Patch an existing history row to its terminal status and stamp 'finishedAt'.
 */
export function recordHistoryCompleted (
  uid: string,
  outcome: T_faActionHistoryOutcome,
  finishedAt: number
): void {
  const store = resolveFaActionManagerStore()
  if (store === null) {
    return
  }
  store.updateHistoryEntryStatus(uid, {
    finishedAt,
    status: outcome.kind === 'success' ? 'success' : 'failed',
    ...(outcome.kind === 'failed' ? { errorMessage: outcome.errorMessage } : {})
  })
}

/**
 * Append a synthetic 'failed' history row used for queue overflow drops
 * (the dropped entry never enters the queue, so it has no real lifecycle).
 */
export function recordHistoryOverflowDrop (entry: I_faActionQueueEntry, errorMessage: string): void {
  const store = resolveFaActionManagerStore()
  if (store === null) {
    return
  }
  const now = Date.now()
  const historyEntry: I_faActionHistoryEntry = {
    enqueuedAt: entry.enqueuedAt,
    errorMessage,
    finishedAt: now,
    id: entry.id,
    kind: entry.kind,
    startedAt: now,
    status: 'failed',
    uid: entry.uid
  }
  const preview = buildFaActionPayloadPreview(entry.payload)
  if (preview !== '') {
    historyEntry.payloadPreview = preview
  }
  store.appendHistoryEntry(historyEntry)
}

/**
 * Returns a deep-cloned, ascending-by-'enqueuedAt' snapshot of the action history.
 * 'DialogActionMonitor' calls this once per open so the table never flickers as new actions stream in.
 */
export function snapshotActionHistory (): I_faActionHistoryEntry[] {
  const store = resolveFaActionManagerStore()
  if (store === null) {
    return []
  }
  const cloned = store.actionHistory.map((entry) => {
    return { ...entry }
  })
  cloned.sort((leftEntry, rightEntry) => leftEntry.enqueuedAt - rightEntry.enqueuedAt)
  return cloned
}
