import { expect, test } from 'vitest'

import { createRunTooltipDefaultsBoot } from '../functions/createRunTooltipDefaultsBoot'

/**
 * createRunTooltipDefaultsBoot
 * Patches Quasar QTooltip delay default to the shared Fantasia constant.
 */
test('Test that runTooltipDefaultsBoot sets QTooltip delay default', () => {
  const QTooltip = {
    props: {
      delay: {
        default: 0
      }
    }
  }

  const runTooltipDefaultsBoot = createRunTooltipDefaultsBoot({
    QTooltip,
    faQTooltipDelayMs: 500
  })

  runTooltipDefaultsBoot()

  expect(QTooltip.props.delay.default).toBe(500)
})
