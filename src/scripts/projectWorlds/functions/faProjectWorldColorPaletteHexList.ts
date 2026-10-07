const HEX_COLOR_SEGMENT = /^#[0-9a-fA-F]{6}$/
const HEX_COLOR_SHORT = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/

/**
 * Normalizes a world color or palette segment to uppercase #RRGGBB.
 * #RGB expands. Other text returns null.
 */
export function resolveFaProjectWorldStorageHexColor (value: string): string | null {
  const trimmed = value.trim()
  if (HEX_COLOR_SEGMENT.test(trimmed)) {
    return trimmed.toUpperCase()
  }
  const shortMatch = HEX_COLOR_SHORT.exec(trimmed)
  if (shortMatch === null) {
    return null
  }
  const red = shortMatch[1] ?? ''
  const green = shortMatch[2] ?? ''
  const blue = shortMatch[3] ?? ''
  return `#${red}${red}${green}${green}${blue}${blue}`.toUpperCase()
}

/**
 * True when value is a worlds.color / palette segment (#RRGGBB or #RGB shorthand).
 */
export function isFaProjectWorldStorageHexColor (value: string): boolean {
  return resolveFaProjectWorldStorageHexColor(value) !== null
}

/**
 * True when color_palette already contains the hex (case-insensitive).
 */
export function faProjectWorldColorPaletteContainsHex (
  colorPalette: string,
  hex: string
): boolean {
  const resolved = resolveFaProjectWorldStorageHexColor(hex)
  if (resolved === null) {
    return false
  }
  const key = resolved.toLowerCase()
  const trimmed = colorPalette.trim()
  if (trimmed.length === 0) {
    return false
  }
  for (const segment of trimmed.split(';')) {
    const segmentHex = resolveFaProjectWorldStorageHexColor(segment)
    if (segmentHex === null) {
      continue
    }
    if (segmentHex.toLowerCase() === key) {
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
  const upper = resolveFaProjectWorldStorageHexColor(appendHex)
  if (upper === null) {
    return null
  }
  const base = parseFaProjectWorldColorPaletteToHexListPreservingDuplicates(colorPalette).join(';')
  if (faProjectWorldColorPaletteContainsHex(base, upper)) {
    return null
  }
  if (wouldFaProjectWorldColorPaletteExceedMaxLength(base, upper, maxLength)) {
    return null
  }
  if (base.length === 0) {
    return upper
  }
  return `${base};${upper}`
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
    const segmentHex = resolveFaProjectWorldStorageHexColor(part)
    if (segmentHex === null) {
      continue
    }
    const key = segmentHex.toLowerCase()
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
    const upper = resolveFaProjectWorldStorageHexColor(part)
    if (upper === null) {
      continue
    }
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
    const upper = resolveFaProjectWorldStorageHexColor(part)
    if (upper === null) {
      continue
    }
    hexList.push(upper)
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
    const upper = resolveFaProjectWorldStorageHexColor(part)
    if (upper === null) {
      continue
    }
    normalized.push(upper)
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
    const segmentHex = resolveFaProjectWorldStorageHexColor(part)
    if (segmentHex === null) {
      continue
    }
    const key = segmentHex.toLowerCase()
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
  const normalizedAppend = resolveFaProjectWorldStorageHexColor(appendHex)
  if (normalizedAppend === null) {
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
