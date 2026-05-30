import { expect, test } from 'vitest'

import {
  decrementDialogOpenCountNonNegative,
  incrementDialogOpenCount
} from '../dialogOpenCount'

/**
 * incrementDialogOpenCount
 * Adds one to the current open count.
 */
test('Test that incrementDialogOpenCount adds one', () => {
  expect(incrementDialogOpenCount(0)).toBe(1)
  expect(incrementDialogOpenCount(2)).toBe(3)
})

/**
 * decrementDialogOpenCountNonNegative
 * Subtracts one but never returns a negative count.
 */
test('Test that decrementDialogOpenCountNonNegative floors at zero', () => {
  expect(decrementDialogOpenCountNonNegative(2)).toBe(1)
  expect(decrementDialogOpenCountNonNegative(0)).toBe(0)
})
