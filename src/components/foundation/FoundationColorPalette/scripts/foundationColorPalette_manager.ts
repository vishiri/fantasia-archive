import { FOUNDATION_CUSTOM_SWATCHES } from './functions/foundationPaletteCustom'
import { buildQuasarMaterialGroups } from './functions/foundationPaletteQuasarMaterial'

import { createUseFoundationColorPalette } from './functions/createUseFoundationColorPalette'

export const useFoundationColorPalette = createUseFoundationColorPalette({
  buildQuasarMaterialGroups,
  customSwatches: FOUNDATION_CUSTOM_SWATCHES
})
