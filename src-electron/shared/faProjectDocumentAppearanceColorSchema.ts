const FA_PROJECT_DOCUMENT_APPEARANCE_HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/

/**
 * Normalizes document text/background color for SQLite storage (#RRGGBB or NULL).
 */
export function normalizeFaProjectDocumentAppearanceColorForStorage (
  raw: string | null | undefined
): string | null {
  if (raw === null || raw === undefined) {
    return null
  }
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return null
  }
  if (!FA_PROJECT_DOCUMENT_APPEARANCE_HEX_COLOR_PATTERN.test(trimmed)) {
    throw new Error('Invalid document appearance color')
  }
  return trimmed.toUpperCase()
}
