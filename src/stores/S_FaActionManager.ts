import type { Ref } from 'vue'

import { defineStore } from 'pinia'
import { ref } from 'vue'

import type {
  I_faActionFailureLog,
  I_faActionHistoryEntry,
  I_faActionQueueEntry,
  T_faActionHistoryStatus
} from 'app/types/I_faActionManagerDomain'

/**
 * Hard cap for the session-only action history ring buffer; oldest entries are dropped on overflow.
 */
export const FA_ACTION_HISTORY_MAX = 500

interface I_historyEntryStatusPatch {
  status?: T_faActionHistoryStatus
  startedAt?: number
  finishedAt?: number
  errorMessage?: string
}

/**
 * Session history buffer API returned from 'buildHistoryState'.
 */
interface I_faActionManagerHistoryState {
  actionHistory: Ref<I_faActionHistoryEntry[]>
  appendHistoryEntry: (entry: I_faActionHistoryEntry) => void
  updateHistoryEntryStatus: (uid: string, patch: I_historyEntryStatusPatch) => void
  findHistoryEntry: (uid: string) => I_faActionHistoryEntry | undefined
}

/**
 * Mutable queue surface returned from 'buildQueueState'.
 */
interface I_faActionManagerQueueState {
  pendingSyncQueue: Ref<I_faActionQueueEntry[]>
  currentSyncAction: Ref<I_faActionQueueEntry | null>
  inFlightAsyncActions: Ref<I_faActionQueueEntry[]>
  pushSync: (entry: I_faActionQueueEntry) => void
  popSync: () => I_faActionQueueEntry | null
  setCurrent: (entry: I_faActionQueueEntry | null) => void
  addAsync: (entry: I_faActionQueueEntry) => void
  removeAsync: (uid: string) => void
}

function buildQueueState (): I_faActionManagerQueueState {
  const pendingSyncQueue: Ref<I_faActionQueueEntry[]> = ref([])
  const currentSyncAction: Ref<I_faActionQueueEntry | null> = ref(null)
  const inFlightAsyncActions: Ref<I_faActionQueueEntry[]> = ref([])

  const addAsync = (entry: I_faActionQueueEntry): void => {
    inFlightAsyncActions.value.push(entry)
  }

  const popSync = (): I_faActionQueueEntry | null => {
    return pendingSyncQueue.value.shift() ?? null
  }

  const pushSync = (entry: I_faActionQueueEntry): void => {
    pendingSyncQueue.value.push(entry)
  }

  const removeAsync = (uid: string): void => {
    inFlightAsyncActions.value = inFlightAsyncActions.value.filter((row) => row.uid !== uid)
  }

  const setCurrent = (entry: I_faActionQueueEntry | null): void => {
    currentSyncAction.value = entry
  }

  return {
    addAsync,
    currentSyncAction,
    inFlightAsyncActions,
    pendingSyncQueue,
    popSync,
    pushSync,
    removeAsync,
    setCurrent
  }
}

function applyHistoryEntryStatusPatch (entry: I_faActionHistoryEntry, patch: I_historyEntryStatusPatch): void {
  if (patch.status !== undefined) {
    entry.status = patch.status
  }
  if (patch.startedAt !== undefined) {
    entry.startedAt = patch.startedAt
  }
  if (patch.finishedAt !== undefined) {
    entry.finishedAt = patch.finishedAt
  }
  if (patch.errorMessage !== undefined) {
    entry.errorMessage = patch.errorMessage
  }
}

/**
 * Drops the oldest rows so length never exceeds 'FA_ACTION_HISTORY_MAX' (ring buffer behavior).
 */
function trimOldestActionHistoryEntries (entries: I_faActionHistoryEntry[]): void {
  if (entries.length <= FA_ACTION_HISTORY_MAX) {
    return
  }
  const removeCount = entries.length - FA_ACTION_HISTORY_MAX
  entries.splice(0, removeCount)
}

function buildHistoryState (): I_faActionManagerHistoryState {
  const actionHistory: Ref<I_faActionHistoryEntry[]> = ref([])

  const appendHistoryEntry = (entry: I_faActionHistoryEntry): void => {
    actionHistory.value.push(entry)
    trimOldestActionHistoryEntries(actionHistory.value)
  }

  const findHistoryEntry = (uid: string): I_faActionHistoryEntry | undefined => {
    return actionHistory.value.find((row) => row.uid === uid)
  }

  const updateHistoryEntryStatus = (uid: string, patch: I_historyEntryStatusPatch): void => {
    const entry = findHistoryEntry(uid)
    if (entry === undefined) {
      return
    }
    applyHistoryEntryStatusPatch(entry, patch)
  }

  return {
    actionHistory,
    appendHistoryEntry,
    findHistoryEntry,
    updateHistoryEntryStatus
  }
}

/**
 * Mirrors the action manager's runtime state:
 * - 'pendingSyncQueue' / 'currentSyncAction' / 'inFlightAsyncActions' for inspection
 * - 'lastFailure' for debugging UI
 * - 'actionHistory' for the in-app DialogActionMonitor (session-only, snapshot-on-open)
 *
 * The store does not run handlers; orchestration lives in 'src/scripts/actionManager/'.
 */
export const S_FaActionManager = defineStore('S_FaActionManager', () => {
  const queueState = buildQueueState()
  const historyState = buildHistoryState()
  const lastFailure: Ref<I_faActionFailureLog | null> = ref(null)

  const recordFailure = (failure: I_faActionFailureLog): void => {
    lastFailure.value = failure
  }

  return {
    ...queueState,
    ...historyState,
    lastFailure,
    recordFailure
  }
})
