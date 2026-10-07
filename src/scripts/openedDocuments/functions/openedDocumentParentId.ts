import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

/**
 * Maps tab parent id drafts to nullable SQLite values.
 */
export function resolveOpenedDocumentParentIdDraftForPersist (
  draft: string
): string | null {
  const trimmed = draft.trim()
  if (trimmed.length === 0) {
    return null
  }
  return trimmed
}

/**
 * Resolves append sort order when moving a document under a new parent bucket.
 */
export function resolveOpenedDocumentParentMoveAppendSortOrder (
  siblings: readonly { id: string, sortOrder: number }[],
  documentId: string
): number {
  let maxSortOrder = -1
  for (const sibling of siblings) {
    if (sibling.id === documentId) {
      continue
    }
    if (sibling.sortOrder > maxSortOrder) {
      maxSortOrder = sibling.sortOrder
    }
  }
  return maxSortOrder + 1
}

function resolveRemappedParentDocumentIdField (
  rawMatches: boolean,
  rawParentDocumentId: string | null | undefined,
  nextParentDocumentId: string
): string | null | undefined {
  if (!rawMatches) {
    return rawParentDocumentId
  }
  if (nextParentDocumentId.length === 0) {
    return null
  }
  return nextParentDocumentId
}

/**
 * Rewrites parent fields that still name a document that was just deleted.
 * A draft the user already changed to a different id stays.
 * Returns null when this tab does not reference the deleted id.
 */
export function remapOpenedDocumentTabParentAfterDeletedDocument (
  tab: I_faOpenedDocumentTab,
  deletedDocumentId: string,
  nextParentDocumentId: string
): I_faOpenedDocumentTab | null {
  const draftMatches = tab.parentDocumentIdDraft === deletedDocumentId
  const savedMatches = tab.savedParentDocumentId === deletedDocumentId
  const rawParentDocumentId = tab.parentDocumentId
  const rawMatches = rawParentDocumentId === deletedDocumentId
  if (!draftMatches && !savedMatches && !rawMatches) {
    return null
  }
  const parentDocumentIdDraft = draftMatches
    ? nextParentDocumentId
    : tab.parentDocumentIdDraft
  const savedParentDocumentId = savedMatches
    ? nextParentDocumentId
    : tab.savedParentDocumentId
  const parentDocumentId = resolveRemappedParentDocumentIdField(
    rawMatches,
    rawParentDocumentId,
    nextParentDocumentId
  )
  return {
    ...tab,
    parentDocumentId,
    parentDocumentIdDraft,
    savedParentDocumentId
  }
}
