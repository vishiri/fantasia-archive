import { expect, test } from 'vitest'

import {
  normalizeOpenedDocumentParentIdFromDb,
  resolveOpenedDocumentParentIdDraftForPersist,
  resolveOpenedDocumentParentMoveAppendSortOrder
} from '../openedDocumentParentId'

test('Test that normalizeOpenedDocumentParentIdFromDb maps nullish to empty string', () => {
  expect(normalizeOpenedDocumentParentIdFromDb(null)).toBe('')
  expect(normalizeOpenedDocumentParentIdFromDb(undefined)).toBe('')
  expect(normalizeOpenedDocumentParentIdFromDb('parent-1')).toBe('parent-1')
})

test('Test that resolveOpenedDocumentParentIdDraftForPersist trims and maps empty to null', () => {
  expect(resolveOpenedDocumentParentIdDraftForPersist('')).toBeNull()
  expect(resolveOpenedDocumentParentIdDraftForPersist('   ')).toBeNull()
  expect(resolveOpenedDocumentParentIdDraftForPersist(' parent-1 ')).toBe('parent-1')
})

test('Test that resolveOpenedDocumentParentMoveAppendSortOrder appends after max sibling', () => {
  expect(resolveOpenedDocumentParentMoveAppendSortOrder([
    {
      id: 'doc-1',
      sortOrder: 0
    },
    {
      id: 'doc-2',
      sortOrder: 2
    }
  ], 'doc-3')).toBe(3)
  expect(resolveOpenedDocumentParentMoveAppendSortOrder([
    {
      id: 'doc-1',
      sortOrder: 4
    }
  ], 'doc-1')).toBe(0)
})
