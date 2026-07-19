import type { T_faProjectWorldStorageColor } from 'app/types/I_faProjectWorldDomain'

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/

/**
 * Normalizes a worlds.color value for SQLite storage (#RRGGBB or empty).
 * Blank input stays empty (optional color). Invalid free-form strings map to defaultColor.
 */
export function coerceFaProjectWorldColorForStorage (
  raw: string | undefined,
  defaultColor: T_faProjectWorldStorageColor
): string {
  const trimmed = raw?.trim() ?? ''
  if (trimmed.length === 0) {
    return ''
  }
  if (!HEX_COLOR_PATTERN.test(trimmed)) {
    return defaultColor
  }
  return trimmed.toUpperCase()
}
