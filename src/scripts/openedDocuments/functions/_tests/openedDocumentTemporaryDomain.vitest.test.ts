import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  applyTemporaryOpenedDocumentParent,
  createTemporaryOpenedDocumentTabSeed,
  normalizeOpenedDocumentTabPersistenceState,
  promoteTemporaryOpenedDocumentTabAfterCreate,
  remapOpenedDocumentTabDocumentId,
  resolveOpenedDocumentTabIsPersisted,
  resolveOpenedDocumentTabIsTemporary,
  resolveTemporaryOpenedDocumentDisplayNameForSave,
  resolveTemporaryOpenedDocumentParentDocumentId
} from '../openedDocumentTemporaryDomain'

test('Test that createTemporaryOpenedDocumentTabSeed starts in edit mode with unsaved changes', () => {
  const tab = createTemporaryOpenedDocumentTabSeed({
    displayName: 'Aria',
    documentId: 'temp-1',
    parentDocumentId: null,
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })

  expect(tab.persistenceState).toBe('temporary')
  expect(tab.editState).toBe(true)
  expect(tab.hasUnsavedChanges).toBe(true)
  expect(tab.worldId).toBe('world-1')
})

test('Test that promoteTemporaryOpenedDocumentTabAfterCreate clears temporary metadata', () => {
  const tab = createTemporaryOpenedDocumentTabSeed({
    displayName: 'Aria',
    documentId: 'temp-1',
    parentDocumentId: 'parent-1',
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  const promoted = promoteTemporaryOpenedDocumentTabAfterCreate(tab, {
    documentId: 'saved-1',
    keepEditMode: false,
    savedDisplayName: 'Aria'
  })

  expect(promoted.persistenceState).toBe('persisted')
  expect(promoted.worldId).toBeUndefined()
  expect(promoted.hasUnsavedChanges).toBe(false)
})

test('Test that resolveTemporaryOpenedDocumentDisplayNameForSave uses the unnamed fallback', () => {
  const displayName = resolveTemporaryOpenedDocumentDisplayNameForSave({
    displayNameDraft: '   ',
    formatUnnamedFallback: (templateSingular) => `Unnamed - ${templateSingular}`,
    templateSingularTitle: 'Character'
  })

  expect(displayName).toBe('Unnamed - Character')
})

test('Test that normalizeOpenedDocumentTabPersistenceState defaults legacy rows to persisted', () => {
  const normalized = normalizeOpenedDocumentTabPersistenceState({
    documentId: 'doc-1',
    displayNameDraft: 'Hero',
    editState: false,
    hasUnsavedChanges: false,
    savedDisplayName: 'Hero',
    tabLabel: 'Hero',
    templateIcon: 'mdi-account'
  } as I_faOpenedDocumentTab)

  expect(normalized.persistenceState).toBe('persisted')
})

test('Test that applyTemporaryOpenedDocumentParent updates only the parent id', () => {
  const tab = createTemporaryOpenedDocumentTabSeed({
    displayName: 'Aria',
    documentId: 'temp-1',
    parentDocumentId: null,
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  const nextTab = applyTemporaryOpenedDocumentParent(tab, 'parent-2')

  expect(nextTab.parentDocumentId).toBe('parent-2')
})

test('Test that remapOpenedDocumentTabDocumentId replaces the tab document id', () => {
  const tab = createTemporaryOpenedDocumentTabSeed({
    displayName: 'Aria',
    documentId: 'temp-1',
    parentDocumentId: null,
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  const remapped = remapOpenedDocumentTabDocumentId(tab, 'saved-1')

  expect(remapped.documentId).toBe('saved-1')
})

test('Test that resolveOpenedDocumentTabIsPersisted and resolveOpenedDocumentTabIsTemporary classify persistence state', () => {
  expect(resolveOpenedDocumentTabIsTemporary('temporary')).toBe(true)
  expect(resolveOpenedDocumentTabIsPersisted('persisted')).toBe(true)
  expect(resolveOpenedDocumentTabIsPersisted('temporary')).toBe(false)
})

test('Test that normalizeOpenedDocumentTabPersistenceState normalizes temporary parentDocumentId to null', () => {
  const tab = createTemporaryOpenedDocumentTabSeed({
    displayName: 'Aria',
    documentId: 'temp-1',
    parentDocumentId: null,
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  const normalized = normalizeOpenedDocumentTabPersistenceState({
    ...tab,
    parentDocumentId: undefined
  })

  expect(normalized.parentDocumentId).toBeNull()
})

test('Test that resolveTemporaryOpenedDocumentParentDocumentId defaults undefined to null', () => {
  expect(resolveTemporaryOpenedDocumentParentDocumentId({})).toBeNull()
  expect(resolveTemporaryOpenedDocumentParentDocumentId({
    parentDocumentId: 'parent-1'
  })).toBe('parent-1')
})

test('Test that resolveTemporaryOpenedDocumentDisplayNameForSave keeps a trimmed draft', () => {
  const displayName = resolveTemporaryOpenedDocumentDisplayNameForSave({
    displayNameDraft: '  Hero  ',
    formatUnnamedFallback: () => 'fallback',
    templateSingularTitle: 'Character'
  })

  expect(displayName).toBe('Hero')
})

test('Test that promoteTemporaryOpenedDocumentTabAfterCreate can keep edit mode open', () => {
  const tab = createTemporaryOpenedDocumentTabSeed({
    displayName: 'Aria',
    documentId: 'temp-1',
    parentDocumentId: null,
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  const promoted = promoteTemporaryOpenedDocumentTabAfterCreate(tab, {
    documentId: 'saved-1',
    keepEditMode: true,
    savedDisplayName: 'Aria'
  })

  expect(promoted.editState).toBe(true)
})
