import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { reconcileTemporaryOpenedDocumentTabFromSnapshot, resolveTemporaryOpenedDocumentParentIdForSave } from '../faOpenedDocumentsTemporarySessionWiring'

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
      throw new Error('World not found: world-1')
    }
  })

  expect(result).toBeNull()
})

test('Test that reconcileTemporaryOpenedDocumentTabFromSnapshot keeps a surviving ancestor when the parent row is gone', async () => {
  const tabWithChain: I_faOpenedDocumentTab = {
    ...temporaryTab,
    parentDocumentIdDraft: 'parent-1',
    savedParentDocumentId: 'parent-1',
    temporaryParentResolveDocumentIds: ['parent-1', 'grandparent-1']
  }
  const result = await reconcileTemporaryOpenedDocumentTabFromSnapshot(tabWithChain, {
    getDocumentById: async (documentId) => {
      if (documentId === 'parent-1') {
        throw new Error('Document not found: parent-1')
      }
      return { id: documentId }
    },
    getDocumentTemplateById: async () => ({}),
    getWorldById: async () => ({})
  })

  expect(result?.parentDocumentId).toBe('grandparent-1')
  expect(result?.parentDocumentIdDraft).toBe('grandparent-1')
})

test('Test that reconcileTemporaryOpenedDocumentTabFromSnapshot keeps a changed draft when the original parent is gone', async () => {
  const tabWithChangedDraft: I_faOpenedDocumentTab = {
    ...temporaryTab,
    parentDocumentIdDraft: 'other-parent',
    savedParentDocumentId: 'parent-1'
  }
  const result = await reconcileTemporaryOpenedDocumentTabFromSnapshot(tabWithChangedDraft, {
    getDocumentById: async (documentId) => {
      if (documentId === 'parent-1') {
        throw new Error('Document not found: parent-1')
      }
      return { id: documentId }
    },
    getDocumentTemplateById: async () => ({}),
    getWorldById: async () => ({})
  })

  expect(result?.parentDocumentId).toBe('other-parent')
  expect(result?.parentDocumentIdDraft).toBe('other-parent')
})

test('Test that reconcileTemporaryOpenedDocumentTabFromSnapshot clears a missing parent id', async () => {
  const result = await reconcileTemporaryOpenedDocumentTabFromSnapshot(temporaryTab, {
    getDocumentById: async () => {
      throw new Error('Document not found: parent-1')
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
      throw new Error('Document template not found: tpl-1')
    },
    getWorldById: async () => ({})
  })

  expect(result).toBeNull()
})

test('Test that reconcileTemporaryOpenedDocumentTabFromSnapshot keeps a temporary tab when the read fails for another reason', async () => {
  const result = await reconcileTemporaryOpenedDocumentTabFromSnapshot(temporaryTab, {
    getDocumentById: async () => ({}),
    getDocumentTemplateById: async () => ({}),
    getWorldById: async () => {
      throw new Error('no active project database')
    }
  })

  expect(result).toEqual(temporaryTab)
})

test('Test that resolveTemporaryOpenedDocumentParentIdForSave falls back when the draft parent row is missing', async () => {
  const parentId = await resolveTemporaryOpenedDocumentParentIdForSave({
    draftParentDocumentId: 'doc-parent',
    getDocumentById: async (documentId) => {
      if (documentId === 'doc-parent') {
        throw new Error('Document not found: doc-parent')
      }
      return { id: documentId }
    },
    parentResolveChain: ['doc-parent', 'doc-grandparent']
  })

  expect(parentId).toBe('doc-grandparent')
})

test('Test that resolveTemporaryOpenedDocumentParentIdForSave throws when a parent read fails for another reason', async () => {
  await expect(resolveTemporaryOpenedDocumentParentIdForSave({
    draftParentDocumentId: 'doc-parent',
    getDocumentById: async () => {
      throw new Error('no active project database')
    },
    parentResolveChain: ['doc-parent']
  })).rejects.toThrow('no active project database')
})

test('Test that resolveTemporaryOpenedDocumentParentIdForSave throws when the draft parent read fails', async () => {
  await expect(resolveTemporaryOpenedDocumentParentIdForSave({
    draftParentDocumentId: 'doc-parent',
    getDocumentById: async (documentId) => {
      if (documentId === 'doc-ancestor') {
        return { id: documentId }
      }
      throw new Error('no active project database')
    },
    parentResolveChain: ['doc-ancestor']
  })).rejects.toThrow('no active project database')
})

test('Test that reconcileTemporaryOpenedDocumentTabFromSnapshot keeps the tab when parent fallback fails', async () => {
  const tab = {
    ...temporaryTab,
    temporaryParentResolveDocumentIds: ['doc-ancestor']
  }
  const result = await reconcileTemporaryOpenedDocumentTabFromSnapshot(tab, {
    getDocumentById: async (documentId) => {
      if (documentId === 'parent-1') {
        throw new Error('Document not found: parent-1')
      }
      throw new Error('no active project database')
    },
    getDocumentTemplateById: async () => ({}),
    getWorldById: async () => ({})
  })
  expect(result).toEqual(tab)
})
