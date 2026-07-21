import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { reconcileTemporaryOpenedDocumentTabFromSnapshot } from '../faOpenedDocumentsTemporarySessionWiring'

const temporaryTab: I_faOpenedDocumentTab = {
  displayNameDraft: 'Aria',
  documentId: 'temp-1',
  editState: true,
  hasUnsavedChanges: true,
  parentDocumentId: 'parent-1',
  persistenceState: 'temporary',
  savedDisplayName: '',
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
  tabLabel: 'Character',
  templateIcon: 'mdi-account',
  templateId: 'tpl-1',
  worldId: 'world-1'
}

test('Test that reconcileTemporaryOpenedDocumentTabFromSnapshot drops tabs when world lookup fails', async () => {
  const result = await reconcileTemporaryOpenedDocumentTabFromSnapshot(temporaryTab, {
    getDocumentById: async () => ({}),
    getDocumentTemplateById: async () => ({}),
    getWorldById: async () => {
      throw new Error('missing')
    }
  })

  expect(result).toBeNull()
})

test('Test that reconcileTemporaryOpenedDocumentTabFromSnapshot clears a missing parent id', async () => {
  const result = await reconcileTemporaryOpenedDocumentTabFromSnapshot(temporaryTab, {
    getDocumentById: async () => {
      throw new Error('missing')
    },
    getDocumentTemplateById: async () => ({}),
    getWorldById: async () => ({})
  })

  expect(result?.parentDocumentId).toBeNull()
})

test('Test that reconcileTemporaryOpenedDocumentTabFromSnapshot returns persisted tabs unchanged', async () => {
  const persistedTab: I_faOpenedDocumentTab = {
    displayNameDraft: 'Hero',
    documentId: 'doc-1',
    editState: false,
    hasUnsavedChanges: false,
    persistenceState: 'persisted',
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
    tabLabel: 'Hero',
    templateIcon: 'mdi-account'
  }
  const result = await reconcileTemporaryOpenedDocumentTabFromSnapshot(persistedTab, {
    getDocumentById: async () => {
      throw new Error('unused')
    },
    getDocumentTemplateById: async () => {
      throw new Error('unused')
    },
    getWorldById: async () => {
      throw new Error('unused')
    }
  })

  expect(result).toEqual(persistedTab)
})

test('Test that reconcileTemporaryOpenedDocumentTabFromSnapshot keeps valid temporary tabs', async () => {
  const result = await reconcileTemporaryOpenedDocumentTabFromSnapshot(temporaryTab, {
    getDocumentById: async () => ({}),
    getDocumentTemplateById: async () => ({}),
    getWorldById: async () => ({})
  })

  expect(result).toEqual(temporaryTab)
})

test('Test that reconcileTemporaryOpenedDocumentTabFromSnapshot drops tabs missing temporary metadata', async () => {
  const incompleteTab: I_faOpenedDocumentTab = {
    displayNameDraft: 'Aria',
    documentId: 'temp-1',
    editState: true,
    hasUnsavedChanges: true,
    persistenceState: 'temporary',
    savedDisplayName: '',
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
    tabLabel: 'Character',
    templateIcon: 'mdi-account'
  }
  const result = await reconcileTemporaryOpenedDocumentTabFromSnapshot(incompleteTab, {
    getDocumentById: async () => ({}),
    getDocumentTemplateById: async () => ({}),
    getWorldById: async () => ({})
  })

  expect(result).toBeNull()
})

test('Test that reconcileTemporaryOpenedDocumentTabFromSnapshot drops tabs when template lookup fails', async () => {
  const result = await reconcileTemporaryOpenedDocumentTabFromSnapshot(temporaryTab, {
    getDocumentById: async () => ({}),
    getDocumentTemplateById: async () => {
      throw new Error('missing')
    },
    getWorldById: async () => ({})
  })

  expect(result).toBeNull()
})
