/**
 * Returns trimmed tab display name for clipboard copy, or null when empty after trim.
 */
export function resolveProjectDocumentControlBarTabCopyNameText (
  displayName: string
): string | null {
  const trimmed = displayName.trim()
  if (trimmed.length === 0) {
    return null
  }

  return trimmed
}
