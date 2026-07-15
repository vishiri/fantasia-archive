import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

/**
 * Finds the index of a tab by document id, or -1 when absent.
 */
export function findOpenedDocumentTabIndexByDocumentId (
  tabs: readonly I_faOpenedDocumentTab[],
  documentId: string
): number {
  return tabs.findIndex((tab) => tab.documentId === documentId)
}

/**
 * Appends a tab copy to the right end of the ordered tab list.
 */
export function appendOpenedDocumentTabToRight (
  tabs: readonly I_faOpenedDocumentTab[],
  tab: I_faOpenedDocumentTab
): I_faOpenedDocumentTab[] {
  return [...tabs, { ...tab }]
}

/**
 * Removes the tab at removedIndex and returns the next list.
 */
export function removeOpenedDocumentTabAtIndex (
  tabs: readonly I_faOpenedDocumentTab[],
  removedIndex: number
): I_faOpenedDocumentTab[] {
  if (removedIndex < 0 || removedIndex >= tabs.length) {
    return [...tabs]
  }
  return tabs.filter((_, index) => index !== removedIndex)
}

/**
 * Resolves which remaining tab index should become active after a close (v1 neighbor rule).
 */
export function resolveOpenedDocumentTabFocusIndexAfterClose (
  removedIndex: number,
  remainingCount: number
): number {
  if (remainingCount <= 0) {
    return -1
  }
  if (removedIndex < remainingCount) {
    return removedIndex
  }
  return remainingCount - 1
}

/**
 * Duplicates a tab row for immutable store updates.
 */
export function duplicateOpenedDocumentTab (
  tab: I_faOpenedDocumentTab
): I_faOpenedDocumentTab {
  const duplicated: I_faOpenedDocumentTab = {
    ...tab
  }
  const resolveIds = tab?.temporaryParentResolveDocumentIds
  if (resolveIds !== undefined) {
    duplicated.temporaryParentResolveDocumentIds = [...resolveIds]
  }
  return duplicated
}

/**
 * Duplicates the full ordered tab list.
 */
export function duplicateOpenedDocumentTabs (
  tabs: readonly I_faOpenedDocumentTab[]
): I_faOpenedDocumentTab[] {
  return tabs.map((tab) => duplicateOpenedDocumentTab(tab))
}

/**
 * Resolves the neighbor tab document id for prev/next keybinds; null at boundaries or with fewer than two tabs.
 */
export function resolveAdjacentOpenedDocumentTabId (
  tabs: readonly I_faOpenedDocumentTab[],
  activeDocumentId: string | null,
  direction: 'previous' | 'next'
): string | null {
  if (activeDocumentId === null || tabs.length < 2) {
    return null
  }

  const activeIndex = findOpenedDocumentTabIndexByDocumentId(tabs, activeDocumentId)
  if (activeIndex === -1) {
    return null
  }

  if (direction === 'previous') {
    if (activeIndex === 0) {
      return null
    }
    return tabs[activeIndex - 1]?.documentId ?? null
  }

  if (activeIndex >= tabs.length - 1) {
    return null
  }

  return tabs[activeIndex + 1]?.documentId ?? null
}

/**
 * Keeps tabs with unsaved changes and optionally one preserved document id.
 */
export function filterOpenedDocumentTabsKeepingUnsavedAndExceptDocument (input: {
  exceptDocumentId: string | null
  tabs: readonly I_faOpenedDocumentTab[]
}): I_faOpenedDocumentTab[] {
  return input.tabs.filter((tab) => {
    if (tab.hasUnsavedChanges) {
      return true
    }
    if (input.exceptDocumentId !== null && tab.documentId === input.exceptDocumentId) {
      return true
    }
    return false
  })
}

/**
 * Keeps at most one tab when force-closing every other opened tab.
 */
export function filterOpenedDocumentTabsKeepingExceptDocumentOnly (input: {
  exceptDocumentId: string | null
  tabs: readonly I_faOpenedDocumentTab[]
}): I_faOpenedDocumentTab[] {
  if (input.exceptDocumentId === null) {
    return []
  }
  return input.tabs.filter((tab) => tab.documentId === input.exceptDocumentId)
}

/**
 * Resolves tab list and active document after force-closing tabs.
 */
export function resolveOpenedDocumentTabsAfterForceClose (input: {
  activeDocumentId: string | null
  exceptDocumentId: string | null
  tabs: readonly I_faOpenedDocumentTab[]
}): {
    nextActiveDocumentId: string | null
    nextTabs: I_faOpenedDocumentTab[]
    shouldNavigateHome: boolean
  } {
  const nextTabs = filterOpenedDocumentTabsKeepingExceptDocumentOnly({
    exceptDocumentId: input.exceptDocumentId,
    tabs: input.tabs
  })
  if (nextTabs.length === input.tabs.length) {
    return {
      nextActiveDocumentId: input.activeDocumentId,
      nextTabs: duplicateOpenedDocumentTabs(input.tabs),
      shouldNavigateHome: false
    }
  }
  if (nextTabs.length === 0) {
    return {
      nextActiveDocumentId: null,
      nextTabs: [],
      shouldNavigateHome: true
    }
  }

  const exceptDocumentId = input.exceptDocumentId
  if (exceptDocumentId !== null) {
    return {
      nextActiveDocumentId: exceptDocumentId,
      nextTabs: duplicateOpenedDocumentTabs(nextTabs),
      shouldNavigateHome: false
    }
  }

  return {
    nextActiveDocumentId: null,
    nextTabs: [],
    shouldNavigateHome: true
  }
}

/**
 * Resolves tab list and active document after bulk-closing clean tabs.
 */
export function resolveOpenedDocumentTabsAfterBulkCloseWithoutChanges (input: {
  activeDocumentId: string | null
  exceptDocumentId: string | null
  tabs: readonly I_faOpenedDocumentTab[]
}): {
    nextActiveDocumentId: string | null
    nextTabs: I_faOpenedDocumentTab[]
    shouldNavigateHome: boolean
  } {
  const nextTabs = filterOpenedDocumentTabsKeepingUnsavedAndExceptDocument({
    exceptDocumentId: input.exceptDocumentId,
    tabs: input.tabs
  })
  if (nextTabs.length === input.tabs.length) {
    return {
      nextActiveDocumentId: input.activeDocumentId,
      nextTabs: duplicateOpenedDocumentTabs(input.tabs),
      shouldNavigateHome: false
    }
  }
  if (nextTabs.length === 0) {
    return {
      nextActiveDocumentId: null,
      nextTabs: [],
      shouldNavigateHome: true
    }
  }

  const activeDocumentId = input.activeDocumentId
  if (
    activeDocumentId !== null &&
    nextTabs.some((tab) => tab.documentId === activeDocumentId)
  ) {
    return {
      nextActiveDocumentId: activeDocumentId,
      nextTabs: duplicateOpenedDocumentTabs(nextTabs),
      shouldNavigateHome: false
    }
  }

  const removedIndex = activeDocumentId === null
    ? -1
    : findOpenedDocumentTabIndexByDocumentId(input.tabs, activeDocumentId)
  const focusIndex = resolveOpenedDocumentTabFocusIndexAfterClose(
    removedIndex,
    nextTabs.length
  )
  if (focusIndex < 0) {
    return {
      nextActiveDocumentId: null,
      nextTabs: duplicateOpenedDocumentTabs(nextTabs),
      shouldNavigateHome: true
    }
  }

  const nextTab = nextTabs[focusIndex]
  if (nextTab === undefined) {
    return {
      nextActiveDocumentId: null,
      nextTabs: duplicateOpenedDocumentTabs(nextTabs),
      shouldNavigateHome: true
    }
  }

  return {
    nextActiveDocumentId: nextTab.documentId,
    nextTabs: duplicateOpenedDocumentTabs(nextTabs),
    shouldNavigateHome: false
  }
}

/**
 * Swaps a tab with its left or right neighbor; null when the move is out of range or the tab is missing.
 */
export function moveOpenedDocumentTabByOffset (
  tabs: readonly I_faOpenedDocumentTab[],
  documentId: string,
  offset: -1 | 1
): I_faOpenedDocumentTab[] | null {
  const index = findOpenedDocumentTabIndexByDocumentId(tabs, documentId)
  if (index === -1) {
    return null
  }

  const targetIndex = index + offset
  if (targetIndex < 0 || targetIndex >= tabs.length) {
    return null
  }

  const currentTab = tabs[index]
  const neighborTab = tabs[targetIndex]
  if (currentTab === undefined || neighborTab === undefined) {
    return null
  }

  const nextTabs = duplicateOpenedDocumentTabs(tabs)
  nextTabs[index] = neighborTab
  nextTabs[targetIndex] = currentTab
  return nextTabs
}
