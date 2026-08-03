const HEX_COLOR_SEGMENT = /^#[0-9a-fA-F]{6}$/

/**
 * True when value is a stored worlds.color / palette segment (#RRGGBB).
 */
export function isFaProjectWorldStorageHexColor (value: string): boolean {
  return HEX_COLOR_SEGMENT.test(value.trim())
}

/**
 * True when color_palette already contains the hex (case-insensitive).
 */
export function faProjectWorldColorPaletteContainsHex (
  colorPalette: string,
  hex: string
): boolean {
  const part = hex.trim()
  if (!HEX_COLOR_SEGMENT.test(part)) {
    return false
  }
  const key = part.toLowerCase()
  const trimmed = colorPalette.trim()
  if (trimmed.length === 0) {
    return false
  }
  for (const segment of trimmed.split(';')) {
    const segmentPart = segment.trim()
    if (segmentPart.length === 0) {
      continue
    }
    if (!HEX_COLOR_SEGMENT.test(segmentPart)) {
      continue
    }
    if (segmentPart.toLowerCase() === key) {
      return true
    }
  }
  return false
}

/**
 * Appends one #RRGGBB to color_palette when valid, unique, and within max length.
 * Returns null when append is not allowed.
 */
export function appendFaProjectWorldColorPaletteHex (
  colorPalette: string,
  appendHex: string,
  maxLength: number
): string | null {
  const part = appendHex.trim()
  if (!HEX_COLOR_SEGMENT.test(part)) {
    return null
  }
  const upper = part.toUpperCase()
  if (faProjectWorldColorPaletteContainsHex(colorPalette, upper)) {
    return null
  }
  if (wouldFaProjectWorldColorPaletteExceedMaxLength(colorPalette, upper, maxLength)) {
    return null
  }
  const trimmed = colorPalette.trim()
  if (trimmed.length === 0) {
    return upper
  }
  return `${trimmed};${upper}`
}

/**
 * True when the palette contains the same #RRGGBB value more than once (case-insensitive).
 */
export function hasFaProjectWorldColorPaletteCaseInsensitiveDuplicates (
  colorPalette: string
): boolean {
  const trimmed = colorPalette.trim()
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
 * Parses one worlds.color_palette string into validated unique #RRGGBB values (uppercase).
 * Invalid or empty segments are skipped. Later duplicates (case-insensitive) are skipped.
 */
export function parseFaProjectWorldColorPaletteToHexList (colorPalette: string): string[] {
  const trimmed = colorPalette.trim()
  if (trimmed.length === 0) {
    return []
  }
  const segments = trimmed.split(';')
  const seen = new Set<string>()
  const hexList: string[] = []
  for (const segment of segments) {
    const part = segment.trim()
    if (part.length === 0) {
      continue
    }
    if (!HEX_COLOR_SEGMENT.test(part)) {
      continue
    }
    const upper = part.toUpperCase()
    const key = upper.toLowerCase()
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    hexList.push(upper)
  }
  return hexList
}

/**
 * Normalizes a color_palette string for storage: unique #RRGGBB segments, uppercase, semicolon-separated.
 */
export function normalizeFaProjectWorldColorPaletteString (colorPalette: string): string {
  return parseFaProjectWorldColorPaletteToHexList(colorPalette).join(';')
}

/**
 * Parses one worlds.color_palette string for editor display: validated #RRGGBB values in order.
 * Invalid or empty segments are skipped. Duplicates are kept so the editor can highlight them.
 */
export function parseFaProjectWorldColorPaletteToHexListPreservingDuplicates (
  colorPalette: string
): string[] {
  const trimmed = colorPalette.trim()
  if (trimmed.length === 0) {
    return []
  }
  const hexList: string[] = []
  for (const segment of trimmed.split(';')) {
    const part = segment.trim()
    if (part.length === 0) {
      continue
    }
    if (!HEX_COLOR_SEGMENT.test(part)) {
      continue
    }
    hexList.push(part.toUpperCase())
  }
  return hexList
}

/**
 * Serializes validated #RRGGBB values into a semicolon-separated color_palette string.
 */
export function serializeFaProjectWorldColorPaletteFromHexList (
  hexList: readonly string[]
): string {
  const normalized: string[] = []
  for (const hex of hexList) {
    const part = hex.trim()
    if (part.length === 0) {
      continue
    }
    if (!HEX_COLOR_SEGMENT.test(part)) {
      continue
    }
    normalized.push(part.toUpperCase())
  }
  return normalized.join(';')
}

/**
 * Lowercase #RRGGBB keys that appear more than once in the list (case-insensitive).
 */
export function collectFaProjectWorldColorPaletteDuplicateHexKeys (
  hexList: readonly string[]
): ReadonlySet<string> {
  const counts = new Map<string, number>()
  for (const hex of hexList) {
    const part = hex.trim()
    if (part.length === 0) {
      continue
    }
    if (!HEX_COLOR_SEGMENT.test(part)) {
      continue
    }
    const key = part.toLowerCase()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const duplicateKeys = new Set<string>()
  for (const [key, count] of counts) {
    if (count > 1) {
      duplicateKeys.add(key)
    }
  }
  return duplicateKeys
}

/**
 * True when appending one more hex segment would exceed the stored color_palette length cap.
 */
export function wouldFaProjectWorldColorPaletteExceedMaxLength (
  colorPalette: string,
  appendHex: string,
  maxLength: number
): boolean {
  const normalizedAppend = appendHex.trim().toUpperCase()
  if (!HEX_COLOR_SEGMENT.test(normalizedAppend)) {
    return true
  }
  const trimmed = colorPalette.trim()
  if (trimmed.length === 0) {
    return normalizedAppend.length > maxLength
  }
  const nextLength = trimmed.length + 1 + normalizedAppend.length
  return nextLength > maxLength
}

/**
 * Merges color_palette strings from multiple worlds into one deduplicated #RRGGBB list.
 * Order is preserved by world order, then segment order within each palette.
 */
export function aggregateFaProjectWorldColorPaletteHexList (
  colorPaletteStrings: readonly string[]
): string[] {
  const seen = new Set<string>()
  const merged: string[] = []
  for (const colorPalette of colorPaletteStrings) {
    const parsed = parseFaProjectWorldColorPaletteToHexList(colorPalette)
    for (const hex of parsed) {
      const key = hex.toLowerCase()
      if (seen.has(key)) {
        continue
      }
      seen.add(key)
      merged.push(hex)
    }
  }
  return merged
}
