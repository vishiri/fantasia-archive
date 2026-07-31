/** Default app negative hex aligned with --fa-color-negative in fa-theme.scss. */
export const FA_COLOR_CONTRAST_NEGATIVE_HEX = '#ff4040'

/** Black foreground candidate for low-contrast icon overlays. */
export const FA_COLOR_CONTRAST_BLACK_HEX = '#000000'

/**
 * Minimum WCAG contrast ratio before the duplicate palette icon switches from negative to black.
 * 3:1 is the large-text / UI component guideline threshold.
 */
export const FA_DIALOG_PROJECT_SETTINGS_WORLD_COLOR_PALETTE_DUPLICATE_ICON_MIN_CONTRAST_RATIO = 3

/**
 * Fantasy glyph highlight: WCAG relative luminance below this cut uses the mild (less white) mix.
 * Tunable after visual review.
 */
export const FA_COLOR_GLYPH_DARK_RELATIVE_LUMINANCE_CUT = 0.25

/** Default color-mix base share for glyph highlight (rest is white). */
export const FA_COLOR_GLYPH_HIGHLIGHT_BASE_DEFAULT = '58%'

/** Milder highlight for dark bases — keeps hue readable. */
export const FA_COLOR_GLYPH_HIGHLIGHT_BASE_MILD = '80%'

/** Quasar color prop values for the duplicate palette swatch overlay icon. */
export type T_faDialogProjectSettingsWorldColorPaletteDuplicateIconColor = 'black' | 'negative'

/** sRGB channels parsed from a #RGB or #RRGGBB hex string. */
export interface I_faColorContrastRgb {
  b: number
  g: number
  r: number
}

/** Inline CSS custom properties for fantasy color-glyph icons. */
export interface I_faColorGlyphCssCustomProperties {
  '--fa-color-glyph-base': string
  '--fa-color-glyph-highlight-base': string
}
