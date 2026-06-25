import { expect, test } from 'vitest'

import { FA_Q_TOOLTIP_DELAY_MS } from '../faQTooltipDelay'

/**
 * faQTooltipDelay
 * Exposes the shared Quasar tooltip hover delay constant.
 */
test('Test that FA_Q_TOOLTIP_DELAY_MS is 500 milliseconds', () => {
  expect(FA_Q_TOOLTIP_DELAY_MS).toBe(500)
})
