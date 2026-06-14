const HEX_COLOR_SEGMENT = /^#[0-9a-fA-F]{6}$/

/**
 * True when the palette contains the same #RRGGBB value more than once (case-insensitive).
 */
export function hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates (
  value: string
): boolean {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return false
  }
  const seen = new Set<string>()
  for (const segment of trimmed.split(';')) {
    const part = segment.trim()
    if (part.length === 0) {
      continue
    }
    if (!HEX_COLOR_SEGMENT.test(part)) {
      continue
    }
    const key = part.toLowerCase()
    if (seen.has(key)) {
      return true
    }
    seen.add(key)
  }
  return false
}

/**
 * True when value is empty or a semicolon-separated list of unique #RRGGBB segments within max length.
 */
export function isFaProjectWorldColorPalleteStorageValue (
  value: string,
  maxLength: number
): boolean {
  if (value.length > maxLength) {
    return false
  }
  if (value.length === 0) {
    return true
  }
  if (hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates(value)) {
    return false
  }
  const segments = value.split(';')
  for (const segment of segments) {
    const part = segment.trim()
    if (part.length === 0) {
      continue
    }
    if (!HEX_COLOR_SEGMENT.test(part)) {
      return false
    }
  }
  return true
}

/**
 * Normalizes worlds.color_pallete for SQLite storage.
 * Blank input maps to ''. Invalid or overlong input maps to '' without throwing.
 * Duplicate #RRGGBB segments (case-insensitive) keep the first occurrence only.
 */
export function coerceFaProjectWorldColorPalleteForStorage (
  raw: string | undefined,
  maxLength: number
): string {
  const trimmed = raw?.trim() ?? ''
  if (trimmed.length === 0) {
    return ''
  }
  const segments = trimmed.split(';')
  const seen = new Set<string>()
  const normalized: string[] = []
  for (const segment of segments) {
    const part = segment.trim()
    if (part.length === 0) {
      continue
    }
    if (!HEX_COLOR_SEGMENT.test(part)) {
      return ''
    }
    const upper = part.toUpperCase()
    const key = upper.toLowerCase()
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    normalized.push(upper)
  }
  const joined = normalized.join(';')
  if (joined.length > maxLength) {
    return ''
  }
  return joined
}
