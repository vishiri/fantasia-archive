/**
 * Maps nullable SQLite parent document ids to tab session empty-string baseline.
 */
export function normalizeOpenedDocumentParentIdFromDb (
  value: string | null | undefined
): string {
  if (value === null || value === undefined) {
    return ''
  }
  return value
}

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
