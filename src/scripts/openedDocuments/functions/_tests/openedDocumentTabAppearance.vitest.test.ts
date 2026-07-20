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
    savedDocumentTextColor: undefined as unknown as string,
    isCategoryDraft: undefined as unknown as boolean,
    isFinishedDraft: undefined as unknown as boolean,
    isMinorDraft: undefined as unknown as boolean,
    isDeadDraft: undefined as unknown as boolean,
    savedIsCategory: undefined as unknown as boolean,
    savedIsFinished: undefined as unknown as boolean,
    savedIsMinor: undefined as unknown as boolean,
    savedIsDead: undefined as unknown as boolean,
    savedTreeOrderNumber: undefined as unknown as number
  })
  expect(normalized.documentTextColorDraft).toBe('')
  expect(normalized.savedDocumentTextColor).toBe('')
  expect(normalized.documentBackgroundColorDraft).toBe('')
  expect(normalized.savedDocumentBackgroundColor).toBe('')
  expect(normalized.isFinishedDraft).toBe(false)
  expect(normalized.isMinorDraft).toBe(false)
  expect(normalized.isDeadDraft).toBe(false)
  expect(normalized.savedIsFinished).toBe(false)
  expect(normalized.savedIsMinor).toBe(false)
  expect(normalized.savedIsDead).toBe(false)
  expect(normalized.savedTreeOrderNumber).toBe(Number.MIN_SAFE_INTEGER)
})

/**
 * computeOpenedDocumentHasUnsavedChanges
 * Detects finished / minor / dead draft drift.
 */
test('Test that computeOpenedDocumentHasUnsavedChanges detects status flag drift', () => {
  expect(computeOpenedDocumentHasUnsavedChanges({
    displayNameDraft: 'Hero',
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#AABBCC',
    isCategoryDraft: false,
    isFinishedDraft: true,
    isMinorDraft: false,
    isDeadDraft: false,
    savedDisplayName: 'Hero',
    savedDocumentBackgroundColor: '#112233',
    savedDocumentTextColor: '#AABBCC',
    savedIsCategory: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedIsDead: false,
    parentDocumentIdDraft: '',
    savedParentDocumentId: '',
    treeOrderNumberDraft: '',
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
  })).toBe(true)
  expect(computeOpenedDocumentHasUnsavedChanges({
    displayNameDraft: 'Hero',
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#AABBCC',
    isCategoryDraft: false,
    isFinishedDraft: false,
    isMinorDraft: true,
    isDeadDraft: false,
    savedDisplayName: 'Hero',
    savedDocumentBackgroundColor: '#112233',
    savedDocumentTextColor: '#AABBCC',
    savedIsCategory: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedIsDead: false,
    parentDocumentIdDraft: '',
    savedParentDocumentId: '',
    treeOrderNumberDraft: '',
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
  })).toBe(true)
  expect(computeOpenedDocumentHasUnsavedChanges({
    displayNameDraft: 'Hero',
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#AABBCC',
    isCategoryDraft: false,
    isFinishedDraft: false,
    isMinorDraft: false,
    isDeadDraft: true,
    savedDisplayName: 'Hero',
    savedDocumentBackgroundColor: '#112233',
    savedDocumentTextColor: '#AABBCC',
    savedIsCategory: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedIsDead: false,
    parentDocumentIdDraft: '',
    savedParentDocumentId: '',
    treeOrderNumberDraft: '',
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
  })).toBe(true)
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
    isCategoryDraft: false,
    savedDisplayName: 'Hero',
    savedDocumentBackgroundColor: '#112233',
    savedDocumentTextColor: '#AABBCC',
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
  })).toBe(false)
})

test('Test that computeOpenedDocumentHasUnsavedChanges detects parent id drift', () => {
  expect(computeOpenedDocumentHasUnsavedChanges({
    displayNameDraft: 'Hero',
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#AABBCC',
    isCategoryDraft: false,
    isFinishedDraft: false,
    isMinorDraft: false,
    isDeadDraft: false,
    parentDocumentIdDraft: 'parent-2',
    savedDisplayName: 'Hero',
    savedDocumentBackgroundColor: '#112233',
    savedDocumentTextColor: '#AABBCC',
    savedIsCategory: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedIsDead: false,
    savedParentDocumentId: 'parent-1',
    treeOrderNumberDraft: '',
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
  })).toBe(true)
})

test('Test that computeOpenedDocumentHasUnsavedChanges detects tree order drift', () => {
  expect(computeOpenedDocumentHasUnsavedChanges({
    displayNameDraft: 'Hero',
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#AABBCC',
    isCategoryDraft: false,
    isFinishedDraft: false,
    isMinorDraft: false,
    isDeadDraft: false,
    parentDocumentIdDraft: '',
    savedDisplayName: 'Hero',
    savedDocumentBackgroundColor: '#112233',
    savedDocumentTextColor: '#AABBCC',
    savedIsCategory: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedIsDead: false,
    savedParentDocumentId: '',
    treeOrderNumberDraft: '7',
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER
  })).toBe(true)
})

test('Test that computeOpenedDocumentHasUnsavedChanges treats non-finite tree order drafts as empty', () => {
  expect(computeOpenedDocumentHasUnsavedChanges({
    displayNameDraft: 'Hero',
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#AABBCC',
    isCategoryDraft: false,
    isFinishedDraft: false,
    isMinorDraft: false,
    isDeadDraft: false,
    parentDocumentIdDraft: '',
    savedDisplayName: 'Hero',
    savedDocumentBackgroundColor: '#112233',
    savedDocumentTextColor: '#AABBCC',
    savedIsCategory: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedIsDead: false,
    savedParentDocumentId: '',
    treeOrderNumberDraft: 'not-a-number',
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER
  })).toBe(false)
})
