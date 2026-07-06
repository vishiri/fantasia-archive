import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

/**
 * Whether the tab display name draft differs from the saved baseline.
 */
export function computeOpenedDocumentHasUnsavedChanges (
  displayNameDraft: string,
  savedDisplayName: string
): boolean {
  return displayNameDraft !== savedDisplayName
}

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
  return { ...tab }
}

/**
 * Duplicates the full ordered tab list.
 */
export function duplicateOpenedDocumentTabs (
  tabs: readonly I_faOpenedDocumentTab[]
): I_faOpenedDocumentTab[] {
  return tabs.map((tab) => duplicateOpenedDocumentTab(tab))
}
