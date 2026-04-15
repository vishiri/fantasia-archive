import { expect, test } from 'vitest'

import {
  isFantasiaStorybookCanvas,
  setFantasiaStorybookCanvasFlag
} from '../rendererAppInternals'

/**
 * isFantasiaStorybookCanvas
 * Defaults to false when the flag is absent and there is no Storybook canvas root.
 */
test('Test that isFantasiaStorybookCanvas is false when the flag is absent', () => {
  setFantasiaStorybookCanvasFlag(false)
  expect(isFantasiaStorybookCanvas()).toBe(false)
})

/**
 * isFantasiaStorybookCanvas
 * Returns true after setFantasiaStorybookCanvasFlag(true).
 */
test('Test that isFantasiaStorybookCanvas is true when the flag is set', () => {
  setFantasiaStorybookCanvasFlag(true)
  expect(isFantasiaStorybookCanvas()).toBe(true)
  setFantasiaStorybookCanvasFlag(false)
  expect(isFantasiaStorybookCanvas()).toBe(false)
})
