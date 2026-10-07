import { expect, test } from 'vitest'

import { shouldAcceptFaEnterOutsideIme } from '../shouldAcceptFaEnterOutsideIme'

test('Test that shouldAcceptFaEnterOutsideIme rejects IME composition', () => {
  expect(shouldAcceptFaEnterOutsideIme({
    isComposing: true,
    keyCode: 13
  })).toBe(false)
  expect(shouldAcceptFaEnterOutsideIme({
    isComposing: false,
    keyCode: 229
  })).toBe(false)
  expect(shouldAcceptFaEnterOutsideIme({
    isComposing: false,
    keyCode: 13
  })).toBe(true)
})
