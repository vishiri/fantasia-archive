import { expect, test, vi } from 'vitest'

const runTooltipDefaultsBootMock = vi.hoisted(() => vi.fn())

vi.mock('../scripts/tooltipDefaultsBoot_manager', () => ({
  runTooltipDefaultsBoot: runTooltipDefaultsBootMock
}))

/**
 * tooltip-defaults boot entry
 * Invokes runTooltipDefaultsBoot when the boot module loads.
 */
test('Test that tooltip-defaults boot invokes runTooltipDefaultsBoot on import', async () => {
  await import('../tooltip-defaults')
  expect(runTooltipDefaultsBootMock).toHaveBeenCalledOnce()
})
