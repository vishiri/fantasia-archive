import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { resolveFaOpenedDocumentsActiveDocumentSyncTarget } from 'app/src/stores/scripts/faOpenedDocumentsTabSessionWiring'

const sampleTab: I_faOpenedDocumentTab = {
  displayNameDraft: 'Doc A',
  documentId: 'doc-a',
  persistenceState: 'persisted',
  hasUnsavedChanges: false,
  editState: false,
  savedDisplayName: 'Doc A',
  documentTextColorDraft: '',
  savedDocumentTextColor: '',
  documentBackgroundColorDraft: '',
  savedDocumentBackgroundColor: '',
  isCategoryDraft: false,
  savedIsCategory: false,
  isFinishedDraft: false,
  isMinorDraft: false,
  isDeadDraft: false,
  savedIsFinished: false,
  savedIsMinor: false,
  savedIsDead: false,
  parentDocumentIdDraft: '',
  savedParentDocumentId: '',
  tabLabel: 'Doc A',
  templateIcon: 'mdi-file'
}

test('Test that resolveFaOpenedDocumentsActiveDocumentSyncTarget follows document workspace routes', () => {
  expect(resolveFaOpenedDocumentsActiveDocumentSyncTarget({
    currentActiveDocumentId: 'doc-b',
    routeDocumentId: 'doc-a',
    routePath: '/home/document/doc-a',
    tabs: [sampleTab]
  })).toBe('doc-a')
})

test('Test that resolveFaOpenedDocumentsActiveDocumentSyncTarget clears active tab on workspace overview', () => {
  expect(resolveFaOpenedDocumentsActiveDocumentSyncTarget({
    currentActiveDocumentId: 'doc-a',
    routeDocumentId: null,
    routePath: '/home',
    tabs: [sampleTab]
  })).toBeNull()
})

test('Test that resolveFaOpenedDocumentsActiveDocumentSyncTarget ignores unknown document routes', () => {
  expect(resolveFaOpenedDocumentsActiveDocumentSyncTarget({
    currentActiveDocumentId: 'doc-a',
    routeDocumentId: 'doc-missing',
    routePath: '/home/document/doc-missing',
    tabs: [sampleTab]
  })).toBe('doc-a')
})
