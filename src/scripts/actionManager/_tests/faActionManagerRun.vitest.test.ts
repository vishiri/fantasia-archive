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

vi.mock('../faActionDefinitions_manager', () => ({
  findFaActionDefinition: findFaActionDefinitionMock
}))

import { S_FaActionManager } from 'app/src/stores/S_FaActionManager'
import {
  _resetFaActionSyncQueueForTests,
  awaitSyncQueueDrain,
  FA_ACTION_SYNC_QUEUE_MAX
} from '../faActionManagerSyncQueue_manager'
import { FaActionUserCanceledError } from '../functions/faActionUserCanceledError'
import { FaProjectOpenFailedError } from '../functions/faProjectOpenFailedError'
import { runFaAction, runFaActionAwait } from '../faActionManagerRun_manager'

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

function buildDef (id: T_faActionId, handler: (payload: unknown) => unknown, kind: 'sync' | 'async' = 'async', dedup = false): I_faActionDefinition<T_faActionId> {
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
 * runFaActionAwait
 * Dispatches async actions and clears them from the in-flight set when the handler settles.
 */
test('Test that runFaActionAwait dispatches async handlers and clears in-flight on completion', async () => {
  const handler = vi.fn(async () => {
    await Promise.resolve()
  })
  findFaActionDefinitionMock.mockReturnValue(buildDef('toggleDeveloperTools', handler, 'async'))
  await runFaActionAwait('toggleDeveloperTools', undefined)
  expect(handler).toHaveBeenCalledOnce()
  expect(S_FaActionManager().inFlightAsyncActions).toHaveLength(0)
})

/**
 * runFaActionAwait
 * Routes async handler errors through the failure reporter and records them in history.
 */
test('Test that runFaActionAwait reports async handler errors and records a failed history row', async () => {
  findFaActionDefinitionMock.mockReturnValue(
    buildDef('toggleDeveloperTools', () => {
      throw new Error('async boom')
    }, 'async')
  )
  await runFaActionAwait('toggleDeveloperTools', undefined)
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
 * Fire-and-forget path still awaits full async cleanup despite not returning the dispatch promise.
 */
test('Test that runFaAction clears async in-flight rows after handlers settle', async () => {
  const handler = vi.fn(async () => {
    await Promise.resolve()
  })
  findFaActionDefinitionMock.mockReturnValue(buildDef('toggleDeveloperTools', handler, 'async'))
  runFaAction('toggleDeveloperTools', undefined)
  await vi.waitFor(() => {
    expect(handler).toHaveBeenCalledOnce()
    expect(S_FaActionManager().inFlightAsyncActions).toHaveLength(0)
  })
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
 * Merges an async handler continuation payloadPreview into the terminal history row.
 */
test('Test that runFaActionAwait merges async payloadPreview continuation into history', async () => {
  const preview = '{"filePath":"/x.faproject","projectName":"P"}'
  const handler = vi.fn(async (): Promise<{ payloadPreview: string }> => {
    await Promise.resolve()
    return { payloadPreview: preview }
  })
  findFaActionDefinitionMock.mockReturnValue(buildDef('loadExistingProject', handler, 'async'))
  await expect(runFaActionAwait('loadExistingProject', {})).resolves.toBe(true)
  expect(handler).toHaveBeenCalledWith({})
  const row = S_FaActionManager().actionHistory.at(-1)
  expect(row?.id).toBe('loadExistingProject')
  expect(row?.payloadPreview).toBe(preview)
})

/**
 * runFaActionAwait
 * Handles synchronous handler results that carry payloadPreview without awaiting.
 */
test('Test that runFaActionAwait merges sync payloadPreview continuation into history', async () => {
  const preview = '{"filePath":"/y.faproject","projectName":"Q"}'
  const handler = vi.fn((): { payloadPreview: string } => ({ payloadPreview: preview }))
  findFaActionDefinitionMock.mockReturnValue(buildDef('loadExistingProject', handler, 'async'))
  await expect(runFaActionAwait('loadExistingProject', {})).resolves.toBe(true)
  const row = S_FaActionManager().actionHistory.at(-1)
  expect(row?.payloadPreview).toBe(preview)
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
 * Writes structured failure preview when async handler throws FaProjectOpenFailedError.
 */
test('Test that runFaActionAwait records FaProjectOpenFailedError path payload on failure', async () => {
  const handler = vi.fn(async (): Promise<void> => {
    await Promise.resolve()
    throw new FaProjectOpenFailedError('bad db', '/p/x.faproject')
  })
  findFaActionDefinitionMock.mockReturnValue(buildDef('loadExistingProject', handler, 'async'))
  await expect(runFaActionAwait('loadExistingProject', {})).resolves.toBe(false)
  const row = S_FaActionManager().actionHistory.at(-1)
  expect(row?.status).toBe('failed')
  expect(row?.payloadPreview).toContain('/p/x.faproject')
  expect(row?.payloadPreview).toContain('bad db')
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
