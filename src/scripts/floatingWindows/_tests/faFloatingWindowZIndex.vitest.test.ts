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
  } = await import('../functions/faFloatingWindowZIndex')
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
 * bumpProjectStylingFloatingWindowZIndex
 * Project Custom CSS band stacks above standard Window* surfaces and wraps at 5899.
 */
test('Test that bumpProjectStylingFloatingWindowZIndex stays within the project styling sub-band and wraps', async () => {
  const {
    bumpProjectStylingFloatingWindowZIndex,
    FA_FLOATING_WINDOW_Z_INDEX_PROJECT_STYLING_MAX,
    FA_FLOATING_WINDOW_Z_INDEX_PROJECT_STYLING_MIN
  } = await import('../functions/faFloatingWindowZIndex')
  expect(bumpProjectStylingFloatingWindowZIndex()).toBe(
    FA_FLOATING_WINDOW_Z_INDEX_PROJECT_STYLING_MIN
  )
  for (
    let k = FA_FLOATING_WINDOW_Z_INDEX_PROJECT_STYLING_MIN + 1;
    k <= FA_FLOATING_WINDOW_Z_INDEX_PROJECT_STYLING_MAX;
    k++
  ) {
    expect(bumpProjectStylingFloatingWindowZIndex()).toBe(k)
  }
  expect(bumpProjectStylingFloatingWindowZIndex()).toBe(
    FA_FLOATING_WINDOW_Z_INDEX_PROJECT_STYLING_MIN
  )
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
  } = await import('../functions/faFloatingWindowZIndex')
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

/**
 * bumpProjectNoteboardFloatingWindowZIndex
 * Higher sub-band runs above the app-wide noteboard floats and still wraps at the overlay ceiling.
 */
test('Test that bumpProjectNoteboardFloatingWindowZIndex stays above the app noteboard band and wraps', async () => {
  const {
    bumpProjectNoteboardFloatingWindowZIndex,
    FA_FLOATING_WINDOW_Z_INDEX_PROJECT_NOTEBOARD_MAX,
    FA_FLOATING_WINDOW_Z_INDEX_PROJECT_NOTEBOARD_MIN
  } = await import('../functions/faFloatingWindowZIndex')
  expect(bumpProjectNoteboardFloatingWindowZIndex()).toBe(
    FA_FLOATING_WINDOW_Z_INDEX_PROJECT_NOTEBOARD_MIN
  )
  for (
    let projectZ = FA_FLOATING_WINDOW_Z_INDEX_PROJECT_NOTEBOARD_MIN + 1;
    projectZ <= FA_FLOATING_WINDOW_Z_INDEX_PROJECT_NOTEBOARD_MAX;
    projectZ++
  ) {
    expect(bumpProjectNoteboardFloatingWindowZIndex()).toBe(projectZ)
  }
  expect(bumpProjectNoteboardFloatingWindowZIndex()).toBe(
    FA_FLOATING_WINDOW_Z_INDEX_PROJECT_NOTEBOARD_MIN
  )
})
