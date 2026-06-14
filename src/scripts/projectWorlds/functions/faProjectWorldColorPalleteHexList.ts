const HEX_COLOR_SEGMENT = /^#[0-9a-fA-F]{6}$/

/**
 * True when value is a stored worlds.color / palette segment (#RRGGBB).
 */
export function isFaProjectWorldStorageHexColor (value: string): boolean {
  return HEX_COLOR_SEGMENT.test(value.trim())
}

/**
 * True when color_pallete already contains the hex (case-insensitive).
 */
export function faProjectWorldColorPalleteContainsHex (
  colorPallete: string,
  hex: string
): boolean {
  const part = hex.trim()
  if (!HEX_COLOR_SEGMENT.test(part)) {
    return false
  }
  const key = part.toLowerCase()
  const trimmed = colorPallete.trim()
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
 * Appends one #RRGGBB to color_pallete when valid, unique, and within max length.
 * Returns null when append is not allowed.
 */
export function appendFaProjectWorldColorPalleteHex (
  colorPallete: string,
  appendHex: string,
  maxLength: number
): string | null {
  const part = appendHex.trim()
  if (!HEX_COLOR_SEGMENT.test(part)) {
    return null
  }
  const upper = part.toUpperCase()
  if (faProjectWorldColorPalleteContainsHex(colorPallete, upper)) {
    return null
  }
  if (wouldFaProjectWorldColorPalleteExceedMaxLength(colorPallete, upper, maxLength)) {
    return null
  }
  const trimmed = colorPallete.trim()
  if (trimmed.length === 0) {
    return upper
  }
  return `${trimmed};${upper}`
}

/**
 * True when the palette contains the same #RRGGBB value more than once (case-insensitive).
 */
export function hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates (
  colorPallete: string
): boolean {
  const trimmed = colorPallete.trim()
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
 * Parses one worlds.color_pallete string into validated unique #RRGGBB values (uppercase).
 * Invalid or empty segments are skipped. Later duplicates (case-insensitive) are skipped.
 */
export function parseFaProjectWorldColorPalleteToHexList (colorPallete: string): string[] {
  const trimmed = colorPallete.trim()
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
 * Normalizes a color_pallete string for storage: unique #RRGGBB segments, uppercase, semicolon-separated.
 */
export function normalizeFaProjectWorldColorPalleteString (colorPallete: string): string {
  return parseFaProjectWorldColorPalleteToHexList(colorPallete).join(';')
}

/**
 * Parses one worlds.color_pallete string for editor display: validated #RRGGBB values in order.
 * Invalid or empty segments are skipped. Duplicates are kept so the editor can highlight them.
 */
export function parseFaProjectWorldColorPalleteToHexListPreservingDuplicates (
  colorPallete: string
): string[] {
  const trimmed = colorPallete.trim()
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
 * Serializes validated #RRGGBB values into a semicolon-separated color_pallete string.
 */
export function serializeFaProjectWorldColorPalleteFromHexList (
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
export function collectFaProjectWorldColorPalleteDuplicateHexKeys (
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
 * True when appending one more hex segment would exceed the stored color_pallete length cap.
 */
export function wouldFaProjectWorldColorPalleteExceedMaxLength (
  colorPallete: string,
  appendHex: string,
  maxLength: number
): boolean {
  const normalizedAppend = appendHex.trim().toUpperCase()
  if (!HEX_COLOR_SEGMENT.test(normalizedAppend)) {
    return true
  }
  const trimmed = colorPallete.trim()
  if (trimmed.length === 0) {
    return normalizedAppend.length > maxLength
  }
  const nextLength = trimmed.length + 1 + normalizedAppend.length
  return nextLength > maxLength
}

/**
 * Merges color_pallete strings from multiple worlds into one deduplicated #RRGGBB list.
 * Order is preserved by world order, then segment order within each palette.
 */
export function aggregateFaProjectWorldColorPalleteHexList (
  colorPalleteStrings: readonly string[]
): string[] {
  const seen = new Set<string>()
  const merged: string[] = []
  for (const colorPallete of colorPalleteStrings) {
    const parsed = parseFaProjectWorldColorPalleteToHexList(colorPallete)
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
