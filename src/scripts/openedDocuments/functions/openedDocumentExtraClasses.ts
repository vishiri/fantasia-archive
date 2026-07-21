/**
 * Maps nullable SQLite extra_classes to tab session empty-string baseline.
 */
export function normalizeOpenedDocumentExtraClassesFromDb (
  value: string | null | undefined
): string {
  if (value === null || value === undefined) {
    return ''
  }
  return value
}

/**
 * Maps tab extra-classes drafts to SQLite storage (trimmed).
 */
export function resolveOpenedDocumentExtraClassesDraftForPersist (
  draft: string
): string {
  return draft.trim()
}

/**
 * Splits a space-separated extra-classes draft into Vue :class tokens.
 */
export function resolveDocumentWorkspacePageExtraHtmlClassList (
  draft: string
): string[] {
  const trimmed = draft.trim()
  if (trimmed.length === 0) {
    return []
  }
  return trimmed.split(/\s+/).filter((token) => token.length > 0)
}
