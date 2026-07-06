import { expect, test } from 'vitest'

import { isMiddleMouseButton } from '../isMiddleMouseButton'

test('Test that isMiddleMouseButton matches the middle mouse button only', () => {
  expect(isMiddleMouseButton({ button: 0 })).toBe(false)
  expect(isMiddleMouseButton({ button: 1 })).toBe(true)
  expect(isMiddleMouseButton({ button: 2 })).toBe(false)
})
