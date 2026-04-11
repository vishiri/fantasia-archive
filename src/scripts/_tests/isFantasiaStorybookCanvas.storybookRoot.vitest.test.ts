/**
 * @vitest-environment jsdom
 */
import { expect, test } from 'vitest'

import {
  isFantasiaStorybookCanvas,
  setFantasiaStorybookCanvasFlag
} from '../isFantasiaStorybookCanvas'

/**
 * isFantasiaStorybookCanvas
 * Detects the Storybook preview iframe via an element with id storybook-root.
 */
test('Test that isFantasiaStorybookCanvas is true when storybook-root exists', () => {
  setFantasiaStorybookCanvasFlag(false)
  const el = document.createElement('div')
  el.id = 'storybook-root'
  document.body.appendChild(el)
  expect(isFantasiaStorybookCanvas()).toBe(true)
  document.body.removeChild(el)
  expect(isFantasiaStorybookCanvas()).toBe(false)
})
