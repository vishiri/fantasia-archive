import { expect, test } from 'vitest'

import { resolveProjectAppControlBarTabCopyNameText } from '../projectAppControlBarTabCopyName'

test('Test that resolveProjectAppControlBarTabCopyNameText trims surrounding whitespace', () => {
  expect(resolveProjectAppControlBarTabCopyNameText('  Hero  ')).toBe('Hero')
})

test('Test that resolveProjectAppControlBarTabCopyNameText returns null for empty strings', () => {
  expect(resolveProjectAppControlBarTabCopyNameText('')).toBeNull()
  expect(resolveProjectAppControlBarTabCopyNameText('   ')).toBeNull()
})
