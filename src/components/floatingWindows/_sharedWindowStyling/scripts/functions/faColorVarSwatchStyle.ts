/**
 * Inline style for the Custom CSS help list swatch. var(…) resolves from :root so it tracks theme overrides.
 */
export function buildFaColorVarSwatchStyle (name: string): { backgroundColor: string } {
  const backgroundColor = `var(${name})`
  return {
    backgroundColor
  }
}
