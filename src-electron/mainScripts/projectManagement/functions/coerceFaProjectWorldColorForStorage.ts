import type { T_faProjectWorldStorageColor } from 'app/types/I_faProjectWorldDomain'

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/
const HEX_COLOR_SHORT = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/

/**
 * Expands #RGB to #RRGGBB. Returns null when the value is not a short hex color.
 */
function expandFaProjectWorldShortHex (trimmed: string): string | null {
  const shortMatch = HEX_COLOR_SHORT.exec(trimmed)
  if (shortMatch === null) {
    return null
  }
  const red = shortMatch[1] ?? ''
  const green = shortMatch[2] ?? ''
  const blue = shortMatch[3] ?? ''
  const expanded = `#${red}${red}${green}${green}${blue}${blue}`
  return expanded.toUpperCase()
}

/**
 * Normalizes a worlds.color value for SQLite storage (#RRGGBB or empty).
 * Blank input stays empty (optional color). #RGB expands. Other free-form strings map to defaultColor.
 */
export function coerceFaProjectWorldColorForStorage (
  raw: string | undefined,
  defaultColor: T_faProjectWorldStorageColor
): string {
  const trimmed = raw?.trim() ?? ''
  if (trimmed.length === 0) {
    return ''
  }
  if (HEX_COLOR_PATTERN.test(trimmed)) {
    return trimmed.toUpperCase()
  }
  const expanded = expandFaProjectWorldShortHex(trimmed)
  if (expanded !== null) {
    return expanded
  }
  return defaultColor
}
