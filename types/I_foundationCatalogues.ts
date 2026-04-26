/**
 * Custom color swatch row for Storybook foundation palette previews.
 */
export interface I_foundationCustomSwatch {
  /** SCSS variable name as in app.palette.scss (QUASAR COLORS - GENERAL). */
  sassVar: string
  /** Resolved hex for the swatch (must stay aligned with the SCSS source). */
  hex: string
  /** Optional note when the value is derived in SCSS (for example color.adjust). */
  note?: string
}

/**
 * Quasar material color group (root token plus stem names) for palette tables.
 */
export interface I_foundationQuasarMaterialGroup {
  root: string
  stems: string[]
}

/**
 * Allowed heading tag names for typography showcase rows.
 */
export type T_foundationTypographyHeadingTag =
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'

/**
 * One typography heading sample in the Storybook foundation text list.
 */
export interface I_foundationTypographyHeading {
  className: string
  label: string
  sample: string
  tag: T_foundationTypographyHeadingTag
}

/**
 * One font weight row in the typography catalogue.
 */
export interface I_foundationTypographyWeight {
  className: string
  label: string
}

/**
 * One helper text style row in the typography catalogue.
 */
export interface I_foundationTypographyHelper {
  className: string
  demoPhrase: string
  description: string
}
