import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  applyTemporaryOpenedDocumentParent,
  buildTemporaryDocumentParentResolveDocumentIds,
  buildTemporaryDocumentParentResolveDocumentIdsFromOpenedTab,
  createTemporaryOpenedDocumentTabCopySeed,
  createTemporaryOpenedDocumentTabSeed,
  normalizeOpenedDocumentTabPersistenceState,
  promoteTemporaryOpenedDocumentTabAfterCreate,
  remapOpenedDocumentTabDocumentId,
  resolveOpenedDocumentTabIsPersisted,
  resolveOpenedDocumentTabIsTemporary,
  resolveTemporaryDocumentParentDocumentIdForSave,
  resolveTemporaryOpenedDocumentDisplayNameForSave,
  resolveTemporaryOpenedDocumentParentDocumentId
} from '../openedDocumentTemporaryDomain'
import { computeOpenedDocumentHasUnsavedChanges } from '../openedDocumentTabAppearance'

import { resolveCopyOfDocumentDisplayName } from '../resolveCopyOfDocumentDisplayName'

test('Test that createTemporaryOpenedDocumentTabCopySeed copies appearance colors from source', () => {
  const tab = createTemporaryOpenedDocumentTabCopySeed({
    displayName: 'Copy of - Hero',
    documentBackgroundColor: '#112233',
    documentId: 'temp-copy',
    documentTextColor: '#AABBCC',
    parentDocumentId: 'doc-parent',
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })

  expect(tab.persistenceState).toBe('temporary')
  expect(tab.editState).toBe(true)
  expect(tab.hasUnsavedChanges).toBe(false)
  expect(tab.documentTextColorDraft).toBe('#AABBCC')
  expect(tab.documentBackgroundColorDraft).toBe('#112233')
  expect(tab.parentDocumentId).toBe('doc-parent')
})

test('Test that resolveCopyOfDocumentDisplayName applies translated prefix', () => {
  const displayName = resolveCopyOfDocumentDisplayName({
    formatCopyOfPrefix: ({ originalName }) => `Copy of - ${originalName}`,
    originalDisplayName: 'Hero'
  })

  expect(displayName).toBe('Copy of - Hero')
})

test('Test that createTemporaryOpenedDocumentTabSeed starts in edit mode without unsaved changes', () => {
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
  expect(tab.hasUnsavedChanges).toBe(false)
  expect(tab.savedDisplayName).toBe('Aria')
  expect(tab.worldId).toBe('world-1')
})

test('Test that createTemporaryOpenedDocumentTabSeed marks unsaved changes only after draft edits', () => {
  const tab = createTemporaryOpenedDocumentTabSeed({
    displayName: 'New character',
    documentId: 'temp-1',
    parentDocumentId: null,
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })

  expect(tab.hasUnsavedChanges).toBe(false)
  expect(computeOpenedDocumentHasUnsavedChanges({
    displayNameDraft: 'Renamed hero',
    documentBackgroundColorDraft: tab.documentBackgroundColorDraft,
    documentTextColorDraft: tab.documentTextColorDraft,
    savedDisplayName: tab.savedDisplayName,
    savedDocumentBackgroundColor: tab.savedDocumentBackgroundColor,
    savedDocumentTextColor: tab.savedDocumentTextColor
  })).toBe(true)
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
  expect(promoted.worldId).toBe('world-1')
  expect(promoted.templateId).toBeUndefined()
  expect(promoted.parentDocumentId).toBeUndefined()
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

test('Test that buildTemporaryDocumentParentResolveDocumentIds walks parent chain upward', async () => {
  const chain = await buildTemporaryDocumentParentResolveDocumentIds({
    getDocumentById: async (documentId) => {
      if (documentId === 'doc-child') {
        return { parentDocumentId: 'doc-parent' }
      }
      if (documentId === 'doc-parent') {
        return { parentDocumentId: null }
      }
      throw new Error('missing')
    },
    startDocumentId: 'doc-child'
  })

  expect(chain).toEqual(['doc-child', 'doc-parent'])
})

test('Test that resolveTemporaryDocumentParentDocumentIdForSave picks first available ancestor', () => {
  const resolved = resolveTemporaryDocumentParentDocumentIdForSave({
    chain: ['doc-child', 'doc-parent', 'doc-root'],
    isDocumentIdAvailable: (documentId) => documentId === 'doc-parent'
  })

  expect(resolved).toBe('doc-parent')
})

test('Test that resolveTemporaryDocumentParentDocumentIdForSave falls back to placement when chain is empty', () => {
  expect(resolveTemporaryDocumentParentDocumentIdForSave({
    chain: ['doc-child'],
    isDocumentIdAvailable: () => false
  })).toBeNull()
})

test('Test that createTemporaryOpenedDocumentTabSeed stores parent resolve chain', () => {
  const tab = createTemporaryOpenedDocumentTabSeed({
    displayName: 'New character',
    documentId: 'temp-1',
    parentDocumentId: 'doc-parent',
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    temporaryParentResolveDocumentIds: ['doc-parent', 'doc-root'],
    worldId: 'world-1'
  })

  expect(tab.temporaryParentResolveDocumentIds).toEqual(['doc-parent', 'doc-root'])
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

test('Test that createTemporaryOpenedDocumentTabCopySeed stores parent resolve chain', () => {
  const tab = createTemporaryOpenedDocumentTabCopySeed({
    displayName: 'Copy of - Hero',
    documentBackgroundColor: '#112233',
    documentId: 'copy-1',
    documentTextColor: '#AABBCC',
    parentDocumentId: 'doc-parent',
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    temporaryParentResolveDocumentIds: ['doc-parent', 'doc-root'],
    worldId: 'world-1'
  })

  expect(tab.temporaryParentResolveDocumentIds).toEqual(['doc-parent', 'doc-root'])
  expect(tab.hasUnsavedChanges).toBe(false)
})

test('Test that buildTemporaryDocumentParentResolveDocumentIdsFromOpenedTab uses temp tab chain', async () => {
  const sourceTab = createTemporaryOpenedDocumentTabSeed({
    displayName: 'Temp parent',
    documentId: 'temp-parent',
    parentDocumentId: 'doc-root',
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    temporaryParentResolveDocumentIds: ['doc-root'],
    worldId: 'world-1'
  })

  const chain = await buildTemporaryDocumentParentResolveDocumentIdsFromOpenedTab({
    getDocumentById: async () => {
      throw new Error('should not query database for temporary parent')
    },
    sourceTab
  })

  expect(chain).toEqual(['temp-parent', 'doc-root'])
})

test('Test that buildTemporaryDocumentParentResolveDocumentIdsFromOpenedTab walks persisted tab via database', async () => {
  const sourceTab: I_faOpenedDocumentTab = {
    documentId: 'doc-child',
    displayNameDraft: 'Child',
    documentBackgroundColorDraft: '',
    documentTextColorDraft: '',
    editState: false,
    hasUnsavedChanges: false,
    persistenceState: 'persisted',
    savedDisplayName: 'Child',
    savedDocumentBackgroundColor: '',
    savedDocumentTextColor: '',
    tabLabel: 'Character',
    templateIcon: 'mdi-account'
  }

  const chain = await buildTemporaryDocumentParentResolveDocumentIdsFromOpenedTab({
    getDocumentById: async (documentId) => {
      if (documentId === 'doc-child') {
        return { parentDocumentId: 'doc-parent' }
      }
      if (documentId === 'doc-parent') {
        return { parentDocumentId: null }
      }
      throw new Error('missing')
    },
    sourceTab
  })

  expect(chain).toEqual(['doc-child', 'doc-parent'])
})
