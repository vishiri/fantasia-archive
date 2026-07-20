import { expect, test } from 'vitest'

import {
  resolveProjectAppControlBarTabCopyBackgroundColorText,
  resolveProjectAppControlBarTabCopyTextColorText
} from '../projectAppControlBarTabCopyAppearanceColor'

test('Test that resolveProjectAppControlBarTabCopyTextColorText trims surrounding whitespace', () => {
  expect(resolveProjectAppControlBarTabCopyTextColorText({
    documentTextColorDraft: '  #AABBCC  '
  })).toBe('#AABBCC')
})

test('Test that resolveProjectAppControlBarTabCopyTextColorText returns null for empty drafts', () => {
  expect(resolveProjectAppControlBarTabCopyTextColorText({
    documentTextColorDraft: ''
  })).toBeNull()
  expect(resolveProjectAppControlBarTabCopyTextColorText({
    documentTextColorDraft: '   '
  })).toBeNull()
})

test('Test that resolveProjectAppControlBarTabCopyBackgroundColorText trims surrounding whitespace', () => {
  expect(resolveProjectAppControlBarTabCopyBackgroundColorText({
    documentBackgroundColorDraft: '  #112233  '
  })).toBe('#112233')
})

test('Test that resolveProjectAppControlBarTabCopyBackgroundColorText returns null for empty drafts', () => {
  expect(resolveProjectAppControlBarTabCopyBackgroundColorText({
    documentBackgroundColorDraft: ''
  })).toBeNull()
  expect(resolveProjectAppControlBarTabCopyBackgroundColorText({
    documentBackgroundColorDraft: '   '
  })).toBeNull()
})
