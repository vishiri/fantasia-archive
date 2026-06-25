import { expect, test, vi } from 'vitest'

const QTooltipMock = vi.hoisted(() => ({
  props: {
    delay: {
      default: 0
    }
  }
}))

vi.mock('quasar', () => ({
  QTooltip: QTooltipMock
}))

/**
 * tooltipDefaultsBoot_manager
 * Wires Quasar QTooltip delay default to the shared Fantasia constant.
 */
test('Test that runTooltipDefaultsBoot from manager patches QTooltip delay default', async () => {
  const { runTooltipDefaultsBoot } = await import('../tooltipDefaultsBoot_manager')
  runTooltipDefaultsBoot()
  expect(QTooltipMock.props.delay.default).toBe(500)
})
