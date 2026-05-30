import { expect, test } from 'vitest'

import { buildFaColorVarSwatchStyle } from '../faColorVarSwatchStyle'

/**
 * buildFaColorVarSwatchStyle
 * Returns a CSS var() background for theme token swatches in the help panel.
 */
test('Test that buildFaColorVarSwatchStyle wraps the custom property name in var()', () => {
  expect(buildFaColorVarSwatchStyle('--fa-color-primary')).toEqual({
    backgroundColor: 'var(--fa-color-primary)'
  })
})
