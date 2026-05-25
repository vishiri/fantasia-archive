/**
 * Parses a finite pixel value from SQLite KV text; returns undefined for empty or non-finite input.
 */
export function parseFaProjectOverlayFinitePx (raw: string | undefined): number | undefined {
  if (raw === undefined) {
    return undefined
  }
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return undefined
  }
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) {
    return undefined
  }
  return parsed
}
