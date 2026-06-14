import type { T_faProjectWorldStorageColor } from 'app/types/I_faProjectWorldDomain'

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/

/**
 * Normalizes a worlds.color value for SQLite storage (#RRGGBB).
 * Blank or invalid input maps to the provided default without throwing.
 */
export function coerceFaProjectWorldColorForStorage (
  raw: string | undefined,
  defaultColor: T_faProjectWorldStorageColor
): T_faProjectWorldStorageColor {
  const trimmed = raw?.trim() ?? ''
  if (trimmed.length === 0) {
    return defaultColor
  }
  if (!HEX_COLOR_PATTERN.test(trimmed)) {
    return defaultColor
  }
  return trimmed.toUpperCase() as T_faProjectWorldStorageColor
}
