import { ref, watch } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { createUseProjectAppControlBarOpenedTabsSortable } from '../../functions/createUseProjectAppControlBarOpenedTabsSortable'

const sampleTab = (documentId: string): I_faOpenedDocumentTab => {
  return {
    documentId,
    persistenceState: 'persisted',
    tabLabel: documentId,
    templateIcon: 'mdi-feather',
    displayNameDraft: documentId,
    savedDisplayName: documentId,
    documentTextColorDraft: '',
    savedDocumentTextColor: '',
    documentBackgroundColorDraft: '',
    savedDocumentBackgroundColor: '',
    isCategoryDraft: false,
    savedIsCategory: false,
    isFinishedDraft: false,
    savedIsFinished: false,
    isMinorDraft: false,
    savedIsMinor: false,
    isDeadDraft: false,
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
}

test('Test that useProjectAppControlBarOpenedTabsSortable syncs tabs and reports reorder indexes', () => {
  const openedTabs = ref([sampleTab('doc-1'), sampleTab('doc-2'), sampleTab('doc-3')])
  const onTabReorder = vi.fn()
  const useSortable = createUseProjectAppControlBarOpenedTabsSortable({
    ref,
    watch
  })
  const api = useSortable({
    getOpenedDocumentTabs: () => {
      return openedTabs.value
    },
    onTabReorder
  })

  expect(api.sortableTabs.value.map((tab) => tab.documentId)).toEqual(['doc-1', 'doc-2', 'doc-3'])

  api.onTabsDragEnd({
    oldIndex: 0,
    newIndex: 2
  })
  expect(onTabReorder).toHaveBeenCalledWith(0, 2)

  api.onTabsDragEnd({
    oldIndex: 1,
    newIndex: 1
  })
  expect(onTabReorder).toHaveBeenCalledTimes(1)

  api.onTabsDragEnd({
    oldIndex: undefined,
    newIndex: 2
  })
  api.onTabsDragEnd({})
  expect(onTabReorder).toHaveBeenCalledTimes(1)
})
