export interface I_foundationCustomSwatch {
  /** SCSS variable name as in quasar.variables.scss (QUASAR COLORS - GENERAL). */
  sassVar: string
  /** Resolved hex for the swatch (must stay aligned with the SCSS source). */
  hex: string
  /** Optional note when the value is derived in SCSS (for example color.adjust). */
  note?: string
}

export interface I_foundationQuasarMaterialGroup {
  root: string
  stems: string[]
}
