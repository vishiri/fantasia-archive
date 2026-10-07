/**
 * Local storage cap. Keep equal to FA_PROJECT_DOCUMENT_EXTRA_CLASSES_MAX_LENGTH.
 */
const FA_DOCUMENT_EXTRA_CLASSES_MAX_LENGTH = 512

/**
 * Maps tab extra-classes drafts to SQLite storage (trimmed).
 */
export function resolveOpenedDocumentExtraClassesDraftForPersist (
  draft: string
): string {
  return draft.trim()
}

/**
 * True when the trimmed draft cannot be stored in documents.extra_classes.
 */
export function openedDocumentExtraClassesDraftExceedsStorage (
  draft: string
): boolean {
  return resolveOpenedDocumentExtraClassesDraftForPersist(draft).length >
    FA_DOCUMENT_EXTRA_CLASSES_MAX_LENGTH
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
