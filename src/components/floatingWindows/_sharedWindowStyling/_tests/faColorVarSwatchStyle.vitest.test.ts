import { expect, test } from 'vitest'

import { buildFaColorVarSwatchStyle } from '../scripts/functions/faColorVarSwatchStyle'

/**
 * buildFaColorVarSwatchStyle
 * Wraps a CSS custom property name in var() for the help-panel swatch.
 */
test('Test that buildFaColorVarSwatchStyle wraps the custom property name in var()', () => {
  expect(buildFaColorVarSwatchStyle('--fa-color-primary')).toEqual({
    backgroundColor: 'var(--fa-color-primary)'
  })
})
