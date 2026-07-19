import { expect, test } from 'vitest'

import {
  normalizeOpenedDocumentTabEditState,
  resolveOpenedDocumentDisplayNameFromTab,
  resolveOpenedDocumentTabIsInEditMode,
  resolveOpenedDocumentTabIsInPreviewMode
} from '../openedDocumentEditStateDomain'
import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

const sampleTab: I_faOpenedDocumentTab = {
  documentId: 'doc-1',
  persistenceState: 'persisted',
  tabLabel: 'Character',
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
  hasUnsavedChanges: false,
  editState: FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE
}

/**
 * openedDocumentEditStateDomain preview and edit mode flags
 */
test('Test that resolveOpenedDocumentTabIsInPreviewMode is true when editState is off', () => {
  expect(resolveOpenedDocumentTabIsInPreviewMode(false)).toBe(true)
  expect(resolveOpenedDocumentTabIsInEditMode(false)).toBe(false)
})

test('Test that resolveOpenedDocumentTabIsInEditMode is true when editState is on', () => {
  expect(resolveOpenedDocumentTabIsInEditMode(true)).toBe(true)
  expect(resolveOpenedDocumentTabIsInPreviewMode(true)).toBe(false)
})

test('Test that resolveOpenedDocumentDisplayNameFromTab prefers trimmed draft text', () => {
  expect(resolveOpenedDocumentDisplayNameFromTab({
    displayNameDraft: '  Renamed  ',
    tabLabel: 'Character'
  })).toBe('Renamed')
  expect(resolveOpenedDocumentDisplayNameFromTab({
    displayNameDraft: '   ',
    tabLabel: 'Character'
  })).toBe('Character')
})

test('Test that normalizeOpenedDocumentTabEditState defaults missing editState to preview mode', () => {
  const legacyTab = {
    ...sampleTab,
    editState: undefined as unknown as boolean
  }
  const normalized = normalizeOpenedDocumentTabEditState(legacyTab)
  expect(normalized.editState).toBe(false)
})
