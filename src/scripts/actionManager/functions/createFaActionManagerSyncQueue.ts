import type { I_faActionDefinition, I_faActionQueueEntry, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type {
  T_createFaActionManagerSyncQueueApi,
  T_createFaActionManagerSyncQueueDeps,
  T_faActionSyncQueueMutableState
} from 'app/types/I_createFaActionManagerSyncQueueDeps'

function flushFaActionSyncQueueDrainWaiters (state: T_faActionSyncQueueMutableState): void {
  const pending = state.drainCompletionWaiters.splice(0, state.drainCompletionWaiters.length)
  for (const waiter of pending) {
    waiter()
  }
}

function runFaActionSyncHandlerWithTimeout (
  deps: T_createFaActionManagerSyncQueueDeps,
  definition: I_faActionDefinition<T_faActionId>,
  entry: I_faActionQueueEntry
): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true
        reject(new Error(deps.i18n.global.t('globalFunctionality.faActionManager.actionTimedOut')))
      }
    }, deps.FA_ACTION_SYNC_TIMEOUT_MS)
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
    const invocation = deps.Result.fromThrowable(
      (): void | Promise<void> => (
        definition.handler as (payload: unknown) => void | Promise<void>
      )(entry.payload),
      (e): unknown => e
    )()
    if (invocation.isErr()) {
      finish(invocation.error)
      return
    }
    const outcome = invocation.value
    if (outcome instanceof Promise) {
      void deps.ResultAsync.fromPromise(outcome, (e): unknown => e).match(() => finish(null), finish)
      return
    }
    finish(null)
  })
}

async function executeFaActionSyncQueueEntry (
  deps: T_createFaActionManagerSyncQueueDeps,
  definition: I_faActionDefinition<T_faActionId>,
  entry: I_faActionQueueEntry
): Promise<void> {
  const store = deps.resolveFaActionManagerStore()
  store?.setCurrent(entry)
  deps.recordHistoryStarted(entry.uid, Date.now())
  await Promise.resolve(
    deps.ResultAsync.fromPromise(
      runFaActionSyncHandlerWithTimeout(deps, definition, entry),
      (e): unknown => e
    ).match(
      () => deps.recordHistoryCompleted(entry.uid, { kind: 'success' }, Date.now()),
      (error) => {
        const failure = deps.reportFaActionFailure(entry, error)
        deps.recordHistoryCompleted(
          entry.uid,
          {
            errorMessage: failure.errorMessage,
            kind: 'failed'
          },
          Date.now(),
          deps.buildFaActionFailureHistoryPayloadPreview(error)
        )
      }
    )
  ).finally(() => {
    store?.setCurrent(null)
  })
}

async function processNextFaActionSyncQueueEntry (
  deps: T_createFaActionManagerSyncQueueDeps,
  state: T_faActionSyncQueueMutableState,
  definitionLookup: (id: T_faActionId) => I_faActionDefinition<T_faActionId> | undefined
): Promise<void> {
  const store = deps.resolveFaActionManagerStore()
  if (store === null) {
    state.isDraining = false
    flushFaActionSyncQueueDrainWaiters(state)
    return
  }
  const next = store.popSync()
  if (next === null) {
    state.isDraining = false
    flushFaActionSyncQueueDrainWaiters(state)
    return
  }
  const definition = definitionLookup(next.id)
  if (definition === undefined) {
    deps.reportFaActionFailure(next, new Error(`Unknown action id: ${String(next.id)}`))
    void processNextFaActionSyncQueueEntry(deps, state, definitionLookup)
    return
  }
  await executeFaActionSyncQueueEntry(deps, definition, next)
  void processNextFaActionSyncQueueEntry(deps, state, definitionLookup)
}

function enqueueFaActionSyncQueueEntry (
  deps: T_createFaActionManagerSyncQueueDeps,
  state: T_faActionSyncQueueMutableState,
  entry: I_faActionQueueEntry,
  definition: I_faActionDefinition<T_faActionId>,
  definitionLookup: (id: T_faActionId) => I_faActionDefinition<T_faActionId> | undefined
): boolean {
  const store = deps.resolveFaActionManagerStore()
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
  if (store.pendingSyncQueue.length >= deps.FA_ACTION_SYNC_QUEUE_MAX) {
    const errorMessage = deps.i18n.global.t('globalFunctionality.faActionManager.queueOverflow')
    deps.Notify.create({
      actions: [{
        color: 'white',
        icon: 'mdi-close'
      }],
      caption: entry.id,
      group: false,
      message: errorMessage,
      timeout: 6000,
      type: 'negative'
    })
    deps.recordHistoryOverflowDrop(entry, errorMessage)
    console.error('[faActionManager] queue overflow', {
      droppedEntry: entry,
      queueLength: store.pendingSyncQueue.length
    })
    return false
  }
  store.pushSync(entry)
  if (!state.isDraining) {
    state.isDraining = true
    void processNextFaActionSyncQueueEntry(deps, state, definitionLookup)
  }
  return true
}

function awaitFaActionSyncQueueDrain (
  deps: T_createFaActionManagerSyncQueueDeps,
  state: T_faActionSyncQueueMutableState
): Promise<void> {
  const store = deps.resolveFaActionManagerStore()
  if (store === null) {
    return Promise.resolve()
  }
  if (!state.isDraining && store.pendingSyncQueue.length === 0 && store.currentSyncAction === null) {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    state.drainCompletionWaiters.push(resolve)
  })
}

export function createFaActionManagerSyncQueue (
  deps: T_createFaActionManagerSyncQueueDeps
): T_createFaActionManagerSyncQueueApi {
  const state: T_faActionSyncQueueMutableState = {
    drainCompletionWaiters: [],
    isDraining: false
  }

  return {
    FA_ACTION_SYNC_QUEUE_MAX: deps.FA_ACTION_SYNC_QUEUE_MAX,
    FA_ACTION_SYNC_TIMEOUT_MS: deps.FA_ACTION_SYNC_TIMEOUT_MS,
    awaitSyncQueueDrain: () => awaitFaActionSyncQueueDrain(deps, state),
    enqueueSyncAction: (entry, definition, definitionLookup) => enqueueFaActionSyncQueueEntry(
      deps,
      state,
      entry,
      definition,
      definitionLookup
    ),
    _resetFaActionSyncQueueForTests: () => {
      state.isDraining = false
      state.drainCompletionWaiters.length = 0
    }
  }
}
