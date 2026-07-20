import { expect, test } from 'vitest'

import { FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY } from 'app/types/I_faDocumentTreeOrderNumber'

import {
  isFaDocumentTreeOrderNumberEmpty,
  normalizeOpenedDocumentTreeOrderNumberFromDb,
  resolveFaDocumentTreeOrderNumberBadgeLabel,
  resolveOpenedDocumentTreeOrderNumberDraftForPersist
} from '../openedDocumentTreeOrderNumber'

test('Test that isFaDocumentTreeOrderNumberEmpty recognizes the sentinel', () => {
  expect(isFaDocumentTreeOrderNumberEmpty(FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY)).toBe(true)
  expect(isFaDocumentTreeOrderNumberEmpty(42)).toBe(false)
})

test('Test that normalizeOpenedDocumentTreeOrderNumberFromDb maps empty sentinel to blank draft', () => {
  expect(normalizeOpenedDocumentTreeOrderNumberFromDb(FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY)).toBe('')
  expect(normalizeOpenedDocumentTreeOrderNumberFromDb(null)).toBe('')
  expect(normalizeOpenedDocumentTreeOrderNumberFromDb(12)).toBe('12')
})

test('Test that resolveOpenedDocumentTreeOrderNumberDraftForPersist maps blank draft to sentinel', () => {
  expect(resolveOpenedDocumentTreeOrderNumberDraftForPersist('')).toBe(
    FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY
  )
  expect(resolveOpenedDocumentTreeOrderNumberDraftForPersist('  ')).toBe(
    FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY
  )
  expect(resolveOpenedDocumentTreeOrderNumberDraftForPersist('7')).toBe(7)
  expect(resolveOpenedDocumentTreeOrderNumberDraftForPersist('7.9')).toBe(7)
  expect(resolveOpenedDocumentTreeOrderNumberDraftForPersist('abc')).toBe(
    FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY
  )
})

test('Test that resolveFaDocumentTreeOrderNumberBadgeLabel returns null for empty values', () => {
  expect(resolveFaDocumentTreeOrderNumberBadgeLabel(FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY)).toBeNull()
  expect(resolveFaDocumentTreeOrderNumberBadgeLabel(null)).toBeNull()
  expect(resolveFaDocumentTreeOrderNumberBadgeLabel(3)).toBe('3')
})
