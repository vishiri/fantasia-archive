import { expect, test } from 'vitest'

import {
  appendOpenedDocumentTabToRight,
  computeOpenedDocumentHasUnsavedChanges,
  findOpenedDocumentTabIndexByDocumentId,
  removeOpenedDocumentTabAtIndex,
  resolveOpenedDocumentTabFocusIndexAfterClose
} from '../openedDocumentTabDomain'

const sampleTab = {
  documentId: 'doc-1',
  tabLabel: 'Doc',
  templateIcon: 'mdi-feather',
  displayNameDraft: 'Draft',
  savedDisplayName: 'Saved',
  hasUnsavedChanges: true,
  editState: false
}

/**
 * openedDocumentTabDomain helpers
 */
test('Test that computeOpenedDocumentHasUnsavedChanges compares draft to saved baseline', () => {
  expect(computeOpenedDocumentHasUnsavedChanges('A', 'B')).toBe(true)
  expect(computeOpenedDocumentHasUnsavedChanges('Same', 'Same')).toBe(false)
})

test('Test that appendOpenedDocumentTabToRight keeps uniqueness by append order', () => {
  const next = appendOpenedDocumentTabToRight([], sampleTab)
  expect(next).toHaveLength(1)
  expect(next[0]?.documentId).toBe('doc-1')
})

test('Test that resolveOpenedDocumentTabFocusIndexAfterClose prefers right neighbor', () => {
  expect(resolveOpenedDocumentTabFocusIndexAfterClose(1, 2)).toBe(1)
  expect(resolveOpenedDocumentTabFocusIndexAfterClose(2, 2)).toBe(1)
  expect(resolveOpenedDocumentTabFocusIndexAfterClose(0, 0)).toBe(-1)
})

test('Test that findOpenedDocumentTabIndexByDocumentId returns index or negative one', () => {
  const tabs = appendOpenedDocumentTabToRight([], sampleTab)
  expect(findOpenedDocumentTabIndexByDocumentId(tabs, 'doc-1')).toBe(0)
  expect(findOpenedDocumentTabIndexByDocumentId(tabs, 'missing')).toBe(-1)
})

test('Test that removeOpenedDocumentTabAtIndex removes only the requested row', () => {
  const tabs = [
    sampleTab,
    {
      ...sampleTab,
      documentId: 'doc-2'
    }
  ]
  const next = removeOpenedDocumentTabAtIndex(tabs, 0)
  expect(next).toHaveLength(1)
  expect(next[0]?.documentId).toBe('doc-2')
})
