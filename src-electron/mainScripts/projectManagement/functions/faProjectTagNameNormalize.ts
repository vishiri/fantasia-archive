/**
 * Normalize a tag name for create/rename: trim whitespace.
 * Empty after trim is invalid (caller rejects).
 */
export function normalizeFaProjectTagName (raw: string): string {
  return raw.trim()
}

/**
 * True when two tag names collide under case-insensitive uniqueness.
 */
export function areFaProjectTagNamesCaseInsensitiveEqual (
  left: string,
  right: string
): boolean {
  return left.toLowerCase() === right.toLowerCase()
}
