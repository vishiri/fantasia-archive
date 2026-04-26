import { expect, test } from 'vitest'

import { buildFaColorVarSwatchStyle } from 'app/src/components/floatingWindows/WindowProgramStyling/scripts/faColorVarSwatchStyle'

test('Test that buildFaColorVarSwatchStyle wraps a custom property as backgroundColor var()', () => {
  expect(buildFaColorVarSwatchStyle('--fa-color-primary')).toEqual({
    backgroundColor: 'var(--fa-color-primary)'
  })
})
