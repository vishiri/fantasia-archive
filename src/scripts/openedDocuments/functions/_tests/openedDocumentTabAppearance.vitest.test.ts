import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY } from 'app/types/I_faDocumentTreeOrderNumber'

import { normalizeOpenedDocumentAppearanceColorFromDb } from '../openedDocumentNullableStringFromDb'
import {
  computeOpenedDocumentHasUnsavedChanges,
  normalizeOpenedDocumentTabAppearanceColors,
  resolveOpenedDocumentAppearanceColorDraftForPersist,
  resolveOpenedDocumentHydrateUnsavedDraft
} from '../openedDocumentTabAppearance'
import { recomputeOpenedDocumentTabHasUnsavedChanges } from '../../openedDocumentTabAppearanceWiring'

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
  savedTreeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
  extraClassesDraft: '',
  savedExtraClasses: '',
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
  expect(resolveOpenedDocumentAppearanceColorDraftForPersist('#abc')).toBe('#AABBCC')
  expect(resolveOpenedDocumentAppearanceColorDraftForPersist('red')).toBeNull()
  expect(resolveOpenedDocumentAppearanceColorDraftForPersist('#aabbccff')).toBeNull()
  expect(resolveOpenedDocumentAppearanceColorDraftForPersist('#GGGGGG')).toBeNull()
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
  expect(normalized.savedTreeOrderNumber).toBe(FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY)
  expect(normalized.tagsDraft).toBeUndefined()
  expect(normalized.savedTags).toBeUndefined()
})

test('Test that normalizeOpenedDocumentTabAppearanceColors stores only #RRGGBB colors', () => {
  const normalized = normalizeOpenedDocumentTabAppearanceColors({
    ...baseTab,
    documentTextColorDraft: '#abc',
    savedDocumentTextColor: '#aabbccff'
  })
  expect(normalized.documentTextColorDraft).toBe('#AABBCC')
  expect(normalized.savedDocumentTextColor).toBe('')
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
    treeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    savedTreeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    extraClassesDraft: '',
    savedExtraClasses: '',
    tagsDraftFingerprint: '',
    savedTagsFingerprint: '',
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
    treeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    savedTreeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    extraClassesDraft: '',
    savedExtraClasses: '',
    tagsDraftFingerprint: '',
    savedTagsFingerprint: '',
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
    treeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    savedTreeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    extraClassesDraft: '',
    savedExtraClasses: '',
    tagsDraftFingerprint: '',
    savedTagsFingerprint: '',
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
    treeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    savedTreeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    extraClassesDraft: '',
    savedExtraClasses: '',
    tagsDraftFingerprint: '',
    savedTagsFingerprint: '',
  })).toBe(false)
})

test('Test that computeOpenedDocumentHasUnsavedChanges ignores hex letter case', () => {
  const sameColor = {
    displayNameDraft: 'Hero',
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#aabbcc',
    isCategoryDraft: false,
    isFinishedDraft: false,
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
    treeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    savedTreeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    extraClassesDraft: '',
    savedExtraClasses: '',
    tagsDraftFingerprint: '',
    savedTagsFingerprint: ''
  }
  expect(computeOpenedDocumentHasUnsavedChanges(sameColor)).toBe(false)
  expect(computeOpenedDocumentHasUnsavedChanges({
    ...sameColor,
    documentBackgroundColorDraft: '#112233 '
  })).toBe(true)
  expect(computeOpenedDocumentHasUnsavedChanges({
    ...sameColor,
    documentTextColorDraft: '#abc'
  })).toBe(true)
  expect(computeOpenedDocumentHasUnsavedChanges({
    ...sameColor,
    documentTextColorDraft: 'nope'
  })).toBe(true)
})

test('Test that recomputeOpenedDocumentTabHasUnsavedChanges ignores saved tags while the draft is unloaded', () => {
  expect(recomputeOpenedDocumentTabHasUnsavedChanges({
    ...baseTab,
    savedTags: [{
      id: 'tag-1',
      name: 'Villain'
    }]
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
    treeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    savedTreeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    extraClassesDraft: '',
    savedExtraClasses: '',
    tagsDraftFingerprint: '',
    savedTagsFingerprint: '',
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
    treeOrderNumber: 7,
    savedTreeOrderNumber: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    extraClassesDraft: '',
    savedExtraClasses: '',
    tagsDraftFingerprint: '',
    savedTagsFingerprint: ''
  })).toBe(true)
})

test('Test that resolveOpenedDocumentHydrateUnsavedDraft keeps an edited draft', () => {
  expect(resolveOpenedDocumentHydrateUnsavedDraft({
    databaseDraft: '7',
    hasUnsavedChanges: true,
    missingDraft: '',
    missingSaved: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    snapshotDraft: '',
    snapshotSaved: 7
  })).toBe('')
})

test('Test that resolveOpenedDocumentHydrateUnsavedDraft fills a field the snapshot never stored', () => {
  expect(resolveOpenedDocumentHydrateUnsavedDraft({
    databaseDraft: '7',
    hasUnsavedChanges: true,
    missingDraft: '',
    missingSaved: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY,
    snapshotDraft: '',
    snapshotSaved: FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY
  })).toBe('7')
})

test('Test that resolveOpenedDocumentHydrateUnsavedDraft uses the database when the tab is clean', () => {
  expect(resolveOpenedDocumentHydrateUnsavedDraft({
    databaseDraft: false,
    hasUnsavedChanges: false,
    missingDraft: false,
    missingSaved: false,
    snapshotDraft: true,
    snapshotSaved: false
  })).toBe(false)
})

test('Test that recomputeOpenedDocumentTabHasUnsavedChanges treats non-finite tree order drafts as empty', () => {
  expect(recomputeOpenedDocumentTabHasUnsavedChanges({
    ...baseTab,
    treeOrderNumberDraft: 'not-a-number'
  })).toBe(false)
})
