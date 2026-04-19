import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type {
  I_faActionDefinition,
  I_faActionQueueEntry,
  T_faActionId
} from 'app/types/I_faActionManagerDomain'

const { notifyCreateMock } = vi.hoisted(() => ({
  notifyCreateMock: vi.fn()
}))

vi.mock('quasar', () => ({
  Notify: { create: notifyCreateMock }
}))

vi.mock('app/i18n/externalFileLoader', () => ({
  i18n: { global: { t: (key: string, params?: Record<string, unknown>) => `${key}${params !== undefined ? ` ${JSON.stringify(params)}` : ''}` } }
}))

import { S_FaActionManager } from 'app/src/stores/S_FaActionManager'
import { recordHistoryEnqueued } from '../faActionManagerHistory'
import * as storeBridgeModule from '../faActionManagerStoreBridge'
import {
  _resetFaActionSyncQueueForTests,
  awaitSyncQueueDrain,
  enqueueSyncAction,
  FA_ACTION_SYNC_QUEUE_MAX,
  FA_ACTION_SYNC_TIMEOUT_MS
} from '../faActionManagerSyncQueue'

let consoleErrorSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  setActivePinia(createPinia())
  notifyCreateMock.mockReset()
  _resetFaActionSyncQueueForTests()
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  consoleErrorSpy.mockRestore()
})

let uidCounter = 0
function buildEntry (id: T_faActionId, payload: unknown = undefined): I_faActionQueueEntry {
  uidCounter += 1
  return {
    enqueuedAt: Date.now(),
    id,
    kind: 'sync',
    payload,
    uid: `uid-${uidCounter}`
  }
}

function buildDef (id: T_faActionId, handler: () => void | Promise<void>, dedup = false): I_faActionDefinition<T_faActionId> {
  const definition: I_faActionDefinition<T_faActionId> = {
    handler: handler as I_faActionDefinition<T_faActionId>['handler'],
    id,
    kind: 'sync'
  }
  if (dedup) {
    definition.dedup = true
  }
  return definition
}

/**
 * processNextSyncAction
 * Stops draining and resolves outstanding waiters when Pinia disappears mid-flight.
 * Placed first to avoid any cross-test state interference with the global isDraining flag.
 */
test('Test that processNextSyncAction halts drain when Pinia disappears mid-flight (early run)', async () => {
  vi.useRealTimers()
  let resolveHandler!: () => void
  const handlerPromise = new Promise<void>((resolve) => { resolveHandler = resolve })
  const def = buildDef('closeApp', () => handlerPromise)
  const lookup = (): I_faActionDefinition<T_faActionId> | undefined => def
  enqueueSyncAction(buildEntry('closeApp'), def, lookup)
  enqueueSyncAction(buildEntry('closeApp'), def, lookup)
  const drainPromise = awaitSyncQueueDrain()
  const resolveSpy = vi.spyOn(storeBridgeModule, 'resolveFaActionManagerStore').mockReturnValue(null)
  resolveHandler()
  await expect(drainPromise).resolves.toBeUndefined()
  resolveSpy.mockRestore()
})

/**
 * enqueueSyncAction
 * Processes pending entries strictly in FIFO order.
 */
test('Test that enqueueSyncAction processes pending entries in FIFO order', async () => {
  const calls: string[] = []
  const def = buildDef('closeApp', async () => {
    await Promise.resolve()
    calls.push('done')
  })
  const lookup = (): I_faActionDefinition<T_faActionId> | undefined => def
  const entryOne = buildEntry('closeApp')
  const entryTwo = buildEntry('closeApp')
  expect(enqueueSyncAction(entryOne, def, lookup)).toBe(true)
  expect(enqueueSyncAction(entryTwo, def, lookup)).toBe(true)
  await awaitSyncQueueDrain()
  expect(calls).toEqual(['done', 'done'])
})

/**
 * enqueueSyncAction
 * dedup=true rejects subsequent enqueues while one is pending or running.
 */
test('Test that dedup=true drops duplicate sync enqueues', async () => {
  let resolveHandler!: () => void
  const handlerPromise = new Promise<void>((resolve) => { resolveHandler = resolve })
  const def = buildDef('closeApp', () => handlerPromise, true)
  const lookup = (): I_faActionDefinition<T_faActionId> | undefined => def
  const first = enqueueSyncAction(buildEntry('closeApp'), def, lookup)
  await Promise.resolve()
  const second = enqueueSyncAction(buildEntry('closeApp'), def, lookup)
  expect(first).toBe(true)
  expect(second).toBe(false)
  resolveHandler()
  await awaitSyncQueueDrain()
})

/**
 * enqueueSyncAction
 * dedup=true also rejects entries when an identically-id'd entry sits earlier in the pending queue.
 */
test('Test that dedup=true detects duplicates already waiting in the pending queue', async () => {
  let resolveFirst!: () => void
  const firstHandlerPromise = new Promise<void>((resolve) => { resolveFirst = resolve })
  const blockingDef = buildDef('closeApp', () => firstHandlerPromise)
  const queuedDef = buildDef('refreshWebContentsAfterLanguage', () => Promise.resolve())
  const dedupDef = buildDef('refreshWebContentsAfterLanguage', () => Promise.resolve(), true)
  const lookup = (id: T_faActionId): I_faActionDefinition<T_faActionId> | undefined => {
    if (id === 'closeApp') {
      return blockingDef
    }
    return queuedDef
  }
  enqueueSyncAction(buildEntry('closeApp'), blockingDef, lookup)
  enqueueSyncAction(buildEntry('refreshWebContentsAfterLanguage'), queuedDef, lookup)
  const dropped = enqueueSyncAction(buildEntry('refreshWebContentsAfterLanguage'), dedupDef, lookup)
  expect(dropped).toBe(false)
  resolveFirst()
  await awaitSyncQueueDrain()
})

/**
 * enqueueSyncAction
 * Drops overflows past FA_ACTION_SYNC_QUEUE_MAX and emits a queueOverflow toast.
 */
test('Test that overflow past FA_ACTION_SYNC_QUEUE_MAX drops the entry and toasts', async () => {
  let resolveHandler!: () => void
  const handlerPromise = new Promise<void>((resolve) => { resolveHandler = resolve })
  const def = buildDef('closeApp', () => handlerPromise)
  const lookup = (): I_faActionDefinition<T_faActionId> | undefined => def
  for (let index = 0; index < FA_ACTION_SYNC_QUEUE_MAX + 1; index += 1) {
    enqueueSyncAction(buildEntry('closeApp'), def, lookup)
  }
  const droppedResult = enqueueSyncAction(buildEntry('closeApp'), def, lookup)
  expect(droppedResult).toBe(false)
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'negative' })
  )
  const overflowRow = S_FaActionManager().actionHistory.at(-1)
  expect(overflowRow?.status).toBe('failed')
  resolveHandler()
  await awaitSyncQueueDrain()
})

/**
 * enqueueSyncAction
 * Reports failures via the central error reporter when the handler throws.
 */
test('Test that handler throws are routed to the failure reporter', async () => {
  const def = buildDef('closeApp', () => {
    throw new Error('handler boom')
  })
  const lookup = (): I_faActionDefinition<T_faActionId> | undefined => def
  const entry = buildEntry('closeApp')
  recordHistoryEnqueued(entry)
  enqueueSyncAction(entry, def, lookup)
  await awaitSyncQueueDrain()
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'negative',
      caption: 'handler boom'
    })
  )
  const failedRow = S_FaActionManager().actionHistory.at(-1)
  expect(failedRow?.status).toBe('failed')
  expect(failedRow?.errorMessage).toBe('handler boom')
})

/**
 * enqueueSyncAction
 * Reports unknown action ids via the failure reporter and continues draining.
 */
test('Test that unknown action ids during dispatch are reported', async () => {
  const def = buildDef('closeApp', () => {})
  enqueueSyncAction(buildEntry('closeApp'), def, () => undefined)
  await awaitSyncQueueDrain()
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'negative' })
  )
})

/**
 * awaitSyncQueueDrain
 * Resolves immediately when no work is pending or running.
 */
test('Test that awaitSyncQueueDrain resolves immediately when idle', async () => {
  await expect(awaitSyncQueueDrain()).resolves.toBeUndefined()
})

/**
 * enqueueSyncAction
 * Returns false when no Pinia store is available.
 */
test('Test that enqueueSyncAction returns false when Pinia is missing', () => {
  setActivePinia(undefined as never)
  const def = buildDef('closeApp', () => {})
  expect(enqueueSyncAction(buildEntry('closeApp'), def, () => def)).toBe(false)
})

/**
 * awaitSyncQueueDrain
 * Resolves immediately when no Pinia store is available.
 */
test('Test that awaitSyncQueueDrain resolves immediately when Pinia is missing', async () => {
  setActivePinia(undefined as never)
  await expect(awaitSyncQueueDrain()).resolves.toBeUndefined()
})

/**
 * runHandlerWithTimeout
 * Hung handlers are aborted after FA_ACTION_SYNC_TIMEOUT_MS and reported through the failure reporter.
 */
test('Test that hung sync handlers are timed out via the timeout reject branch', async () => {
  vi.useFakeTimers()
  try {
    const def = buildDef('closeApp', () => new Promise<void>(() => {}))
    const lookup = (): I_faActionDefinition<T_faActionId> | undefined => def
    const entry = buildEntry('closeApp')
    recordHistoryEnqueued(entry)
    enqueueSyncAction(entry, def, lookup)
    await vi.advanceTimersByTimeAsync(FA_ACTION_SYNC_TIMEOUT_MS + 10)
    vi.useRealTimers()
    await awaitSyncQueueDrain()
    const lastRow = S_FaActionManager().actionHistory.at(-1)
    expect(lastRow?.status).toBe('failed')
    expect(notifyCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'negative' })
    )
  } finally {
    vi.useRealTimers()
  }
})

/**
 * runHandlerWithTimeout
 * If the handler completes first (settled = true) but clearTimeout is suppressed and the timer still fires,
 * the timeout callback short-circuits via the 'settled' guard instead of double-rejecting.
 */
test('Test that the late-firing timeout is short-circuited by the settled guard', async () => {
  vi.useFakeTimers()
  const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout').mockImplementation(() => undefined)
  try {
    const handler = vi.fn(() => {})
    const def = buildDef('closeApp', handler)
    const lookup = (): I_faActionDefinition<T_faActionId> | undefined => def
    const entry = buildEntry('closeApp')
    recordHistoryEnqueued(entry)
    enqueueSyncAction(entry, def, lookup)
    await vi.advanceTimersByTimeAsync(FA_ACTION_SYNC_TIMEOUT_MS + 5)
    expect(handler).toHaveBeenCalledOnce()
  } finally {
    clearTimeoutSpy.mockRestore()
    vi.useRealTimers()
    await awaitSyncQueueDrain()
  }
})

/**
 * runHandlerWithTimeout
 * Promise-returning handlers that reject route into the failure reporter via the .catch path.
 */
test('Test that handlers returning a rejected promise are routed to the failure reporter', async () => {
  const def = buildDef('closeApp', () => Promise.reject(new Error('async boom')))
  const lookup = (): I_faActionDefinition<T_faActionId> | undefined => def
  const entry = buildEntry('closeApp')
  recordHistoryEnqueued(entry)
  enqueueSyncAction(entry, def, lookup)
  await awaitSyncQueueDrain()
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'negative',
      caption: 'async boom'
    })
  )
})

/**
 * runHandlerWithTimeout
 * Synchronous handlers (returning void, not a Promise) settle through the synchronous finish branch.
 */
test('Test that synchronous handlers complete via the synchronous finish branch', async () => {
  const handler = vi.fn(() => {})
  const def = buildDef('closeApp', handler)
  const lookup = (): I_faActionDefinition<T_faActionId> | undefined => def
  enqueueSyncAction(buildEntry('closeApp'), def, lookup)
  await awaitSyncQueueDrain()
  expect(handler).toHaveBeenCalledOnce()
})

/**
 * runHandlerWithTimeout
 * If the handler eventually resolves AFTER the timeout already rejected, the late finish call
 * is short-circuited by the 'settled' guard and the timeout's failure outcome stands.
 */
test('Test that the late settle guard short-circuits finish when the timeout already fired', async () => {
  vi.useFakeTimers()
  try {
    let resolveHandler!: () => void
    const handlerPromise = new Promise<void>((resolve) => { resolveHandler = resolve })
    const def = buildDef('closeApp', () => handlerPromise)
    const lookup = (): I_faActionDefinition<T_faActionId> | undefined => def
    const entry = buildEntry('closeApp')
    recordHistoryEnqueued(entry)
    enqueueSyncAction(entry, def, lookup)
    await vi.advanceTimersByTimeAsync(FA_ACTION_SYNC_TIMEOUT_MS + 5)
    resolveHandler()
    await vi.runAllTimersAsync()
    vi.useRealTimers()
    await awaitSyncQueueDrain()
    const lastRow = S_FaActionManager().actionHistory.at(-1)
    expect(lastRow?.status).toBe('failed')
  } finally {
    vi.useRealTimers()
  }
})
