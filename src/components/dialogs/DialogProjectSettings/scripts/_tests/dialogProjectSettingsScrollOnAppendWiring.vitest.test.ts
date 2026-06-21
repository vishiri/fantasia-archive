import { expect, test, vi } from 'vitest'

const { scheduleScrollMock } = vi.hoisted(() => ({
  scheduleScrollMock: vi.fn()
}))

vi.mock('app/src/scripts/dom/functions/scrollContainerToRevealLastItem', () => ({
  scheduleScrollContainerToRevealLastItem: scheduleScrollMock
}))

import { createDialogProjectSettingsScrollOnAppendWatch } from '../dialogProjectSettingsScrollOnAppendWiring'

test('Test that createDialogProjectSettingsScrollOnAppendWatch schedules scroll when count increases', () => {
  type T_watchCallback = (nextCount: number, previousCount: number | undefined) => void
  let watchCallback: T_watchCallback | undefined
  const watch = vi.fn((_source: unknown, callback: T_watchCallback) => {
    watchCallback = callback
  })

  createDialogProjectSettingsScrollOnAppendWatch({
    getCount: () => 2,
    getScrollContainer: () => null,
    itemSelector: '.item',
    nextTick: async () => {},
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      callback(performance.now())
      return 0
    },
    watch
  })

  watchCallback?.(2, 1)
  expect(scheduleScrollMock).toHaveBeenCalledTimes(1)

  watchCallback?.(2, 2)
  expect(scheduleScrollMock).toHaveBeenCalledTimes(1)
})
