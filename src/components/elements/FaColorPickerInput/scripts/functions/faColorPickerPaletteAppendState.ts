import type { I_faColorPickerPaletteAppendConfig } from 'app/types/I_faColorPickerInput'

function isFaColorPickerPaletteAppendHexValid (
  hex: string,
  isFaProjectWorldStorageHexColor: (value: string) => boolean
): boolean {
  if (hex.length === 0) {
    return false
  }
  return isFaProjectWorldStorageHexColor(hex)
}

export function isFaColorPickerPaletteAppendDuplicate (
  config: I_faColorPickerPaletteAppendConfig | undefined,
  hex: string,
  faProjectWorldColorPalleteContainsHex: (colorPallete: string, paletteHex: string) => boolean,
  isFaProjectWorldStorageHexColor: (value: string) => boolean
): boolean {
  if (config === undefined) {
    return false
  }
  if (!isFaColorPickerPaletteAppendHexValid(hex, isFaProjectWorldStorageHexColor)) {
    return false
  }
  return faProjectWorldColorPalleteContainsHex(config.worldColorPalette, hex)
}

export function isFaColorPickerPaletteAppendDisabled (
  config: I_faColorPickerPaletteAppendConfig | undefined,
  hex: string,
  appendFaProjectWorldColorPalleteHex: (
    colorPallete: string,
    appendHex: string,
    maxLength: number
  ) => string | null,
  faProjectWorldColorPalleteContainsHex: (colorPallete: string, paletteHex: string) => boolean,
  isFaProjectWorldStorageHexColor: (value: string) => boolean,
  paletteMaxLength: number,
  readFaColorPickerPaletteAppendWorldId: (worldId: string | undefined) => string
): boolean {
  if (config === undefined) {
    return true
  }
  if (!isFaColorPickerPaletteAppendHexValid(hex, isFaProjectWorldStorageHexColor)) {
    return true
  }
  if (faProjectWorldColorPalleteContainsHex(config.worldColorPalette, hex)) {
    return true
  }
  const nextPalette = appendFaProjectWorldColorPalleteHex(
    config.worldColorPalette,
    hex,
    paletteMaxLength
  )
  if (nextPalette === null) {
    return true
  }
  if (config.mode === 'persist') {
    const worldId = readFaColorPickerPaletteAppendWorldId(config.worldId)
    if (worldId.length === 0) {
      return true
    }
  }
  return false
}

export async function runFaColorPickerPaletteAppendClick (
  config: I_faColorPickerPaletteAppendConfig,
  hex: string,
  appendFaProjectWorldColorPalleteHex: (
    colorPallete: string,
    appendHex: string,
    maxLength: number
  ) => string | null,
  paletteMaxLength: number,
  persistWorldColorPalette: (worldId: string, colorPallete: string) => Promise<boolean>,
  readFaColorPickerPaletteAppendWorldId: (worldId: string | undefined) => string,
  refreshProjectWorldColorPalette: () => Promise<void>,
  emitAppendToWorldPalette: (colorPallete: string) => void,
  refreshProjectColorPalette?: () => Promise<void>
): Promise<void> {
  const nextPalette = appendFaProjectWorldColorPalleteHex(
    config.worldColorPalette,
    hex,
    paletteMaxLength
  )
  if (nextPalette === null) {
    return
  }
  if (config.mode === 'draft') {
    emitAppendToWorldPalette(nextPalette)
    return
  }
  const worldId = readFaColorPickerPaletteAppendWorldId(config.worldId)
  const persisted = await persistWorldColorPalette(worldId, nextPalette)
  if (!persisted) {
    return
  }
  const refresh = refreshProjectColorPalette ?? refreshProjectWorldColorPalette
  await refresh()
  emitAppendToWorldPalette(nextPalette)
}
