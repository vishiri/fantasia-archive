const FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY = Number.MIN_SAFE_INTEGER

/**
 * Whether a persisted tree order number is the empty sentinel.
 */
export function isFaDocumentTreeOrderNumberEmpty (value: number): boolean {
  return value === FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY
}

/**
 * Maps persisted tree order numbers to tab session empty-string baseline for inputs.
 */
export function normalizeOpenedDocumentTreeOrderNumberFromDb (
  value: number | null | undefined
): string {
  if (value === null || value === undefined || isFaDocumentTreeOrderNumberEmpty(value)) {
    return ''
  }
  return String(value)
}

/**
 * Maps tab tree order drafts to persisted integer values.
 */
export function resolveOpenedDocumentTreeOrderNumberDraftForPersist (
  draft: string
): number {
  const trimmed = draft.trim()
  if (trimmed.length === 0) {
    return FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY
  }
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) {
    return FA_DOCUMENT_TREE_ORDER_NUMBER_EMPTY
  }
  return Math.trunc(parsed)
}

/**
 * Resolves badge label text for hierarchy tree rows; null when hidden.
 */
export function resolveFaDocumentTreeOrderNumberBadgeLabel (
  value: number | null | undefined
): string | null {
  if (value === null || value === undefined || isFaDocumentTreeOrderNumberEmpty(value)) {
    return null
  }
  return String(value)
}
