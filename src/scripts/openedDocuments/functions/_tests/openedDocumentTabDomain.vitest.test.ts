import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  appendOpenedDocumentTabToRight,
  computeOpenedDocumentHasUnsavedChanges,
  filterOpenedDocumentTabsKeepingUnsavedAndExceptDocument,
  findOpenedDocumentTabIndexByDocumentId,
  moveOpenedDocumentTabByOffset,
  removeOpenedDocumentTabAtIndex,
  resolveAdjacentOpenedDocumentTabId,
  resolveOpenedDocumentTabFocusIndexAfterClose,
  resolveOpenedDocumentTabsAfterBulkCloseWithoutChanges,
  resolveOpenedDocumentTabsAfterForceClose
} from '../openedDocumentTabDomain'

const sampleTab: I_faOpenedDocumentTab = {
  documentId: 'doc-1',
  persistenceState: 'persisted',
  tabLabel: 'Doc',
  templateIcon: 'mdi-feather',
  displayNameDraft: 'Draft',
  savedDisplayName: 'Saved',
  hasUnsavedChanges: true,
  editState: false
}

/**
 * openedDocumentTabDomain helpers
 */
test('Test that computeOpenedDocumentHasUnsavedChanges compares draft to saved baseline', () => {
  expect(computeOpenedDocumentHasUnsavedChanges('A', 'B')).toBe(true)
  expect(computeOpenedDocumentHasUnsavedChanges('Same', 'Same')).toBe(false)
})

test('Test that appendOpenedDocumentTabToRight keeps uniqueness by append order', () => {
  const next = appendOpenedDocumentTabToRight([], sampleTab)
  expect(next).toHaveLength(1)
  expect(next[0]?.documentId).toBe('doc-1')
})

test('Test that resolveOpenedDocumentTabFocusIndexAfterClose prefers right neighbor', () => {
  expect(resolveOpenedDocumentTabFocusIndexAfterClose(1, 2)).toBe(1)
  expect(resolveOpenedDocumentTabFocusIndexAfterClose(2, 2)).toBe(1)
  expect(resolveOpenedDocumentTabFocusIndexAfterClose(0, 0)).toBe(-1)
})

test('Test that findOpenedDocumentTabIndexByDocumentId returns index or negative one', () => {
  const tabs = appendOpenedDocumentTabToRight([], sampleTab)
  expect(findOpenedDocumentTabIndexByDocumentId(tabs, 'doc-1')).toBe(0)
  expect(findOpenedDocumentTabIndexByDocumentId(tabs, 'missing')).toBe(-1)
})

test('Test that removeOpenedDocumentTabAtIndex removes only the requested row', () => {
  const tabs = [
    sampleTab,
    {
      ...sampleTab,
      documentId: 'doc-2'
    }
  ]
  const next = removeOpenedDocumentTabAtIndex(tabs, 0)
  expect(next).toHaveLength(1)
  expect(next[0]?.documentId).toBe('doc-2')
})

test('Test that resolveAdjacentOpenedDocumentTabId returns neighbors without wrapping', () => {
  const tabs = [
    sampleTab,
    {
      ...sampleTab,
      documentId: 'doc-2'
    },
    {
      ...sampleTab,
      documentId: 'doc-3'
    }
  ]

  expect(resolveAdjacentOpenedDocumentTabId(tabs, 'doc-2', 'previous')).toBe('doc-1')
  expect(resolveAdjacentOpenedDocumentTabId(tabs, 'doc-2', 'next')).toBe('doc-3')
  expect(resolveAdjacentOpenedDocumentTabId(tabs, 'doc-1', 'previous')).toBeNull()
  expect(resolveAdjacentOpenedDocumentTabId(tabs, 'doc-3', 'next')).toBeNull()
  expect(resolveAdjacentOpenedDocumentTabId(tabs, null, 'next')).toBeNull()
  expect(resolveAdjacentOpenedDocumentTabId([sampleTab], 'doc-1', 'next')).toBeNull()
})

test('Test that moveOpenedDocumentTabByOffset swaps the active tab with its neighbor', () => {
  const tabs = [
    sampleTab,
    {
      ...sampleTab,
      documentId: 'doc-2'
    },
    {
      ...sampleTab,
      documentId: 'doc-3'
    }
  ]

  const movedLeft = moveOpenedDocumentTabByOffset(tabs, 'doc-2', -1)
  expect(movedLeft?.map((tab) => tab.documentId)).toEqual(['doc-2', 'doc-1', 'doc-3'])

  const movedRight = moveOpenedDocumentTabByOffset(tabs, 'doc-2', 1)
  expect(movedRight?.map((tab) => tab.documentId)).toEqual(['doc-1', 'doc-3', 'doc-2'])
})

test('Test that moveOpenedDocumentTabByOffset returns null at boundaries or for a single tab', () => {
  const tabs = [
    sampleTab,
    {
      ...sampleTab,
      documentId: 'doc-2'
    },
    {
      ...sampleTab,
      documentId: 'doc-3'
    }
  ]

  expect(moveOpenedDocumentTabByOffset(tabs, 'doc-1', -1)).toBeNull()
  expect(moveOpenedDocumentTabByOffset(tabs, 'doc-3', 1)).toBeNull()
  expect(moveOpenedDocumentTabByOffset([sampleTab], 'doc-1', 1)).toBeNull()
  expect(moveOpenedDocumentTabByOffset(tabs, 'missing', -1)).toBeNull()
})

test('Test that filterOpenedDocumentTabsKeepingUnsavedAndExceptDocument keeps dirty tabs and an except document', () => {
  const tabs = [
    {
      ...sampleTab,
      documentId: 'doc-clean',
      hasUnsavedChanges: false
    },
    {
      ...sampleTab,
      documentId: 'doc-dirty',
      hasUnsavedChanges: true
    },
    {
      ...sampleTab,
      documentId: 'doc-except',
      hasUnsavedChanges: false
    }
  ]

  const kept = filterOpenedDocumentTabsKeepingUnsavedAndExceptDocument({
    exceptDocumentId: 'doc-except',
    tabs
  })

  expect(kept.map((tab) => tab.documentId)).toEqual(['doc-dirty', 'doc-except'])
})

test('Test that resolveOpenedDocumentTabsAfterBulkCloseWithoutChanges closes clean tabs and keeps active when still open', () => {
  const tabs = [
    {
      ...sampleTab,
      documentId: 'doc-a',
      hasUnsavedChanges: false
    },
    {
      ...sampleTab,
      documentId: 'doc-b',
      hasUnsavedChanges: true
    },
    {
      ...sampleTab,
      documentId: 'doc-c',
      hasUnsavedChanges: false
    }
  ]

  const result = resolveOpenedDocumentTabsAfterBulkCloseWithoutChanges({
    activeDocumentId: 'doc-a',
    exceptDocumentId: null,
    tabs
  })

  expect(result.nextTabs.map((tab) => tab.documentId)).toEqual(['doc-b'])
  expect(result.nextActiveDocumentId).toBe('doc-b')
  expect(result.shouldNavigateHome).toBe(false)
})

test('Test that resolveOpenedDocumentTabsAfterBulkCloseWithoutChanges is a no-op when every tab stays open', () => {
  const tabs = [
    {
      ...sampleTab,
      documentId: 'doc-a',
      hasUnsavedChanges: true
    },
    {
      ...sampleTab,
      documentId: 'doc-b',
      hasUnsavedChanges: true
    }
  ]

  const result = resolveOpenedDocumentTabsAfterBulkCloseWithoutChanges({
    activeDocumentId: 'doc-a',
    exceptDocumentId: null,
    tabs
  })

  expect(result.nextTabs.map((tab) => tab.documentId)).toEqual(['doc-a', 'doc-b'])
  expect(result.nextActiveDocumentId).toBe('doc-a')
  expect(result.shouldNavigateHome).toBe(false)
})

test('Test that resolveOpenedDocumentTabsAfterBulkCloseWithoutChanges navigates home when every tab closes', () => {
  const tabs = [
    {
      ...sampleTab,
      documentId: 'doc-a',
      hasUnsavedChanges: false
    }
  ]

  const result = resolveOpenedDocumentTabsAfterBulkCloseWithoutChanges({
    activeDocumentId: 'doc-a',
    exceptDocumentId: 'doc-missing',
    tabs
  })

  expect(result.nextTabs).toEqual([])
  expect(result.nextActiveDocumentId).toBeNull()
  expect(result.shouldNavigateHome).toBe(true)
})

test('Test that resolveOpenedDocumentTabsAfterForceClose keeps only the except tab', () => {
  const tabs = [
    {
      ...sampleTab,
      documentId: 'doc-a',
      hasUnsavedChanges: false
    },
    {
      ...sampleTab,
      documentId: 'doc-b',
      hasUnsavedChanges: true
    },
    {
      ...sampleTab,
      documentId: 'doc-c',
      hasUnsavedChanges: false
    }
  ]

  const result = resolveOpenedDocumentTabsAfterForceClose({
    activeDocumentId: 'doc-a',
    exceptDocumentId: 'doc-b',
    tabs
  })

  expect(result.nextTabs.map((tab) => tab.documentId)).toEqual(['doc-b'])
  expect(result.nextActiveDocumentId).toBe('doc-b')
  expect(result.shouldNavigateHome).toBe(false)
})

test('Test that removeOpenedDocumentTabAtIndex returns a copy when the index is out of range', () => {
  const tabs = [sampleTab]
  expect(removeOpenedDocumentTabAtIndex(tabs, -1)).toEqual(tabs)
  expect(removeOpenedDocumentTabAtIndex(tabs, 3)).toEqual(tabs)
})

test('Test that resolveOpenedDocumentTabsAfterBulkCloseWithoutChanges navigates home when active tab is null', () => {
  const tabs = [
    {
      ...sampleTab,
      documentId: 'doc-clean',
      hasUnsavedChanges: false
    },
    {
      ...sampleTab,
      documentId: 'doc-dirty',
      hasUnsavedChanges: true
    }
  ]

  const result = resolveOpenedDocumentTabsAfterBulkCloseWithoutChanges({
    activeDocumentId: null,
    exceptDocumentId: null,
    tabs
  })

  expect(result.nextTabs.map((tab) => tab.documentId)).toEqual(['doc-dirty'])
  expect(result.nextActiveDocumentId).toBeNull()
  expect(result.shouldNavigateHome).toBe(true)
})

test('Test that resolveOpenedDocumentTabsAfterForceClose navigates home when the except tab is missing', () => {
  const tabs = [
    {
      ...sampleTab,
      documentId: 'doc-a',
      hasUnsavedChanges: false
    }
  ]

  const result = resolveOpenedDocumentTabsAfterForceClose({
    activeDocumentId: 'doc-a',
    exceptDocumentId: 'doc-missing',
    tabs
  })

  expect(result.nextTabs).toEqual([])
  expect(result.nextActiveDocumentId).toBeNull()
  expect(result.shouldNavigateHome).toBe(true)
})

test('Test that resolveAdjacentOpenedDocumentTabId returns null when the active document is missing from tabs', () => {
  const tabs = [
    sampleTab,
    {
      ...sampleTab,
      documentId: 'doc-2'
    }
  ]

  expect(resolveAdjacentOpenedDocumentTabId(tabs, 'doc-missing', 'next')).toBeNull()
})

test('Test that resolveOpenedDocumentTabsAfterForceClose is a no-op when the except tab is already the only tab', () => {
  const tabs = [
    {
      ...sampleTab,
      documentId: 'doc-a',
      hasUnsavedChanges: false
    }
  ]

  const result = resolveOpenedDocumentTabsAfterForceClose({
    activeDocumentId: 'doc-a',
    exceptDocumentId: 'doc-a',
    tabs
  })

  expect(result.nextTabs.map((tab) => tab.documentId)).toEqual(['doc-a'])
  expect(result.nextActiveDocumentId).toBe('doc-a')
  expect(result.shouldNavigateHome).toBe(false)
})

test('Test that moveOpenedDocumentTabByOffset returns null when a sparse tab row is missing', () => {
  const tabs = [
    sampleTab,
    undefined as unknown as I_faOpenedDocumentTab,
    {
      ...sampleTab,
      documentId: 'doc-3'
    }
  ]

  expect(moveOpenedDocumentTabByOffset(tabs, 'doc-1', 1)).toBeNull()
})
