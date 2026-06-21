import { expect, test } from 'vitest'

import { shouldScrollContainerAfterItemCountIncrease } from '../shouldScrollContainerAfterItemCountIncrease'

test('Test that shouldScrollContainerAfterItemCountIncrease is true only when count grows', () => {
  expect(shouldScrollContainerAfterItemCountIncrease(3, 2)).toBe(true)
  expect(shouldScrollContainerAfterItemCountIncrease(2, 2)).toBe(false)
  expect(shouldScrollContainerAfterItemCountIncrease(1, 3)).toBe(false)
  expect(shouldScrollContainerAfterItemCountIncrease(1, undefined)).toBe(false)
})
