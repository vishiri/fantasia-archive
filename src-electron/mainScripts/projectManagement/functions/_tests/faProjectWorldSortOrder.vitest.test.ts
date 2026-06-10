import { expect, test } from 'vitest'

import { computeNextFaProjectWorldSortOrder } from '../faProjectWorldSortOrder'

/**
 * computeNextFaProjectWorldSortOrder
 * Returns zero when the table has no rows yet.
 */
test('Test that computeNextFaProjectWorldSortOrder returns zero for an empty table', () => {
  expect(computeNextFaProjectWorldSortOrder(null)).toBe(0)
  expect(computeNextFaProjectWorldSortOrder(undefined)).toBe(0)
})

/**
 * computeNextFaProjectWorldSortOrder
 * Increments the current maximum sort_order by one.
 */
test('Test that computeNextFaProjectWorldSortOrder increments the current maximum', () => {
  expect(computeNextFaProjectWorldSortOrder(0)).toBe(1)
  expect(computeNextFaProjectWorldSortOrder(4)).toBe(5)
})
