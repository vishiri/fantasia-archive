import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  applyFaOpenedDocumentIsDeadDraft,
  applyFaOpenedDocumentIsFinishedDraft,
  applyFaOpenedDocumentIsMinorDraft
} from '../openedDocumentTabStatusFlagDraftWiring'

const baseTab: I_faOpenedDocumentTab = {
  documentId: 'doc-1',
  persistenceState: 'persisted',
  tabLabel: 'Hero',
  templateIcon: 'mdi-account',
  displayNameDraft: 'Hero',
  savedDisplayName: 'Hero',
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
  treeOrderNumberDraft: '',
  savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
  extraClassesDraft: '',
  savedExtraClasses: '',
  hasUnsavedChanges: false,
  editState: false
}

test('Test that applyFaOpenedDocumentIsFinishedDraft marks unsaved changes', () => {
  const next = applyFaOpenedDocumentIsFinishedDraft(baseTab, true)
  expect(next.isFinishedDraft).toBe(true)
  expect(next.hasUnsavedChanges).toBe(true)
})

test('Test that applyFaOpenedDocumentIsMinorDraft marks unsaved changes', () => {
  const next = applyFaOpenedDocumentIsMinorDraft(baseTab, true)
  expect(next.isMinorDraft).toBe(true)
  expect(next.hasUnsavedChanges).toBe(true)
})

test('Test that applyFaOpenedDocumentIsDeadDraft marks unsaved changes', () => {
  const next = applyFaOpenedDocumentIsDeadDraft(baseTab, true)
  expect(next.isDeadDraft).toBe(true)
  expect(next.hasUnsavedChanges).toBe(true)
})
