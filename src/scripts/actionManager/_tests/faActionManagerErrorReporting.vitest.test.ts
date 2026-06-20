import { beforeEach, expect, test, vi } from 'vitest'

const { notifyCreateMock, tMock } = vi.hoisted(() => ({
  notifyCreateMock: vi.fn(),
  tMock: vi.fn((key: string) => key)
}))

vi.mock('quasar', () => ({
  Notify: { create: notifyCreateMock }
}))

vi.mock('app/i18n/externalFileLoader', () => ({
  i18n: { global: { t: tMock } }
}))

const { resolveStoreMock } = vi.hoisted(() => ({
  resolveStoreMock: vi.fn<() => unknown>(() => null)
}))

vi.mock('../faActionManagerStoreBridge_manager', () => ({
  resolveFaActionManagerStore: resolveStoreMock
}))

const { resolvePayloadPreviewMaxLengthMock } = vi.hoisted(() => ({
  resolvePayloadPreviewMaxLengthMock: vi.fn(() => 400)
}))

vi.mock('../faActionPayloadPreviewMaxLengthWiring', () => ({
  FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH: 400,
  resolveFaActionPayloadPreviewMaxLength: resolvePayloadPreviewMaxLengthMock
}))

import {
  buildFaActionFailureHistoryPayloadPreview,
  buildFaActionPayloadPreview,
  normalizeFaActionError,
  reportFaActionFailure
} from '../faActionManagerErrorReporting_manager'
import type { I_faActionQueueEntry } from 'app/types/I_faActionManagerDomain'
import { FaProjectOpenFailedError } from '../functions/faProjectOpenFailedError'

beforeEach(() => {
  notifyCreateMock.mockReset()
  resolveStoreMock.mockReset()
  resolveStoreMock.mockReturnValue(null)
  resolvePayloadPreviewMaxLengthMock.mockReset()
  resolvePayloadPreviewMaxLengthMock.mockReturnValue(400)
})

/**
 * buildFaActionPayloadPreview
 * Returns empty string for undefined payloads.
 */
test('Test that buildFaActionPayloadPreview returns empty string for undefined', () => {
  expect(buildFaActionPayloadPreview(undefined)).toBe('')
})

/**
 * buildFaActionPayloadPreview
 * Treats empty plain objects as having no preview text.
 */
test('Test that buildFaActionPayloadPreview returns empty string for empty plain objects', () => {
  expect(buildFaActionPayloadPreview({})).toBe('')
})

/**
 * buildFaActionFailureHistoryPayloadPreview
 * Summarizes FaProjectOpenFailedError for action monitor rows.
 */
test('Test that buildFaActionFailureHistoryPayloadPreview maps FaProjectOpenFailedError', () => {
  const err = new FaProjectOpenFailedError('bad', 'C:\\x.faproject')
  const expected = buildFaActionPayloadPreview({
    errorMessage: 'bad',
    filePath: 'C:\\x.faproject'
  })
  expect(buildFaActionFailureHistoryPayloadPreview(err)).toBe(expected)
})

/**
 * buildFaActionFailureHistoryPayloadPreview
 * Omits filePath when the error carries no attempted path.
 */
test('Test that buildFaActionFailureHistoryPayloadPreview maps FaProjectOpenFailedError without file path', () => {
  const err = new FaProjectOpenFailedError('bad')
  const expected = buildFaActionPayloadPreview({
    errorMessage: 'bad'
  })
  expect(buildFaActionFailureHistoryPayloadPreview(err)).toBe(expected)
})

/**
 * buildFaActionFailureHistoryPayloadPreview
 */
test('Test that buildFaActionFailureHistoryPayloadPreview returns undefined for generic errors', () => {
  expect(buildFaActionFailureHistoryPayloadPreview(new Error('no'))).toBeUndefined()
})

/**
 * buildFaActionPayloadPreview
 * Stringifies plain objects.
 */
test('Test that buildFaActionPayloadPreview stringifies plain objects', () => {
  expect(buildFaActionPayloadPreview({ a: 1 })).toBe('{"a":1}')
})

/**
 * buildFaActionPayloadPreview
 * Truncates long payload previews.
 */
test('Test that buildFaActionPayloadPreview truncates payloads longer than maxLength', () => {
  const big = 'x'.repeat(500)
  const out = buildFaActionPayloadPreview(big, 50)
  expect(out.length).toBeLessThanOrEqual(53)
  expect(out.endsWith('...')).toBe(true)
})

/**
 * buildFaActionPayloadPreview
 * Uses the user-settings preview cap when maxLength is omitted.
 */
test('Test that buildFaActionPayloadPreview uses resolveFaActionPayloadPreviewMaxLength by default', () => {
  resolvePayloadPreviewMaxLengthMock.mockReturnValueOnce(20)
  const out = buildFaActionPayloadPreview({ value: 'x'.repeat(100) })
  expect(out.endsWith('...')).toBe(true)
  expect(out.length).toBe(23)
  expect(resolvePayloadPreviewMaxLengthMock).toHaveBeenCalledOnce()
})

/**
 * buildFaActionPayloadPreview
 * Handles cycles by returning the unserializable sentinel.
 */
test('Test that buildFaActionPayloadPreview returns sentinel for cycles', () => {
  const obj: Record<string, unknown> = {}
  obj.self = obj
  expect(buildFaActionPayloadPreview(obj)).toBe('[unserializable]')
})

/**
 * buildFaActionPayloadPreview
 * Returns empty string when JSON.stringify produces undefined (e.g. for a function payload).
 */
test('Test that buildFaActionPayloadPreview returns empty string when JSON.stringify yields undefined', () => {
  expect(buildFaActionPayloadPreview(() => 1)).toBe('')
})

/**
 * normalizeFaActionError
 * Passes through Error metadata.
 */
test('Test that normalizeFaActionError preserves name, message, and stack from Errors', () => {
  const err = new TypeError('boom')
  const normalized = normalizeFaActionError(err)
  expect(normalized.name).toBe('TypeError')
  expect(normalized.message).toBe('boom')
  expect(typeof normalized.stack === 'string').toBe(true)
})

/**
 * normalizeFaActionError
 * Omits the stack when the Error instance has no string-typed stack.
 */
test('Test that normalizeFaActionError omits stack when the Error has no stack string', () => {
  const err = new Error('no stack')
  Object.defineProperty(err, 'stack', { value: undefined })
  const normalized = normalizeFaActionError(err)
  expect(normalized.stack).toBeUndefined()
  expect(normalized.message).toBe('no stack')
})

/**
 * normalizeFaActionError
 * Coerces strings into an Error-shaped record.
 */
test('Test that normalizeFaActionError coerces a string to a Error-shaped record', () => {
  expect(normalizeFaActionError('plain message')).toEqual({
    message: 'plain message',
    name: 'Error'
  })
})

/**
 * normalizeFaActionError
 * Falls back to String() for arbitrary thrown values.
 */
test('Test that normalizeFaActionError falls back to String for arbitrary values', () => {
  expect(normalizeFaActionError(42)).toEqual({
    message: '42',
    name: 'Error'
  })
})

function buildEntry (id: string, payload: unknown = undefined): I_faActionQueueEntry {
  return {
    enqueuedAt: 1,
    id: id as I_faActionQueueEntry['id'],
    kind: 'async',
    payload,
    uid: 'uid-1'
  }
}

/**
 * reportFaActionFailure
 * Always emits exactly one console.error and one Notify.create per failure.
 */
test('Test that reportFaActionFailure emits one console error and one notify', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const result = reportFaActionFailure(buildEntry('toggleDeveloperTools'), new Error('oops'))
  expect(consoleSpy).toHaveBeenCalledOnce()
  expect(notifyCreateMock).toHaveBeenCalledOnce()
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      caption: 'oops',
      faSkipNotifyConsoleLog: true,
      type: 'negative'
    })
  )
  expect(result.errorMessage).toBe('oops')
  expect(result.kind).toBe('async')
  consoleSpy.mockRestore()
})

/**
 * reportFaActionFailure
 * Resolves project open path from error.name when instanceof is unreliable across bundles.
 */
test('Test that reportFaActionFailure uses attempted file path for FaProjectOpenFailedError by error name', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const bindingsNoise = 'Could not locate the bindings file.'
  const err = new Error(bindingsNoise)
  err.name = 'FaProjectOpenFailedError'
  Object.assign(err, {
    attemptedFilePath: 'C:\\data\\picked.faproject',
    notifyType: 'negative'
  })
  reportFaActionFailure(
    buildEntry('loadExistingProject'),
    err
  )
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      caption: 'C:\\data\\picked.faproject',
      type: 'negative'
    })
  )
  consoleSpy.mockRestore()
})

/**
 * reportFaActionFailure
 * Shows attempted project path in the toast caption for hard project open failures.
 */
test('Test that reportFaActionFailure uses attempted file path as notify caption for FaProjectOpenFailedError', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const bindingsNoise = 'Could not locate the bindings file. Tried: C:\\build\\Release\\better_sqlite3.node'
  reportFaActionFailure(
    buildEntry('loadExistingProject', { filePath: 'C:\\data\\latest.faproject' }),
    new FaProjectOpenFailedError(bindingsNoise, 'C:\\data\\latest.faproject', 'negative')
  )
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      caption: 'C:\\data\\latest.faproject',
      type: 'negative'
    })
  )
  consoleSpy.mockRestore()
})

/**
 * reportFaActionFailure
 * Uses warning Notify when FaProjectOpenFailedError requests it (console stays error).
 */
test('Test that reportFaActionFailure uses warning notify for soft FaProjectOpenFailedError', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  reportFaActionFailure(
    buildEntry('loadExistingProject'),
    new FaProjectOpenFailedError('already open', '/p/old.faproject', 'warning')
  )
  expect(consoleSpy).toHaveBeenCalledOnce()
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      caption: 'already open',
      faSkipNotifyConsoleLog: true,
      type: 'warning'
    })
  )
  consoleSpy.mockRestore()
})

/**
 * reportFaActionFailure
 * Forwards the failure to the Pinia store when one is available.
 */
test('Test that reportFaActionFailure records the failure on the store when present', () => {
  const recordFailure = vi.fn()
  resolveStoreMock.mockReturnValue({
    recordFailure
  } as unknown as ReturnType<typeof import('app/src/stores/S_FaActionManager').S_FaActionManager>)
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  reportFaActionFailure(buildEntry('toggleDeveloperTools', { foo: 'bar' }), new Error('oops'))
  expect(recordFailure).toHaveBeenCalledOnce()
  expect(recordFailure.mock.calls[0][0].payloadPreview).toBe('{"foo":"bar"}')
  consoleSpy.mockRestore()
})
