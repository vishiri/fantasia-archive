import { expect, test } from 'vitest'

import { errorCardScopedMaxWidthBindPx } from '../errorCardScopedMaxWidthBindPx'

test('Test errorCardScopedMaxWidthBindPx uses default px when prop is omitted', () => {
  expect(errorCardScopedMaxWidthBindPx(undefined)).toBe('600px')
})

test('Test errorCardScopedMaxWidthBindPx maps explicit widths', () => {
  expect(errorCardScopedMaxWidthBindPx(333)).toBe('333px')
})
