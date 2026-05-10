/**
 * Inline style for the Custom app CSS help list swatch. `var(…)` resolves from `:root` so it
 * tracks theme and Custom app CSS overrides.
 */
export function buildFaColorVarSwatchStyle (name: string): { backgroundColor: string } {
  const backgroundColor = `var(${name})`
  return {
    backgroundColor
  }
}
