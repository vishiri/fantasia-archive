/**
 * Normalizes the optional persist target world id for palette append.
 */
export function readFaColorPickerPaletteAppendWorldId (worldId: string | undefined): string {
  if (worldId === undefined) {
    return ''
  }
  return worldId.trim()
}
