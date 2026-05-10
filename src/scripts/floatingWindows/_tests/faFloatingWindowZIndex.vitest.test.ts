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
 * Values stay in the standard floating sub-band and wrap after the maximum.
 */
test('Test that bumpFloatingWindowZIndex stays within the standard sub-band and wraps after the maximum', async () => {
  const {
    bumpFloatingWindowZIndex,
    FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MAX,
    FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MIN
  } = await import('app/src/scripts/floatingWindows/faFloatingWindowZIndex')
  expect(bumpFloatingWindowZIndex()).toBe(FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MIN)
  for (
    let k = FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MIN + 1;
    k <= FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MAX;
    k++
  ) {
    expect(bumpFloatingWindowZIndex()).toBe(k)
  }
  expect(bumpFloatingWindowZIndex()).toBe(FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MIN)
})

/**
 * bumpNoteboardFloatingWindowZIndex
 * Values stay in the noteboard sub-band and wrap after the maximum.
 */
test('Test that bumpNoteboardFloatingWindowZIndex stays within the noteboard sub-band and wraps after the maximum', async () => {
  const {
    bumpNoteboardFloatingWindowZIndex,
    FA_FLOATING_WINDOW_Z_INDEX_NOTEBOARD_MAX,
    FA_FLOATING_WINDOW_Z_INDEX_NOTEBOARD_MIN
  } = await import('app/src/scripts/floatingWindows/faFloatingWindowZIndex')
  expect(bumpNoteboardFloatingWindowZIndex()).toBe(FA_FLOATING_WINDOW_Z_INDEX_NOTEBOARD_MIN)
  for (
    let k = FA_FLOATING_WINDOW_Z_INDEX_NOTEBOARD_MIN + 1;
    k <= FA_FLOATING_WINDOW_Z_INDEX_NOTEBOARD_MAX;
    k++
  ) {
    expect(bumpNoteboardFloatingWindowZIndex()).toBe(k)
  }
  expect(bumpNoteboardFloatingWindowZIndex()).toBe(FA_FLOATING_WINDOW_Z_INDEX_NOTEBOARD_MIN)
})
