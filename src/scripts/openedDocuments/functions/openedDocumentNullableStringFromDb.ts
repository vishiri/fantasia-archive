/**
 * Maps nullable SQLite string columns to tab session empty-string baseline.
 */
export function normalizeOpenedDocumentNullableStringFromDb (
  value: string | null | undefined
): string {
  if (value === null || value === undefined) {
    return ''
  }
  return value
}

/**
 * Parent document id null→empty session baseline.
 */
export const normalizeOpenedDocumentParentIdFromDb =
  normalizeOpenedDocumentNullableStringFromDb

/**
 * Extra classes null→empty session baseline.
 */
export const normalizeOpenedDocumentExtraClassesFromDb =
  normalizeOpenedDocumentNullableStringFromDb

/**
 * Appearance color null→empty session baseline.
 */
export const normalizeOpenedDocumentAppearanceColorFromDb =
  normalizeOpenedDocumentNullableStringFromDb
