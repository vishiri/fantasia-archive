import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

/**
 * Moves a tab from fromIndex to toIndex; null when indexes are invalid or unchanged.
 */
export function reorderOpenedDocumentTabsByIndex (
  tabs: readonly I_faOpenedDocumentTab[],
  fromIndex: number,
  toIndex: number
): I_faOpenedDocumentTab[] | null {
  if (fromIndex === toIndex) {
    return null
  }
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= tabs.length ||
    toIndex >= tabs.length
  ) {
    return null
  }

  const nextTabs = tabs.map((tab) => {
    return { ...tab }
  })
  // Bounds check above guarantees a removed element.
  const movedTab = nextTabs.splice(fromIndex, 1)[0]!
  nextTabs.splice(toIndex, 0, movedTab)
  return nextTabs
}
