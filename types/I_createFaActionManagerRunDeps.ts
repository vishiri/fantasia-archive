import type {
  I_faActionDefinition,
  I_faActionPayloadMap,
  I_faActionQueueEntry,
  T_faActionId
} from 'app/types/I_faActionManagerDomain'
import type { T_injectedResultAsync } from 'app/types/I_injectedNeverthrow'

export type T_createFaActionManagerRunDeps = {
  ResultAsync: T_injectedResultAsync
  buildFaActionErrorOrWarningPayloadPreview: (payload: unknown) => string
  buildFaActionFailureHistoryPayloadPreview: (error: unknown) => string | undefined
  enqueueSyncAction: (
    entry: I_faActionQueueEntry,
    definition: I_faActionDefinition<T_faActionId>,
    findDefinition: (id: T_faActionId) => I_faActionDefinition<T_faActionId> | undefined
  ) => boolean
  FaActionUserCanceledError: new (...args: never[]) => Error
  findFaActionDefinition: (
    id: T_faActionId
  ) => I_faActionDefinition<T_faActionId> | undefined
  nowMs: () => number
  recordHistoryCompleted: (
    uid: string,
    outcome: { kind: 'success' } | { errorMessage: string, kind: 'failed' },
    completedAt: number,
    payloadPreview?: string | undefined
  ) => void
  recordHistoryEnqueued: (entry: I_faActionQueueEntry) => void
  recordHistoryStartedFromEntry: (
    entry: I_faActionQueueEntry,
    startedAt: number
  ) => void
  reportFaActionFailure: (
    entry: I_faActionQueueEntry,
    error: unknown
  ) => { errorMessage: string }
  resolveFaActionManagerStore: () => {
    addAsync: (entry: I_faActionQueueEntry) => void
    removeAsync: (uid: string) => void
  } | null
  uuidv4: () => string
}

export type T_createFaActionManagerRunApi = {
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  runFaActionAwait: <Id extends T_faActionId>(
    id: Id,
    payload: I_faActionPayloadMap[Id]
  ) => Promise<boolean>
}
