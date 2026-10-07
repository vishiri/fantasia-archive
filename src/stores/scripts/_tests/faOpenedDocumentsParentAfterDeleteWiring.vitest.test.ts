import { expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { refreshOpenedDocumentTabsAfterDeletedParent } from '../faOpenedDocumentsParentAfterDeleteWiring'

function buildTab (documentId: string): I_faOpenedDocumentTab {
  return {
    displayNameDraft: 'Hero',
    documentBackgroundColorDraft: '',
    documentId,
    documentTextColorDraft: '',
    editState: false,
    extraClassesDraft: '',
    hasUnsavedChanges: false,
    isCategoryDraft: false,
    isDeadDraft: false,
    isFinishedDraft: false,
    isMinorDraft: false,
    parentDocumentId: 'deleted-parent',
    parentDocumentIdDraft: 'deleted-parent',
    persistenceState: 'persisted',
    savedDisplayName: 'Hero',
    savedDocumentBackgroundColor: '',
    savedDocumentTextColor: '',
    savedExtraClasses: '',
    savedIsCategory: false,
    savedIsDead: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedParentDocumentId: 'deleted-parent',
    savedTags: [],
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
    tabLabel: 'Hero',
    tagsDraft: [],
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    treeOrderNumberDraft: '',
    worldId: 'world-1'
  }
}

test('Test that refreshOpenedDocumentTabsAfterDeletedParent skips when there is no document reader', async () => {
  const next = await refreshOpenedDocumentTabsAfterDeletedParent({
    deletedDocumentId: 'deleted-parent',
    getDocumentById: async () => ({ parentDocumentId: 'grand' }),
    hasDocumentReader: false,
    readLiveTabs: () => [buildTab('doc-1')]
  })
  expect(next).toBeNull()
})

test('Test that refreshOpenedDocumentTabsAfterDeletedParent ignores a failed parent read', async () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const next = await refreshOpenedDocumentTabsAfterDeletedParent({
    deletedDocumentId: 'deleted-parent',
    getDocumentById: async () => {
      throw new Error('disk')
    },
    hasDocumentReader: true,
    readLiveTabs: () => [buildTab('doc-1')]
  })
  expect(next).toBeNull()
  expect(errorSpy).toHaveBeenCalled()
  errorSpy.mockRestore()
})

test('Test that refreshOpenedDocumentTabsAfterDeletedParent promotes the parent on open tabs', async () => {
  const next = await refreshOpenedDocumentTabsAfterDeletedParent({
    deletedDocumentId: 'deleted-parent',
    getDocumentById: async () => ({ parentDocumentId: 'grand' }),
    hasDocumentReader: true,
    readLiveTabs: () => [buildTab('doc-1')]
  })
  expect(next?.[0]?.parentDocumentIdDraft).toBe('grand')
  expect(next?.[0]?.savedParentDocumentId).toBe('grand')
})

test('Test that refreshOpenedDocumentTabsAfterDeletedParent leaves a tab that already names the promoted parent', async () => {
  const tab = buildTab('doc-1')
  let reads = 0
  const next = await refreshOpenedDocumentTabsAfterDeletedParent({
    deletedDocumentId: 'deleted-parent',
    getDocumentById: async () => ({ parentDocumentId: 'deleted-parent' }),
    hasDocumentReader: true,
    readLiveTabs: () => {
      reads += 1
      if (reads === 1) {
        return [tab]
      }
      return [{
        ...tab,
        parentDocumentId: 'other',
        parentDocumentIdDraft: 'other',
        savedParentDocumentId: 'other'
      }]
    }
  })
  expect(next).toBeNull()
})

test('Test that refreshOpenedDocumentTabsAfterDeletedParent skips a tab whose parent did not change', async () => {
  const next = await refreshOpenedDocumentTabsAfterDeletedParent({
    deletedDocumentId: 'deleted-parent',
    getDocumentById: async () => ({ parentDocumentId: 'deleted-parent' }),
    hasDocumentReader: true,
    readLiveTabs: () => [buildTab('doc-1')]
  })
  expect(next).toBeNull()
})
