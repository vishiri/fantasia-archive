import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { I_faActionQueueEntry } from 'app/types/I_faActionManagerDomain'

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() }
}))

vi.mock('app/i18n/externalFileLoader', () => ({
  i18n: { global: { t: (key: string) => key } }
}))

import { S_FaActionManager } from 'app/src/stores/S_FaActionManager'
import {
  recordHistoryCompleted,
  recordHistoryEnqueued,
  recordHistoryOverflowDrop,
  recordHistoryStarted,
  recordHistoryStartedFromEntry,
  snapshotActionHistory
} from '../faActionManagerHistory'

beforeEach(() => {
  setActivePinia(createPinia())
})

function buildEntry (id: string, uid: string, payload: unknown = undefined): I_faActionQueueEntry {
  return {
    enqueuedAt: Date.now(),
    id: id as I_faActionQueueEntry['id'],
    kind: 'sync',
    payload,
    uid
  }
}

/**
 * recordHistoryEnqueued
 * Pushes a new 'queued' row containing the payload preview when present.
 */
test('Test that recordHistoryEnqueued appends a queued history row with payload preview', () => {
  const store = S_FaActionManager()
  recordHistoryEnqueued(buildEntry('closeApp', 'u1', { reason: 'menu' }))
  expect(store.actionHistory).toHaveLength(1)
  expect(store.actionHistory[0]?.status).toBe('queued')
  expect(store.actionHistory[0]?.payloadPreview).toBe('{"reason":"menu"}')
})

/**
 * recordHistoryEnqueued
 * Skips payload preview when payload is undefined.
 */
test('Test that recordHistoryEnqueued omits payload preview when payload is undefined', () => {
  const store = S_FaActionManager()
  recordHistoryEnqueued(buildEntry('closeApp', 'u1'))
  expect(store.actionHistory[0]?.payloadPreview).toBeUndefined()
})

/**
 * recordHistoryStarted
 * Promotes a queued row to 'running' and records the startedAt stamp.
 */
test('Test that recordHistoryStarted promotes a queued entry to running', () => {
  const store = S_FaActionManager()
  recordHistoryEnqueued(buildEntry('closeApp', 'u1'))
  recordHistoryStarted('u1', 12345)
  expect(store.actionHistory[0]?.status).toBe('running')
  expect(store.actionHistory[0]?.startedAt).toBe(12345)
})

/**
 * recordHistoryStartedFromEntry
 * Adds a brand-new running row for fire-and-forget async actions.
 */
test('Test that recordHistoryStartedFromEntry appends a running entry directly', () => {
  const store = S_FaActionManager()
  recordHistoryStartedFromEntry(buildEntry('toggleDeveloperTools', 'u1'), 222)
  expect(store.actionHistory).toHaveLength(1)
  expect(store.actionHistory[0]?.status).toBe('running')
  expect(store.actionHistory[0]?.startedAt).toBe(222)
})

/**
 * recordHistoryCompleted
 * Marks success outcomes with finishedAt and clears any error messages.
 */
test('Test that recordHistoryCompleted writes a success terminal status', () => {
  const store = S_FaActionManager()
  recordHistoryStartedFromEntry(buildEntry('toggleDeveloperTools', 'u1'), 1)
  recordHistoryCompleted('u1', { kind: 'success' }, 99)
  expect(store.actionHistory[0]?.status).toBe('success')
  expect(store.actionHistory[0]?.finishedAt).toBe(99)
})

/**
 * recordHistoryCompleted
 * Marks failures with the provided error message.
 */
test('Test that recordHistoryCompleted writes a failed terminal status with errorMessage', () => {
  const store = S_FaActionManager()
  recordHistoryStartedFromEntry(buildEntry('toggleDeveloperTools', 'u1'), 1)
  recordHistoryCompleted('u1', {
    kind: 'failed',
    errorMessage: 'no bridge'
  }, 77)
  expect(store.actionHistory[0]?.status).toBe('failed')
  expect(store.actionHistory[0]?.errorMessage).toBe('no bridge')
})

/**
 * recordHistoryOverflowDrop
 * Appends a synthetic failed row with both startedAt and finishedAt set.
 */
test('Test that recordHistoryOverflowDrop appends a failed row stamped with the overflow message', () => {
  const store = S_FaActionManager()
  recordHistoryOverflowDrop(buildEntry('closeApp', 'u-drop'), 'queue overflow')
  expect(store.actionHistory).toHaveLength(1)
  const row = store.actionHistory[0]
  expect(row?.status).toBe('failed')
  expect(row?.errorMessage).toBe('queue overflow')
  expect(row?.startedAt).toBeDefined()
  expect(row?.finishedAt).toBeDefined()
})

/**
 * snapshotActionHistory
 * Returns a deep-cloned, ascending-by-enqueuedAt array.
 */
test('Test that snapshotActionHistory returns a sorted, cloned snapshot', () => {
  const store = S_FaActionManager()
  store.appendHistoryEntry({
    enqueuedAt: 30,
    id: 'closeApp',
    kind: 'sync',
    status: 'queued',
    uid: 'a'
  })
  store.appendHistoryEntry({
    enqueuedAt: 10,
    id: 'toggleDeveloperTools',
    kind: 'async',
    status: 'success',
    uid: 'b'
  })
  const snapshot = snapshotActionHistory()
  expect(snapshot.map((row) => row.uid)).toEqual(['b', 'a'])
  snapshot[0]!.status = 'failed'
  expect(store.actionHistory.find((row) => row.uid === 'b')?.status).toBe('success')
})

/**
 * snapshotActionHistory
 * Returns an empty array when no Pinia store is active.
 */
test('Test that snapshotActionHistory returns an empty array when Pinia is missing', () => {
  setActivePinia(undefined as never)
  expect(snapshotActionHistory()).toEqual([])
})

/**
 * recordHistoryStartedFromEntry
 * Captures payload preview when the running entry carries a payload.
 */
test('Test that recordHistoryStartedFromEntry stores payload preview when payload is present', () => {
  const store = S_FaActionManager()
  recordHistoryStartedFromEntry(buildEntry('languageSwitch', 'u-pp', { code: 'en-US' }), 1)
  expect(store.actionHistory[0]?.payloadPreview).toBe('{"code":"en-US"}')
})

/**
 * recordHistoryOverflowDrop
 * Captures payload preview on synthetic overflow rows when payload is present.
 */
test('Test that recordHistoryOverflowDrop stores payload preview when payload is present', () => {
  const store = S_FaActionManager()
  recordHistoryOverflowDrop(buildEntry('closeApp', 'u-of', { reason: 'menu' }), 'overflow')
  expect(store.actionHistory[0]?.payloadPreview).toBe('{"reason":"menu"}')
})

/**
 * History helpers tolerate a missing Pinia instance and become a no-op.
 */
test('Test that history helpers no-op when Pinia is missing', () => {
  setActivePinia(undefined as never)
  expect(() => {
    recordHistoryEnqueued(buildEntry('closeApp', 'np-1'))
  }).not.toThrow()
  expect(() => {
    recordHistoryStarted('np-1', 1)
  }).not.toThrow()
  expect(() => {
    recordHistoryStartedFromEntry(buildEntry('toggleDeveloperTools', 'np-2'), 1)
  }).not.toThrow()
  expect(() => {
    recordHistoryCompleted('np-1', { kind: 'success' }, 1)
  }).not.toThrow()
  expect(() => {
    recordHistoryOverflowDrop(buildEntry('closeApp', 'np-3'), 'no pinia')
  }).not.toThrow()
})

/**
 * S_FaActionManager
 * appendHistoryEntry trims the buffer when it exceeds FA_ACTION_HISTORY_MAX.
 */
test('Test that appendHistoryEntry trims the history buffer at FA_ACTION_HISTORY_MAX', async () => {
  const { FA_ACTION_HISTORY_MAX } = await import('app/src/stores/S_FaActionManager')
  const store = S_FaActionManager()
  for (let index = 0; index < FA_ACTION_HISTORY_MAX + 5; index += 1) {
    store.appendHistoryEntry({
      enqueuedAt: index,
      id: 'closeApp',
      kind: 'sync',
      status: 'success',
      uid: `u-${String(index)}`
    })
  }
  expect(store.actionHistory).toHaveLength(FA_ACTION_HISTORY_MAX)
  expect(store.actionHistory[0]?.uid).toBe('u-5')
})

/**
 * S_FaActionManager
 * findHistoryEntry returns the entry by uid when present.
 */
test('Test that findHistoryEntry locates entries by uid', () => {
  const store = S_FaActionManager()
  store.appendHistoryEntry({
    enqueuedAt: 1,
    id: 'closeApp',
    kind: 'sync',
    status: 'queued',
    uid: 'find-me'
  })
  expect(store.findHistoryEntry('find-me')?.uid).toBe('find-me')
  expect(store.findHistoryEntry('missing')).toBeUndefined()
})

/**
 * S_FaActionManager
 * updateHistoryEntryStatus is a safe no-op when the uid is unknown.
 */
test('Test that updateHistoryEntryStatus is a no-op for unknown uids', () => {
  const store = S_FaActionManager()
  expect(() => {
    store.updateHistoryEntryStatus('nope', { status: 'failed' })
  }).not.toThrow()
})

/**
 * S_FaActionManager
 * updateHistoryEntryStatus only touches the patch fields that are defined.
 */
test('Test that updateHistoryEntryStatus only mutates the fields provided in the patch', () => {
  const store = S_FaActionManager()
  store.appendHistoryEntry({
    enqueuedAt: 1,
    errorMessage: 'previous',
    finishedAt: 2,
    id: 'closeApp',
    kind: 'sync',
    startedAt: 3,
    status: 'failed',
    uid: 'partial'
  })
  store.updateHistoryEntryStatus('partial', {})
  const entry = store.findHistoryEntry('partial')
  expect(entry?.status).toBe('failed')
  expect(entry?.startedAt).toBe(3)
  expect(entry?.finishedAt).toBe(2)
  expect(entry?.errorMessage).toBe('previous')
})
