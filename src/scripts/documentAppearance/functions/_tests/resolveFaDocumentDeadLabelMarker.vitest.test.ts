import { expect, test } from 'vitest'

import {
  FA_DOCUMENT_DEAD_LABEL_MARKER,
  FA_DOCUMENT_FINISHED_LABEL_MARKER,
  resolveFaDocumentDeadLabelShowsMarker,
  resolveFaDocumentFinishedLabelShowsMarker
} from '../resolveFaDocumentDeadLabelMarker'

test('Test that FA_DOCUMENT_DEAD_LABEL_MARKER is the FA 1.0 dagger', () => {
  expect(FA_DOCUMENT_DEAD_LABEL_MARKER).toBe('†')
})

test('Test that FA_DOCUMENT_FINISHED_LABEL_MARKER is the check mark', () => {
  expect(FA_DOCUMENT_FINISHED_LABEL_MARKER).toBe('\u2713')
})

test('Test that resolveFaDocumentDeadLabelShowsMarker mirrors the dead flag', () => {
  expect(resolveFaDocumentDeadLabelShowsMarker(true)).toBe(true)
  expect(resolveFaDocumentDeadLabelShowsMarker(false)).toBe(false)
})

test('Test that resolveFaDocumentFinishedLabelShowsMarker mirrors the finished flag', () => {
  expect(resolveFaDocumentFinishedLabelShowsMarker(true)).toBe(true)
  expect(resolveFaDocumentFinishedLabelShowsMarker(false)).toBe(false)
})
