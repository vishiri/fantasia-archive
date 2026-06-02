import { expect, test } from 'vitest'

import type { I_faActionQueueEntry } from 'app/types/I_faActionManagerDomain'

import { FaProjectOpenFailedError } from '../functions/faProjectOpenFailedError'
import {
  normalizeFaActionError,
  readFaProjectOpenFailedShape,
  resolveFaActionFailureNotifyCaption
} from '../faActionManagerErrorReportingNormalize'

function buildEntry (
  payload: I_faActionQueueEntry['payload'] = undefined
): I_faActionQueueEntry {
  return {
    enqueuedAt: 1,
    id: 'loadExistingProject',
    kind: 'async',
    payload,
    uid: 'uid-normalize'
  }
}

/**
 * readFaProjectOpenFailedShape
 * Returns null when the value is not a FaProjectOpenFailedError-shaped Error.
 */
test('Test that readFaProjectOpenFailedShape returns null for unrelated errors', () => {
  expect(readFaProjectOpenFailedShape(new Error('other'))).toBeNull()
})

/**
 * resolveFaActionFailureNotifyCaption
 * Uses loadExistingProject payload filePath when the error carries no attempted path.
 */
test('Test that resolveFaActionFailureNotifyCaption reads filePath from loadExistingProject payload', () => {
  const caption = resolveFaActionFailureNotifyCaption(
    buildEntry({ filePath: 'D:\\projects\\from-payload.faproject' }),
    new Error('technical detail'),
    'technical detail'
  )
  expect(caption).toBe('D:\\projects\\from-payload.faproject')
})

/**
 * resolveFaActionFailureNotifyCaption
 * Prefers FaProjectOpenFailedError attempted path over payload when both are present.
 */
test('Test that resolveFaActionFailureNotifyCaption prefers attempted path on project open errors', () => {
  const caption = resolveFaActionFailureNotifyCaption(
    buildEntry({ filePath: 'D:\\payload.faproject' }),
    new FaProjectOpenFailedError('open failed', 'D:\\attempted.faproject', 'negative'),
    'open failed'
  )
  expect(caption).toBe('D:\\attempted.faproject')
})

/**
 * readLoadExistingProjectPayloadFilePath
 * Ignores blank or non-string filePath values on loadExistingProject payloads.
 */
test('Test that resolveFaActionFailureNotifyCaption ignores invalid payload filePath values', () => {
  const caption = resolveFaActionFailureNotifyCaption(
    buildEntry({ filePath: '   ' }),
    new Error('still technical'),
    'still technical'
  )
  expect(caption).toBe('still technical')
})

/**
 * readLoadExistingProjectPayloadFilePath
 * Returns undefined when payload is not a plain object with a string filePath.
 */
test('Test that resolveFaActionFailureNotifyCaption ignores malformed loadExistingProject payloads', () => {
  expect(
    resolveFaActionFailureNotifyCaption(
      buildEntry(null),
      new Error('detail'),
      'detail'
    )
  ).toBe('detail')
  expect(
    resolveFaActionFailureNotifyCaption(
      buildEntry({ filePath: 42 }),
      new Error('detail'),
      'detail'
    )
  ).toBe('detail')
})

/**
 * normalizeFaActionError
 * Coerces string and arbitrary thrown values into a stable error shape.
 */
test('Test that normalizeFaActionError handles string and non-Error values', () => {
  expect(normalizeFaActionError('plain')).toEqual({
    message: 'plain',
    name: 'Error'
  })
  expect(normalizeFaActionError(99)).toEqual({
    message: '99',
    name: 'Error'
  })
})

/**
 * readFaProjectOpenFailedShape
 * Drops whitespace-only attempted paths and unknown notifyType values.
 */
test('Test that readFaProjectOpenFailedShape trims attempted paths and ignores unknown notify types', () => {
  const err = new Error('open failed')
  err.name = 'FaProjectOpenFailedError'
  Object.assign(err, {
    attemptedFilePath: '   ',
    notifyType: 'unexpected'
  })
  expect(readFaProjectOpenFailedShape(err)).toEqual({})
  expect(
    resolveFaActionFailureNotifyCaption(buildEntry(), err, 'open failed')
  ).toBe('open failed')
})

/**
 * resolveFaActionFailureNotifyCaption
 * Falls back to the normalized message when a hard project open error has no path.
 */
test('Test that resolveFaActionFailureNotifyCaption falls back without an attempted path', () => {
  const err = new FaProjectOpenFailedError('open failed', undefined, 'negative')
  expect(resolveFaActionFailureNotifyCaption(buildEntry(), err, 'open failed')).toBe('open failed')
})
