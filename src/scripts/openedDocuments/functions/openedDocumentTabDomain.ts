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
    const nextActiveDocumentId = input.activeDocumentId
    const copiedTabs = duplicateOpenedDocumentTabs(input.tabs)
    return {
      nextActiveDocumentId,
      nextTabs: copiedTabs,
      shouldNavigateHome: false
    }
  }
  if (nextTabs.length === 0) {
    const emptyTabs: I_faOpenedDocumentTab[] = []
    return {
      nextActiveDocumentId: null,
      nextTabs: emptyTabs,
      shouldNavigateHome: true
    }
  }

  const exceptDocumentId = input.exceptDocumentId
  const copiedNextTabs = duplicateOpenedDocumentTabs(nextTabs)
  return {
    nextActiveDocumentId: exceptDocumentId,
    nextTabs: copiedNextTabs,
    shouldNavigateHome: false
  }
}

function findRemainingTabIdNearestClosedActive (
  tabs: readonly I_faOpenedDocumentTab[],
  nextTabs: readonly I_faOpenedDocumentTab[],
  removedIndex: number
): string | null {
  if (removedIndex < 0) {
    return null
  }
  const remainingIds = new Set(nextTabs.map((tab) => tab.documentId))
  for (let index = removedIndex + 1; index < tabs.length; index += 1) {
    const documentId = tabs[index]?.documentId
    if (documentId !== undefined && remainingIds.has(documentId)) {
      return documentId
    }
  }
  for (let index = removedIndex - 1; index >= 0; index -= 1) {
    const documentId = tabs[index]?.documentId
    if (documentId !== undefined && remainingIds.has(documentId)) {
      return documentId
    }
  }
  return null
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
    const nextActiveDocumentId = input.activeDocumentId
    const copiedTabs = duplicateOpenedDocumentTabs(input.tabs)
    return {
      nextActiveDocumentId,
      nextTabs: copiedTabs,
      shouldNavigateHome: false
    }
  }
  if (nextTabs.length === 0) {
    const emptyTabs: I_faOpenedDocumentTab[] = []
    return {
      nextActiveDocumentId: null,
      nextTabs: emptyTabs,
      shouldNavigateHome: true
    }
  }

  const copiedNextTabs = duplicateOpenedDocumentTabs(nextTabs)
  const activeDocumentId = input.activeDocumentId
  if (
    activeDocumentId !== null &&
    nextTabs.some((tab) => tab.documentId === activeDocumentId)
  ) {
    return {
      nextActiveDocumentId: activeDocumentId,
      nextTabs: copiedNextTabs,
      shouldNavigateHome: false
    }
  }

  const removedIndex = activeDocumentId === null
    ? -1
    : findOpenedDocumentTabIndexByDocumentId(input.tabs, activeDocumentId)
  const nextActiveDocumentId = findRemainingTabIdNearestClosedActive(
    input.tabs,
    nextTabs,
    removedIndex
  )
  const shouldNavigateHome = nextActiveDocumentId === null
  return {
    nextActiveDocumentId,
    nextTabs: copiedNextTabs,
    shouldNavigateHome
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
