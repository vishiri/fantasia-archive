import { v4 as uuidv4 } from 'uuid'

import type {
  I_faActionDefinition,
  I_faActionPayloadMap,
  I_faActionQueueEntry,
  T_faActionId
} from 'app/types/I_faActionManagerDomain'

import { findFaActionDefinition } from './faActionDefinitions'
import {
  recordHistoryCompleted,
  recordHistoryEnqueued,
  recordHistoryStartedFromEntry
} from './faActionManagerHistory'
import { enqueueSyncAction } from './faActionManagerSyncQueue'
import { reportFaActionFailure } from './faActionManagerErrorReporting'
import { FaActionUserCanceledError } from './faActionUserCanceledError'
import { resolveFaActionManagerStore } from './faActionManagerStoreBridge'

function buildEntry<Id extends T_faActionId> (
  id: Id,
  payload: I_faActionPayloadMap[Id],
  kind: I_faActionDefinition<T_faActionId>['kind']
): I_faActionQueueEntry {
  const enqueuedAt = Date.now()
  const uid = uuidv4()
  return {
    enqueuedAt,
    id,
    kind,
    payload,
    uid
  }
}

async function dispatchAsyncEntry (
  definition: I_faActionDefinition<T_faActionId>,
  entry: I_faActionQueueEntry
): Promise<boolean> {
  const store = resolveFaActionManagerStore()
  store?.addAsync(entry)
  recordHistoryStartedFromEntry(entry, entry.enqueuedAt)
  try {
    const outcome = (definition.handler as (payload: unknown) => void | Promise<void>)(entry.payload)
    if (outcome instanceof Promise) {
      await outcome
    }
    recordHistoryCompleted(entry.uid, { kind: 'success' }, Date.now())
    return true
  } catch (error) {
    if (error instanceof FaActionUserCanceledError) {
      recordHistoryCompleted(entry.uid, { kind: 'success' }, Date.now())
      return false
    }
    const failure = reportFaActionFailure(entry, error)
    recordHistoryCompleted(
      entry.uid,
      {
        errorMessage: failure.errorMessage,
        kind: 'failed'
      },
      Date.now()
    )
    return false
  } finally {
    store?.removeAsync(entry.uid)
  }
}

function enqueueSyncEntry<Id extends T_faActionId> (
  definition: I_faActionDefinition<T_faActionId>,
  id: Id,
  payload: I_faActionPayloadMap[Id]
): boolean {
  const entry = buildEntry(id, payload, 'sync')
  recordHistoryEnqueued(entry)
  const accepted = enqueueSyncAction(entry, definition, findFaActionDefinition)
  if (!accepted) {
    recordHistoryCompleted(entry.uid, { kind: 'success' }, Date.now())
  }
  return accepted
}

/**
 * Fire-and-forget invocation. Errors are routed to the manager's error reporter; the call site never sees them.
 */
export function runFaAction<Id extends T_faActionId> (
  id: Id,
  payload: I_faActionPayloadMap[Id]
): void {
  const definition = findFaActionDefinition(id)
  if (definition === undefined) {
    reportFaActionFailure(buildEntry(id, payload, 'async'), new Error(`Unknown action id: ${String(id)}`))
    return
  }
  if (definition.kind === 'async') {
    void dispatchAsyncEntry(definition, buildEntry(id, payload, 'async'))
    return
  }
  enqueueSyncEntry(definition, id, payload)
}

/**
 * Same dispatch as 'runFaAction' but returns a 'Promise<boolean>' for the rare site that needs the outcome.
 * Resolves 'true' on success, 'false' on failure (the toast + console error are still emitted).
 * For sync actions this resolves once the action's slot in the FIFO queue completes.
 */
export function runFaActionAwait<Id extends T_faActionId> (
  id: Id,
  payload: I_faActionPayloadMap[Id]
): Promise<boolean> {
  const definition = findFaActionDefinition(id)
  if (definition === undefined) {
    reportFaActionFailure(buildEntry(id, payload, 'async'), new Error(`Unknown action id: ${String(id)}`))
    return Promise.resolve(false)
  }
  if (definition.kind === 'async') {
    return dispatchAsyncEntry(definition, buildEntry(id, payload, 'async'))
  }
  return new Promise((resolve) => {
    const entry = buildEntry(id, payload, 'sync')
    recordHistoryEnqueued(entry)
    const wrappedDefinition: I_faActionDefinition<T_faActionId> = {
      dedup: definition.dedup,
      handler: async (innerPayload) => {
        try {
          const outcome = (definition.handler as (innerPayloadInner: unknown) => void | Promise<void>)(innerPayload)
          if (outcome instanceof Promise) {
            await outcome
          }
          resolve(true)
        } catch (error) {
          resolve(false)
          throw error
        }
      },
      id: definition.id,
      kind: 'sync'
    }
    const accepted = enqueueSyncAction(entry, wrappedDefinition, (lookupId) => {
      if (lookupId === wrappedDefinition.id) {
        return wrappedDefinition
      }
      return findFaActionDefinition(lookupId)
    })
    if (!accepted) {
      recordHistoryCompleted(entry.uid, { kind: 'success' }, Date.now())
      resolve(false)
    }
  })
}
