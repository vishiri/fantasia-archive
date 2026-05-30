import type { I_faActionDefinition, I_faActionQueueEntry, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { T_injectedResult, T_injectedResultAsync } from 'app/types/I_injectedNeverthrow'

export type T_createFaActionManagerSyncQueueDeps = {
  FA_ACTION_SYNC_QUEUE_MAX: number
  FA_ACTION_SYNC_TIMEOUT_MS: number
  Notify: { create: (opts: Record<string, unknown>) => void }
  Result: T_injectedResult
  ResultAsync: T_injectedResultAsync
  buildFaActionFailureHistoryPayloadPreview: (error: unknown) => string | undefined
  i18n: { global: { t: (key: string) => string } }
  recordHistoryCompleted: (
    uid: string,
    outcome: { kind: 'success' } | { kind: 'failed'; errorMessage: string },
    finishedAt: number,
    failurePreview?: string
  ) => void
  recordHistoryOverflowDrop: (entry: I_faActionQueueEntry, errorMessage: string) => void
  recordHistoryStarted: (uid: string, startedAt: number) => void
  reportFaActionFailure: (entry: I_faActionQueueEntry, error: unknown) => {
    errorMessage: string
  }
  resolveFaActionManagerStore: () => {
    setCurrent: (entry: I_faActionQueueEntry | null) => void
    popSync: () => I_faActionQueueEntry | null
    pushSync: (entry: I_faActionQueueEntry) => void
    pendingSyncQueue: I_faActionQueueEntry[]
    currentSyncAction: I_faActionQueueEntry | null
  } | null
}

export type T_faActionSyncQueueMutableState = {
  drainCompletionWaiters: Array<() => void>
  isDraining: boolean
}

export type T_createFaActionManagerSyncQueueApi = {
  FA_ACTION_SYNC_QUEUE_MAX: number
  FA_ACTION_SYNC_TIMEOUT_MS: number
  awaitSyncQueueDrain: () => Promise<void>
  enqueueSyncAction: (
    entry: I_faActionQueueEntry,
    definition: I_faActionDefinition<T_faActionId>,
    definitionLookup: (id: T_faActionId) => I_faActionDefinition<T_faActionId> | undefined
  ) => boolean
  _resetFaActionSyncQueueForTests: () => void
}
