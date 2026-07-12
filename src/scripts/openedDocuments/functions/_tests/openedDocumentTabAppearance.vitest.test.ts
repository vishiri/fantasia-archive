import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  computeOpenedDocumentHasUnsavedChanges,
  normalizeOpenedDocumentAppearanceColorFromDb,
  normalizeOpenedDocumentTabAppearanceColors,
  recomputeOpenedDocumentTabHasUnsavedChanges,
  resolveOpenedDocumentAppearanceColorDraftForPersist
} from '../openedDocumentTabAppearance'

const baseTab: I_faOpenedDocumentTab = {
  documentId: 'doc-1',
  persistenceState: 'persisted',
  tabLabel: 'Hero',
  templateIcon: 'mdi-account',
  displayNameDraft: 'Hero',
  savedDisplayName: 'Hero',
  documentTextColorDraft: '#AABBCC',
  savedDocumentTextColor: '#AABBCC',
  documentBackgroundColorDraft: '#112233',
  savedDocumentBackgroundColor: '#112233',
  hasUnsavedChanges: false,
  editState: false
}

/**
 * normalizeOpenedDocumentAppearanceColorFromDb
 * Maps nullable SQLite colors to tab session empty-string baseline.
 */
test('Test that normalizeOpenedDocumentAppearanceColorFromDb maps nullish to empty string', () => {
  expect(normalizeOpenedDocumentAppearanceColorFromDb(null)).toBe('')
  expect(normalizeOpenedDocumentAppearanceColorFromDb(undefined)).toBe('')
  expect(normalizeOpenedDocumentAppearanceColorFromDb('#AABBCC')).toBe('#AABBCC')
})

/**
 * resolveOpenedDocumentAppearanceColorDraftForPersist
 * Maps tab drafts to nullable SQLite values.
 */
test('Test that resolveOpenedDocumentAppearanceColorDraftForPersist trims and uppercases colors', () => {
  expect(resolveOpenedDocumentAppearanceColorDraftForPersist('')).toBeNull()
  expect(resolveOpenedDocumentAppearanceColorDraftForPersist('   ')).toBeNull()
  expect(resolveOpenedDocumentAppearanceColorDraftForPersist(' #aabbcc ')).toBe('#AABBCC')
})

/**
 * normalizeOpenedDocumentTabAppearanceColors
 * Ensures tab rows always carry appearance color baselines.
 */
test('Test that normalizeOpenedDocumentTabAppearanceColors fills missing color fields', () => {
  const normalized = normalizeOpenedDocumentTabAppearanceColors({
    ...baseTab,
    documentBackgroundColorDraft: undefined as unknown as string,
    documentTextColorDraft: undefined as unknown as string,
    savedDocumentBackgroundColor: undefined as unknown as string,
    savedDocumentTextColor: undefined as unknown as string
  })
  expect(normalized.documentTextColorDraft).toBe('')
  expect(normalized.savedDocumentTextColor).toBe('')
  expect(normalized.documentBackgroundColorDraft).toBe('')
  expect(normalized.savedDocumentBackgroundColor).toBe('')
})

/**
 * recomputeOpenedDocumentTabHasUnsavedChanges
 * Recomputes dirty state from tab draft and saved fields.
 */
test('Test that recomputeOpenedDocumentTabHasUnsavedChanges detects background color drift', () => {
  expect(recomputeOpenedDocumentTabHasUnsavedChanges({
    ...baseTab,
    documentBackgroundColorDraft: '#445566'
  })).toBe(true)
  expect(computeOpenedDocumentHasUnsavedChanges({
    displayNameDraft: 'Hero',
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#AABBCC',
    savedDisplayName: 'Hero',
    savedDocumentBackgroundColor: '#112233',
    savedDocumentTextColor: '#AABBCC'
  })).toBe(false)
})
