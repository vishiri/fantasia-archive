import { expect, test } from 'vitest'

import { resolveTrimmedIconOrDefault } from '../resolveTrimmedIconOrDefault'

test('resolveTrimmedIconOrDefault returns trimmed icon when non-empty', () => {
  expect(resolveTrimmedIconOrDefault(' fa-solid fa-dragon ', 'mdi-file-outline')).toBe('fa-solid fa-dragon')
})

test('resolveTrimmedIconOrDefault falls back for empty or whitespace icon', () => {
  expect(resolveTrimmedIconOrDefault('', 'mdi-file-outline')).toBe('mdi-file-outline')
  expect(resolveTrimmedIconOrDefault('  ', 'mdi-file-outline')).toBe('mdi-file-outline')
})
