import { expect, test } from 'vitest'

import { resolveProjectDocumentControlBarTabCopyNameText } from '../projectDocumentControlBarTabCopyName'

test('Test that resolveProjectDocumentControlBarTabCopyNameText trims surrounding whitespace', () => {
  expect(resolveProjectDocumentControlBarTabCopyNameText('  Hero  ')).toBe('Hero')
})

test('Test that resolveProjectDocumentControlBarTabCopyNameText returns null for empty strings', () => {
  expect(resolveProjectDocumentControlBarTabCopyNameText('')).toBeNull()
  expect(resolveProjectDocumentControlBarTabCopyNameText('   ')).toBeNull()
})
