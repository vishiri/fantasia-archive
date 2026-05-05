import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type {
  I_faActionDefinition,
  T_faActionId
} from 'app/types/I_faActionManagerDomain'

const { findFaActionDefinitionMock, notifyCreateMock } = vi.hoisted(() => ({
  findFaActionDefinitionMock: vi.fn(),
  notifyCreateMock: vi.fn()
}))

vi.mock('quasar', () => ({
  Notify: { create: notifyCreateMock }
}))

vi.mock('app/i18n/externalFileLoader', () => ({
  i18n: { global: { t: (key: string, params?: Record<string, unknown>) => `${key}${params !== undefined ? ` ${JSON.stringify(params)}` : ''}` } }
}))

vi.mock('../faActionDefinitions', () => ({
  findFaActionDefinition: findFaActionDefinitionMock
}))

import { S_FaActionManager } from 'app/src/stores/S_FaActionManager'
import {
  _resetFaActionSyncQueueForTests,
  awaitSyncQueueDrain,
  FA_ACTION_SYNC_QUEUE_MAX
} from '../faActionManagerSyncQueue'
import { FaActionUserCanceledError } from '../faActionUserCanceledError'
import { runFaAction, runFaActionAwait } from '../faActionManagerRun'

let consoleErrorSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  setActivePinia(createPinia())
  notifyCreateMock.mockReset()
  findFaActionDefinitionMock.mockReset()
  _resetFaActionSyncQueueForTests()
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  consoleErrorSpy.mockRestore()
})

function buildDef (id: T_faActionId, handler: (payload: unknown) => void | Promise<void>, kind: 'sync' | 'async' = 'async', dedup = false): I_faActionDefinition<T_faActionId> {
  const def: I_faActionDefinition<T_faActionId> = {
    handler: handler as I_faActionDefinition<T_faActionId>['handler'],
    id,
    kind
  }
  if (dedup) {
    def.dedup = true
  }
  return def
}

/**
 * runFaAction
 * Reports an unknown id failure via the error reporter without throwing.
 */
test('Test that runFaAction reports unknown action ids', () => {
  findFaActionDefinitionMock.mockReturnValue(undefined)
  expect(() => runFaAction('toggleDeveloperTools', undefined)).not.toThrow()
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'negative' })
  )
})

/**
 * runFaAction
 * Dispatches async actions immediately and tracks them through the in-flight set.
 */
test('Test that runFaAction dispatches async handlers and clears in-flight on completion', async () => {
  const handler = vi.fn(async () => {
    await Promise.resolve()
  })
  findFaActionDefinitionMock.mockReturnValue(buildDef('toggleDeveloperTools', handler, 'async'))
  runFaAction('toggleDeveloperTools', undefined)
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
  expect(handler).toHaveBeenCalledOnce()
  expect(S_FaActionManager().inFlightAsyncActions).toHaveLength(0)
})

/**
 * runFaAction
 * Routes async handler errors through the failure reporter and records them in history.
 */
test('Test that runFaAction reports async handler errors and records a failed history row', async () => {
  findFaActionDefinitionMock.mockReturnValue(
    buildDef('toggleDeveloperTools', () => {
      throw new Error('async boom')
    }, 'async')
  )
  runFaAction('toggleDeveloperTools', undefined)
  await Promise.resolve()
  await Promise.resolve()
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'negative',
      caption: 'async boom'
    })
  )
  const lastRow = S_FaActionManager().actionHistory.at(-1)
  expect(lastRow?.status).toBe('failed')
})

/**
 * runFaAction
 * Enqueues sync actions and runs them through the queue.
 */
test('Test that runFaAction enqueues sync actions through the queue', async () => {
  const handler = vi.fn()
  findFaActionDefinitionMock.mockReturnValue(buildDef('closeApp', handler, 'sync'))
  runFaAction('closeApp', undefined)
  await awaitSyncQueueDrain()
  expect(handler).toHaveBeenCalledOnce()
})

/**
 * runFaActionAwait
 * Resolves true when the async handler succeeds.
 */
test('Test that runFaActionAwait resolves true on async success', async () => {
  findFaActionDefinitionMock.mockReturnValue(
    buildDef('toggleDeveloperTools', async () => { await Promise.resolve() }, 'async')
  )
  await expect(runFaActionAwait('toggleDeveloperTools', undefined)).resolves.toBe(true)
})

/**
 * runFaActionAwait
 * Resolves false when the async handler throws.
 */
test('Test that runFaActionAwait resolves false on async failure', async () => {
  findFaActionDefinitionMock.mockReturnValue(
    buildDef('toggleDeveloperTools', () => { throw new Error('boom') }, 'async')
  )
  await expect(runFaActionAwait('toggleDeveloperTools', undefined)).resolves.toBe(false)
})

/**
 * runFaActionAwait
 * Resolves true after the sync queue completes the wrapped handler.
 */
test('Test that runFaActionAwait resolves true once the sync queue runs the handler', async () => {
  const handler = vi.fn(async () => { await Promise.resolve() })
  findFaActionDefinitionMock.mockReturnValue(buildDef('closeApp', handler, 'sync'))
  await expect(runFaActionAwait('closeApp', undefined)).resolves.toBe(true)
  expect(handler).toHaveBeenCalledOnce()
})

/**
 * runFaActionAwait
 * Resolves false when the sync handler throws.
 */
test('Test that runFaActionAwait resolves false on sync failure', async () => {
  findFaActionDefinitionMock.mockReturnValue(
    buildDef('closeApp', () => { throw new Error('sync boom') }, 'sync')
  )
  await expect(runFaActionAwait('closeApp', undefined)).resolves.toBe(false)
})

/**
 * runFaActionAwait
 * FaActionUserCanceledError resolves false without negative Notify.
 */
test('Test that runFaActionAwait resolves false on FaActionUserCanceledError without Notify', async () => {
  const handler = vi.fn(async () => {
    await Promise.resolve()
    throw new FaActionUserCanceledError()
  })
  findFaActionDefinitionMock.mockReturnValue(buildDef('toggleDeveloperTools', handler, 'async'))
  await expect(runFaActionAwait('toggleDeveloperTools', undefined)).resolves.toBe(false)
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * runFaActionAwait
 * Resolves false when the unknown id reporter is reached.
 */
test('Test that runFaActionAwait resolves false on unknown action id', async () => {
  findFaActionDefinitionMock.mockReturnValue(undefined)
  await expect(runFaActionAwait('toggleDeveloperTools', undefined)).resolves.toBe(false)
})

/**
 * runFaActionAwait
 * Falls back to findFaActionDefinition for ids other than its own wrapped definition while draining.
 */
test('Test that runFaActionAwait sync wrapper falls back to findFaActionDefinition for other queued ids', async () => {
  let resolveFirst!: () => void
  const firstHandlerPromise = new Promise<void>((resolve) => { resolveFirst = resolve })
  const firstDef = buildDef('closeApp', () => firstHandlerPromise, 'sync')
  const secondHandler = vi.fn()
  const secondDef = buildDef('refreshWebContentsAfterLanguage', secondHandler, 'sync')
  findFaActionDefinitionMock.mockImplementation((id: T_faActionId) => {
    if (id === 'refreshWebContentsAfterLanguage') {
      return secondDef
    }
    return firstDef
  })
  const firstAwait = runFaActionAwait('closeApp', undefined)
  await Promise.resolve()
  runFaAction('refreshWebContentsAfterLanguage', undefined)
  resolveFirst()
  await firstAwait
  await awaitSyncQueueDrain()
  expect(secondHandler).toHaveBeenCalledOnce()
})

/**
 * runFaAction
 * Marks the synthetic history row as success when the sync enqueue is dropped (overflow).
 */
test('Test that runFaAction handles sync overflow by marking the history row as completed', async () => {
  let resolveHandler!: () => void
  const handlerPromise = new Promise<void>((resolve) => { resolveHandler = resolve })
  const handler = vi.fn(() => handlerPromise)
  findFaActionDefinitionMock.mockReturnValue(buildDef('closeApp', handler, 'sync'))
  for (let index = 0; index < FA_ACTION_SYNC_QUEUE_MAX + 2; index += 1) {
    runFaAction('closeApp', undefined)
  }
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'negative' })
  )
  resolveHandler()
  await awaitSyncQueueDrain()
})

/**
 * runFaActionAwait
 * Resolves false when the sync enqueue is dropped by dedup, without leaving a 'queued' history row behind.
 */
test('Test that runFaActionAwait resolves false when dedup drops the sync entry', async () => {
  let resolveHandler!: () => void
  const handlerPromise = new Promise<void>((resolve) => { resolveHandler = resolve })
  const handler = vi.fn(() => handlerPromise)
  findFaActionDefinitionMock.mockReturnValue(buildDef('closeApp', handler, 'sync', true))
  const firstCall = runFaActionAwait('closeApp', undefined)
  await Promise.resolve()
  await expect(runFaActionAwait('closeApp', undefined)).resolves.toBe(false)
  resolveHandler()
  await expect(firstCall).resolves.toBe(true)
})
