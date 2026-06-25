import { expect, test } from 'vitest'

import { resolveFaActionFailureHistoryPayloadPreviewMerge } from '../resolveFaActionFailureHistoryPayloadPreviewMerge'

test('Test that resolveFaActionFailureHistoryPayloadPreviewMerge prefers shaped failure preview', () => {
  expect(
    resolveFaActionFailureHistoryPayloadPreviewMerge('{"errorMessage":"open failed"}', '{"big":true}')
  ).toBe('{"errorMessage":"open failed"}')
})

test('Test that resolveFaActionFailureHistoryPayloadPreviewMerge falls back to entry payload preview', () => {
  expect(
    resolveFaActionFailureHistoryPayloadPreviewMerge(undefined, '{"settings":{}}')
  ).toBe('{"settings":{}}')
})

test('Test that resolveFaActionFailureHistoryPayloadPreviewMerge returns undefined when both previews are empty', () => {
  expect(resolveFaActionFailureHistoryPayloadPreviewMerge(undefined, '')).toBeUndefined()
  expect(resolveFaActionFailureHistoryPayloadPreviewMerge('', '')).toBeUndefined()
})
