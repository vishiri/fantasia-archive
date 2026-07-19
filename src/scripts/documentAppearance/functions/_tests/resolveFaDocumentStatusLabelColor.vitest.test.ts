import { expect, test } from 'vitest'

import { FA_DOCUMENT_STATUS_MINOR_LABEL_COLOR } from '../resolveFaDocumentStatusLabelColor'
import { resolveFaDocumentStatusLabelColor } from '../resolveFaDocumentStatusLabelColor'

test('Test that resolveFaDocumentStatusLabelColor prefers custom text color over minor', () => {
  expect(resolveFaDocumentStatusLabelColor({
    documentTextColor: '#aabbcc',
    isMinor: true
  })).toBe('#aabbcc')
})

test('Test that resolveFaDocumentStatusLabelColor returns muted grey for minor without text color', () => {
  expect(resolveFaDocumentStatusLabelColor({
    documentTextColor: '',
    isMinor: true
  })).toBe(FA_DOCUMENT_STATUS_MINOR_LABEL_COLOR)
})

test('Test that resolveFaDocumentStatusLabelColor returns undefined when not minor and no text color', () => {
  expect(resolveFaDocumentStatusLabelColor({
    documentTextColor: '   ',
    isMinor: false
  })).toBeUndefined()
})
