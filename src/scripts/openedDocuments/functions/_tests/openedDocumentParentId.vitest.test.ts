import { expect, test } from 'vitest'

import {
  normalizeOpenedDocumentParentIdFromDb
} from '../openedDocumentNullableStringFromDb'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  remapOpenedDocumentTabParentAfterDeletedDocument,
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

function parentTab (patch: Partial<I_faOpenedDocumentTab>): I_faOpenedDocumentTab {
  return {
    displayNameDraft: 'Child',
    documentBackgroundColorDraft: '',
    documentId: 'doc-child',
    documentTextColorDraft: '',
    editState: false,
    extraClassesDraft: '',
    hasUnsavedChanges: false,
    isCategoryDraft: false,
    isDeadDraft: false,
    isFinishedDraft: false,
    isMinorDraft: false,
    parentDocumentIdDraft: 'doc-deleted',
    persistenceState: 'persisted',
    savedDisplayName: 'Child',
    savedDocumentBackgroundColor: '',
    savedDocumentTextColor: '',
    savedExtraClasses: '',
    savedIsCategory: false,
    savedIsDead: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedParentDocumentId: 'doc-deleted',
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
    tabLabel: 'Child',
    templateIcon: 'mdi-account',
    treeOrderNumberDraft: '',
    ...patch
  }
}

test('Test that remapOpenedDocumentTabParentAfterDeletedDocument follows the promoted parent', () => {
  const next = remapOpenedDocumentTabParentAfterDeletedDocument(
    parentTab({
      parentDocumentId: 'doc-deleted'
    }),
    'doc-deleted',
    'doc-root'
  )
  expect(next?.parentDocumentIdDraft).toBe('doc-root')
  expect(next?.savedParentDocumentId).toBe('doc-root')
  expect(next?.parentDocumentId).toBe('doc-root')
})

test('Test that remapOpenedDocumentTabParentAfterDeletedDocument keeps a user-edited parent draft', () => {
  const next = remapOpenedDocumentTabParentAfterDeletedDocument(
    parentTab({
      parentDocumentIdDraft: 'other-parent'
    }),
    'doc-deleted',
    'doc-root'
  )
  expect(next?.parentDocumentIdDraft).toBe('other-parent')
  expect(next?.savedParentDocumentId).toBe('doc-root')
})

test('Test that remapOpenedDocumentTabParentAfterDeletedDocument ignores unrelated tabs', () => {
  expect(remapOpenedDocumentTabParentAfterDeletedDocument(
    parentTab({
      parentDocumentIdDraft: '',
      savedParentDocumentId: ''
    }),
    'doc-deleted',
    'doc-root'
  )).toBeNull()
})

test('Test that remapOpenedDocumentTabParentAfterDeletedDocument maps an empty promoted parent to null', () => {
  const next = remapOpenedDocumentTabParentAfterDeletedDocument(
    parentTab({
      parentDocumentId: 'doc-deleted'
    }),
    'doc-deleted',
    ''
  )
  expect(next?.parentDocumentId).toBeNull()
  expect(next?.parentDocumentIdDraft).toBe('')
})
