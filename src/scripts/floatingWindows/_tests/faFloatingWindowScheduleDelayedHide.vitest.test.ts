import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { scheduleFaFloatingWindowDelayedHide } from '../faFloatingWindowScheduleDelayedHide'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

test('Test that scheduleFaFloatingWindowDelayedHide runs onFire after delayMs', () => {
  const onFire = vi.fn()
  scheduleFaFloatingWindowDelayedHide(null, 300, onFire)
  expect(onFire).not.toHaveBeenCalled()
  vi.advanceTimersByTime(299)
  expect(onFire).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  expect(onFire).toHaveBeenCalledTimes(1)
})

test('Test that scheduleFaFloatingWindowDelayedHide clears a previous timer before scheduling', () => {
  const first = vi.fn()
  const second = vi.fn()
  const id1 = scheduleFaFloatingWindowDelayedHide(null, 300, first)
  scheduleFaFloatingWindowDelayedHide(id1, 400, second)
  vi.advanceTimersByTime(300)
  expect(first).not.toHaveBeenCalled()
  vi.advanceTimersByTime(100)
  expect(second).toHaveBeenCalledTimes(1)
})
