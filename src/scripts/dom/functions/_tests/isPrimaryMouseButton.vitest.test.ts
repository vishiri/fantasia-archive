import { expect, test } from 'vitest'

import { isPrimaryMouseButton } from '../isPrimaryMouseButton'

test('Test that isPrimaryMouseButton is true only for the primary button', () => {
  expect(isPrimaryMouseButton({ button: 0 })).toBe(true)
  expect(isPrimaryMouseButton({ button: 1 })).toBe(false)
  expect(isPrimaryMouseButton({ button: 2 })).toBe(false)
})
