import {
  FA_COLOR_GLYPH_DARK_RELATIVE_LUMINANCE_CUT,
  FA_COLOR_GLYPH_HIGHLIGHT_BASE_DEFAULT,
  FA_COLOR_GLYPH_HIGHLIGHT_BASE_MILD
} from 'app/types/I_faColorContrast'

import { createFaColorGlyphCssCustomPropertiesApi } from './functions/faColorContrast'

const faColorGlyphCssCustomPropertiesApi = createFaColorGlyphCssCustomPropertiesApi({
  darkRelativeLuminanceCut: FA_COLOR_GLYPH_DARK_RELATIVE_LUMINANCE_CUT,
  highlightBaseDefault: FA_COLOR_GLYPH_HIGHLIGHT_BASE_DEFAULT,
  highlightBaseMild: FA_COLOR_GLYPH_HIGHLIGHT_BASE_MILD
})

export const buildFaColorGlyphCssCustomProperties =
  faColorGlyphCssCustomPropertiesApi.buildFaColorGlyphCssCustomProperties

export const resolveFaColorGlyphHighlightBasePercent =
  faColorGlyphCssCustomPropertiesApi.resolveFaColorGlyphHighlightBasePercent

export {
  calculateFaColorContrastRatio,
  calculateFaColorContrastRelativeLuminance,
  parseFaColorContrastHexToRgb,
  resolveFaDuplicatePaletteIconQuasarColor
} from './functions/faColorContrast'
