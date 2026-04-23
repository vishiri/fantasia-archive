import { beforeEach, expect, test, vi } from 'vitest'

/**
 * bumpFloatingWindowZIndex
 * Fresh module state after each reset.
 */
beforeEach(() => {
  vi.resetModules()
})

/**
 * bumpFloatingWindowZIndex
 * Values stay in the documented closed band and wrap from the maximum back to the minimum.
 */
test('Test that bumpFloatingWindowZIndex stays within the floating window band and wraps after the maximum', async () => {
  const {
    bumpFloatingWindowZIndex,
    FA_FLOATING_WINDOW_Z_INDEX_MAX,
    FA_FLOATING_WINDOW_Z_INDEX_MIN
  } = await import('app/src/scripts/floatingWindows/faFloatingWindowZIndex')
  expect(bumpFloatingWindowZIndex()).toBe(FA_FLOATING_WINDOW_Z_INDEX_MIN)
  for (let k = FA_FLOATING_WINDOW_Z_INDEX_MIN + 1; k <= FA_FLOATING_WINDOW_Z_INDEX_MAX; k++) {
    expect(bumpFloatingWindowZIndex()).toBe(k)
  }
  expect(bumpFloatingWindowZIndex()).toBe(FA_FLOATING_WINDOW_Z_INDEX_MIN)
})
