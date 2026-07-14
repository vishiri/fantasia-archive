import { expect, test } from 'vitest'

import {
  resolveProjectDocumentControlBarTabCopyBackgroundColorText,
  resolveProjectDocumentControlBarTabCopyTextColorText
} from '../projectDocumentControlBarTabCopyAppearanceColor'

test('Test that resolveProjectDocumentControlBarTabCopyTextColorText trims surrounding whitespace', () => {
  expect(resolveProjectDocumentControlBarTabCopyTextColorText({
    documentTextColorDraft: '  #AABBCC  '
  })).toBe('#AABBCC')
})

test('Test that resolveProjectDocumentControlBarTabCopyTextColorText returns null for empty drafts', () => {
  expect(resolveProjectDocumentControlBarTabCopyTextColorText({
    documentTextColorDraft: ''
  })).toBeNull()
  expect(resolveProjectDocumentControlBarTabCopyTextColorText({
    documentTextColorDraft: '   '
  })).toBeNull()
})

test('Test that resolveProjectDocumentControlBarTabCopyBackgroundColorText trims surrounding whitespace', () => {
  expect(resolveProjectDocumentControlBarTabCopyBackgroundColorText({
    documentBackgroundColorDraft: '  #112233  '
  })).toBe('#112233')
})

test('Test that resolveProjectDocumentControlBarTabCopyBackgroundColorText returns null for empty drafts', () => {
  expect(resolveProjectDocumentControlBarTabCopyBackgroundColorText({
    documentBackgroundColorDraft: ''
  })).toBeNull()
  expect(resolveProjectDocumentControlBarTabCopyBackgroundColorText({
    documentBackgroundColorDraft: '   '
  })).toBeNull()
})
