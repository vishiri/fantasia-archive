import { expect, test } from 'vitest'

import { FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH } from '../faActionPayloadPreviewLimits'
import { resolveFaActionPayloadPreviewMaxLengthForLogging } from '../resolveFaActionPayloadPreviewMaxLengthForLogging'

test('Test that resolveFaActionPayloadPreviewMaxLengthForLogging returns default when logging is off', () => {
  expect(resolveFaActionPayloadPreviewMaxLengthForLogging(false, false, 400)).toBe(400)
})

test('Test that resolveFaActionPayloadPreviewMaxLengthForLogging returns Infinity when logging is on', () => {
  expect(resolveFaActionPayloadPreviewMaxLengthForLogging(true, false, 400)).toBe(
    Number.POSITIVE_INFINITY
  )
})

test('Test that resolveFaActionPayloadPreviewMaxLengthForLogging returns Infinity for errors when logging is off', () => {
  expect(resolveFaActionPayloadPreviewMaxLengthForLogging(false, true, 400)).toBe(
    Number.POSITIVE_INFINITY
  )
})

test('Test that resolveFaActionPayloadPreviewMaxLengthForLogging uses the configured default cap', () => {
  expect(
    resolveFaActionPayloadPreviewMaxLengthForLogging(
      false,
      false,
      FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH
    )
  ).toBe(FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH)
})
