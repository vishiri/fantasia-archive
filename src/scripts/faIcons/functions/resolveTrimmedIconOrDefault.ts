/**
 * Returns trimmed icon when non-empty; otherwise the default placeholder icon.
 */
export function resolveTrimmedIconOrDefault (
  icon: string,
  defaultIcon: string
): string {
  const trimmed = icon.trim()
  if (trimmed.length > 0) {
    return trimmed
  }
  return defaultIcon
}
