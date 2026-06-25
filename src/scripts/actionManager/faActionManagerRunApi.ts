import type {
  I_faActionDefinition,
  I_faActionPayloadMap,
  I_faActionQueueEntry,
  T_faActionId
} from 'app/types/I_faActionManagerDomain'
import type {
  T_createFaActionManagerRunApi,
  T_createFaActionManagerRunDeps
} from 'app/types/I_createFaActionManagerRunDeps'

import { resolveFaActionFailureHistoryPayloadPreviewMerge } from './functions/resolveFaActionFailureHistoryPayloadPreviewMerge'

function buildFaActionManagerRunEntry<Id extends T_faActionId> (
  deps: T_createFaActionManagerRunDeps,
  id: Id,
  payload: I_faActionPayloadMap[Id],
  kind: I_faActionDefinition<T_faActionId>['kind']
): I_faActionQueueEntry {
  return {
    enqueuedAt: deps.nowMs(),
    id,
    kind,
    payload,
    uid: deps.uuidv4()
  }
}

async function dispatchFaActionManagerAsyncEntry (
  deps: T_createFaActionManagerRunDeps,
  definition: I_faActionDefinition<T_faActionId>,
  entry: I_faActionQueueEntry
): Promise<boolean> {
  const store = deps.resolveFaActionManagerStore()
  store?.addAsync(entry)
  deps.recordHistoryStartedFromEntry(entry, entry.enqueuedAt)
  const outcomeBool = await deps.ResultAsync.fromPromise(
    (async (): Promise<{ payloadPreview?: string } | undefined> => {
      const raw = definition.handler(entry.payload as never)
      const resolved = raw instanceof Promise ? await raw : raw
      if (
        resolved !== undefined &&
        resolved !== null &&
        typeof resolved === 'object' &&
        typeof (resolved as { payloadPreview?: unknown }).payloadPreview === 'string'
      ) {
        return { payloadPreview: (resolved as { payloadPreview: string }).payloadPreview }
      }
      return undefined
    })(),
    (e): unknown => e
  ).match(
    (continuation): boolean => {
      deps.recordHistoryCompleted(
        entry.uid,
        { kind: 'success' },
        deps.nowMs(),
        continuation?.payloadPreview
      )
      return true
    },
    (error: unknown): boolean => {
      if (error instanceof deps.FaActionUserCanceledError) {
        deps.recordHistoryCompleted(entry.uid, { kind: 'success' }, deps.nowMs())
        return false
      }
      const failure = deps.reportFaActionFailure(entry, error)
      const failurePayloadPreview = resolveFaActionFailureHistoryPayloadPreviewMerge(
        deps.buildFaActionFailureHistoryPayloadPreview(error),
        deps.buildFaActionErrorOrWarningPayloadPreview(entry.payload)
      )
      deps.recordHistoryCompleted(
        entry.uid,
        {
          errorMessage: failure.errorMessage,
          kind: 'failed'
        },
        deps.nowMs(),
        failurePayloadPreview
      )
      return false
    }
  )
  store?.removeAsync(entry.uid)
  return outcomeBool
}

function enqueueFaActionManagerSyncEntry<Id extends T_faActionId> (
  deps: T_createFaActionManagerRunDeps,
  definition: I_faActionDefinition<T_faActionId>,
  id: Id,
  payload: I_faActionPayloadMap[Id]
): boolean {
  const entry = buildFaActionManagerRunEntry(deps, id, payload, 'sync')
  deps.recordHistoryEnqueued(entry)
  const accepted = deps.enqueueSyncAction(entry, definition, deps.findFaActionDefinition)
  if (!accepted) {
    deps.recordHistoryCompleted(entry.uid, { kind: 'success' }, deps.nowMs())
  }
  return accepted
}

function runFaActionManagerAction<Id extends T_faActionId> (
  deps: T_createFaActionManagerRunDeps,
  id: Id,
  payload: I_faActionPayloadMap[Id]
): void {
  const definition = deps.findFaActionDefinition(id)
  if (definition === undefined) {
    deps.reportFaActionFailure(
      buildFaActionManagerRunEntry(deps, id, payload, 'async'),
      new Error(`Unknown action id: ${String(id)}`)
    )
    return
  }
  if (definition.kind === 'async') {
    void dispatchFaActionManagerAsyncEntry(
      deps,
      definition,
      buildFaActionManagerRunEntry(deps, id, payload, 'async')
    )
    return
  }
  enqueueFaActionManagerSyncEntry(deps, definition, id, payload)
}

function runFaActionManagerActionAwait<Id extends T_faActionId> (
  deps: T_createFaActionManagerRunDeps,
  id: Id,
  payload: I_faActionPayloadMap[Id]
): Promise<boolean> {
  const definition = deps.findFaActionDefinition(id)
  if (definition === undefined) {
    deps.reportFaActionFailure(
      buildFaActionManagerRunEntry(deps, id, payload, 'async'),
      new Error(`Unknown action id: ${String(id)}`)
    )
    return Promise.resolve(false)
  }
  if (definition.kind === 'async') {
    return dispatchFaActionManagerAsyncEntry(
      deps,
      definition,
      buildFaActionManagerRunEntry(deps, id, payload, 'async')
    )
  }
  return new Promise((resolve) => {
    const entry = buildFaActionManagerRunEntry(deps, id, payload, 'sync')
    deps.recordHistoryEnqueued(entry)
    const wrappedDefinition: I_faActionDefinition<T_faActionId> = {
      dedup: definition.dedup,
      handler: async (innerPayload) => {
        await deps.ResultAsync.fromPromise(
          (async (): Promise<void> => {
            const innerOutcome =
              (definition.handler as (innerPayloadInner: unknown) => void | Promise<void>)(
                innerPayload
              )
            if (innerOutcome instanceof Promise) {
              await innerOutcome
            }
          })(),
          (e): unknown => e
        ).match(
          (): boolean => {
            resolve(true)
            return true
          },
          (error): boolean => {
            resolve(false)
            throw error
          }
        )
      },
      id: definition.id,
      kind: 'sync'
    }
    const accepted = deps.enqueueSyncAction(entry, wrappedDefinition, (lookupId) => {
      if (lookupId === wrappedDefinition.id) {
        return wrappedDefinition
      }
      return deps.findFaActionDefinition(lookupId)
    })
    if (!accepted) {
      deps.recordHistoryCompleted(entry.uid, { kind: 'success' }, deps.nowMs())
      resolve(false)
    }
  })
}

export function createFaActionManagerRun (deps: T_createFaActionManagerRunDeps): T_createFaActionManagerRunApi {
  return {
    runFaAction: (id, payload) => runFaActionManagerAction(deps, id, payload),
    runFaActionAwait: (id, payload) => runFaActionManagerActionAwait(deps, id, payload)
  }
}
