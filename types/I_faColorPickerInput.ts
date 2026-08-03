import type { I_computedRef } from 'app/types/I_vueCompositionShims'

/** Hex fallback when the bound color string is empty or whitespace-only. */
export const FA_COLOR_PICKER_INPUT_DEFAULT_HEX = '#808080'

/** Throttle interval for picker-driven model sync while dragging in QColor. */
export const FA_COLOR_PICKER_INPUT_PICKER_EMIT_THROTTLE_MS = 25

/** Hex colors passed to Quasar QColor palette footer (readonly #RRGGBB list). */
export type T_faColorPickerInputPalette = readonly string[]

/** How FaColorPickerInput appends the current hex into a world's color_palette. */
export type T_faColorPickerPaletteAppendMode = 'draft' | 'persist'

/** Target world palette for the built-in append (+) control on FaColorPickerInput. */
export interface I_faColorPickerPaletteAppendConfig {
  mode: T_faColorPickerPaletteAppendMode
  worldColorPalette: string
  worldId?: string | undefined
}

/** Injected dependencies for createUseFaColorPickerPaletteAppend. */
export type T_createUseFaColorPickerPaletteAppendDeps = {
  appendFaProjectWorldColorPaletteHex: (
    colorPalette: string,
    appendHex: string,
    maxLength: number
  ) => string | null
  computed: <T>(fn: () => T) => I_computedRef<T>
  faProjectWorldColorPaletteContainsHex: (colorPalette: string, hex: string) => boolean
  isFaColorPickerPaletteAppendDisabled: (
    config: I_faColorPickerPaletteAppendConfig | undefined,
    hex: string,
    appendFaProjectWorldColorPaletteHex: (
      colorPalette: string,
      appendHex: string,
      maxLength: number
    ) => string | null,
    faProjectWorldColorPaletteContainsHex: (colorPalette: string, paletteHex: string) => boolean,
    isFaProjectWorldStorageHexColor: (value: string) => boolean,
    paletteMaxLength: number,
    readFaColorPickerPaletteAppendWorldId: (worldId: string | undefined) => string
  ) => boolean
  isFaColorPickerPaletteAppendDuplicate: (
    config: I_faColorPickerPaletteAppendConfig | undefined,
    hex: string,
    faProjectWorldColorPaletteContainsHex: (colorPalette: string, paletteHex: string) => boolean,
    isFaProjectWorldStorageHexColor: (value: string) => boolean
  ) => boolean
  isFaProjectWorldStorageHexColor: (value: string) => boolean
  paletteMaxLength: number
  persistWorldColorPalette: (worldId: string, colorPalette: string) => Promise<boolean>
  readFaColorPickerPaletteAppendWorldId: (worldId: string | undefined) => string
  refreshProjectWorldColorPalette: () => Promise<void>
  runFaColorPickerPaletteAppendClick: (
    config: I_faColorPickerPaletteAppendConfig,
    hex: string,
    appendFaProjectWorldColorPaletteHex: (
      colorPalette: string,
      appendHex: string,
      maxLength: number
    ) => string | null,
    paletteMaxLength: number,
    persistWorldColorPalette: (worldId: string, colorPalette: string) => Promise<boolean>,
    readFaColorPickerPaletteAppendWorldId: (worldId: string | undefined) => string,
    refreshProjectWorldColorPalette: () => Promise<void>,
    emitAppendToWorldPalette: (colorPalette: string) => void,
    refreshProjectColorPalette?: () => Promise<void>
  ) => Promise<void>
}
