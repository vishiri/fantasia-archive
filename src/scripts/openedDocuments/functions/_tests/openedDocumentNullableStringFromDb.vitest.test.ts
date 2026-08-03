import { expect, test } from 'vitest'

import {
  normalizeOpenedDocumentAppearanceColorFromDb,
  normalizeOpenedDocumentExtraClassesFromDb,
  normalizeOpenedDocumentNullableStringFromDb,
  normalizeOpenedDocumentParentIdFromDb
} from '../openedDocumentNullableStringFromDb'

/**
 * normalizeOpenedDocumentNullableStringFromDb
 * Shared nullish SQLite string → empty session baseline.
 */
test('Test that normalizeOpenedDocumentNullableStringFromDb maps nullish to empty string', () => {
  expect(normalizeOpenedDocumentNullableStringFromDb(null)).toBe('')
  expect(normalizeOpenedDocumentNullableStringFromDb(undefined)).toBe('')
  expect(normalizeOpenedDocumentNullableStringFromDb('kept')).toBe('kept')
})

/**
 * Alias exports share the same null→empty behavior.
 */
test('Test that opened-document null string aliases reuse shared normalizer', () => {
  expect(normalizeOpenedDocumentParentIdFromDb(null)).toBe('')
  expect(normalizeOpenedDocumentExtraClassesFromDb(undefined)).toBe('')
  expect(normalizeOpenedDocumentAppearanceColorFromDb('#AABBCC')).toBe('#AABBCC')
})
