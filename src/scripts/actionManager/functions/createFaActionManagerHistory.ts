import type {
  I_faActionHistoryEntry,
  I_faActionQueueEntry
} from 'app/types/I_faActionManagerDomain'

type T_faActionManagerHistoryStore = {
  appendHistoryEntry: (entry: I_faActionHistoryEntry) => void
  updateHistoryEntryStatus: (
    uid: string,
    patch: Partial<I_faActionHistoryEntry>
  ) => void
  actionHistory: I_faActionHistoryEntry[]
}

function buildHistoryEntryFromQueue (
  entry: I_faActionQueueEntry,
  buildFaActionPayloadPreview: (payload: unknown, maxLength?: number) => string,
  status: I_faActionHistoryEntry['status'],
  startedAt?: number
): I_faActionHistoryEntry {
  const historyEntry: I_faActionHistoryEntry = {
    enqueuedAt: entry.enqueuedAt,
    id: entry.id,
    kind: entry.kind,
    status,
    uid: entry.uid,
    ...(startedAt !== undefined ? { startedAt } : {})
  }
  const preview = buildFaActionPayloadPreview(entry.payload)
  if (preview !== '') {
    historyEntry.payloadPreview = preview
  }
  return historyEntry
}

type T_createFaActionManagerHistoryDeps = {
  buildFaActionPayloadPreview: (payload: unknown, maxLength?: number) => string
  resolveFaActionManagerStore: () => T_faActionManagerHistoryStore | null
}

function recordFaActionHistoryEnqueued (
  deps: T_createFaActionManagerHistoryDeps,
  entry: I_faActionQueueEntry
): void {
  const store = deps.resolveFaActionManagerStore()
  if (store === null) {
    return
  }
  store.appendHistoryEntry(buildHistoryEntryFromQueue(
    entry,
    deps.buildFaActionPayloadPreview,
    'queued'
  ))
}

function recordFaActionHistoryStarted (
  deps: T_createFaActionManagerHistoryDeps,
  uid: string,
  startedAt: number
): void {
  const store = deps.resolveFaActionManagerStore()
  if (store === null) {
    return
  }
  store.updateHistoryEntryStatus(uid, {
    startedAt,
    status: 'running'
  })
}

function recordFaActionHistoryStartedFromEntry (
  deps: T_createFaActionManagerHistoryDeps,
  entry: I_faActionQueueEntry,
  startedAt: number
): void {
  const store = deps.resolveFaActionManagerStore()
  if (store === null) {
    return
  }
  store.appendHistoryEntry(buildHistoryEntryFromQueue(
    entry,
    deps.buildFaActionPayloadPreview,
    'running',
    startedAt
  ))
}

function recordFaActionHistoryCompleted (
  deps: T_createFaActionManagerHistoryDeps,
  uid: string,
  outcome: { kind: 'success' } | { kind: 'failed', errorMessage: string },
  finishedAt: number,
  payloadPreview?: string
): void {
  const store = deps.resolveFaActionManagerStore()
  if (store === null) {
    return
  }
  store.updateHistoryEntryStatus(uid, {
    ...(outcome.kind === 'failed' ? { errorMessage: outcome.errorMessage } : {}),
    finishedAt,
    ...(payloadPreview !== undefined ? { payloadPreview } : {}),
    status: outcome.kind === 'success' ? 'success' : 'failed'
  })
}

function recordFaActionHistoryOverflowDrop (
  deps: T_createFaActionManagerHistoryDeps,
  entry: I_faActionQueueEntry,
  errorMessage: string
): void {
  const store = deps.resolveFaActionManagerStore()
  if (store === null) {
    return
  }
  const now = Date.now()
  const historyEntry = buildHistoryEntryFromQueue(
    entry,
    deps.buildFaActionPayloadPreview,
    'failed',
    now
  )
  historyEntry.errorMessage = errorMessage
  historyEntry.finishedAt = now
  store.appendHistoryEntry(historyEntry)
}

function snapshotFaActionHistory (
  deps: T_createFaActionManagerHistoryDeps
): I_faActionHistoryEntry[] {
  const store = deps.resolveFaActionManagerStore()
  if (store === null) {
    return []
  }
  const cloned = store.actionHistory.map((entry) => {
    return { ...entry }
  })
  cloned.sort((leftEntry, rightEntry) => rightEntry.enqueuedAt - leftEntry.enqueuedAt)
  return cloned
}

export function createFaActionManagerHistory (deps: T_createFaActionManagerHistoryDeps): {
  recordHistoryEnqueued: (entry: I_faActionQueueEntry) => void
  recordHistoryStarted: (uid: string, startedAt: number) => void
  recordHistoryStartedFromEntry: (entry: I_faActionQueueEntry, startedAt: number) => void
  recordHistoryCompleted: (
    uid: string,
    outcome: { kind: 'success' } | { kind: 'failed', errorMessage: string },
    finishedAt: number,
    payloadPreview?: string
  ) => void
  recordHistoryOverflowDrop: (entry: I_faActionQueueEntry, errorMessage: string) => void
  snapshotActionHistory: () => I_faActionHistoryEntry[]
} {
  return {
    recordHistoryCompleted: (uid, outcome, finishedAt, payloadPreview) => recordFaActionHistoryCompleted(
      deps,
      uid,
      outcome,
      finishedAt,
      payloadPreview
    ),
    recordHistoryEnqueued: (entry) => recordFaActionHistoryEnqueued(deps, entry),
    recordHistoryOverflowDrop: (entry, errorMessage) => recordFaActionHistoryOverflowDrop(
      deps,
      entry,
      errorMessage
    ),
    recordHistoryStarted: (uid, startedAt) => recordFaActionHistoryStarted(deps, uid, startedAt),
    recordHistoryStartedFromEntry: (entry, startedAt) => recordFaActionHistoryStartedFromEntry(
      deps,
      entry,
      startedAt
    ),
    snapshotActionHistory: () => snapshotFaActionHistory(deps)
  }
}
