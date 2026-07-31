import { expect, test } from 'vitest'

import { resolveMountUserCssInjector } from '../appMountUserCssInjector'

/**
 * resolveMountUserCssInjector
 * Storybook canvas never mounts user CSS injectors.
 */
test('Test that resolveMountUserCssInjector is false on storybook canvas', () => {
  expect(resolveMountUserCssInjector(true, 'electron')).toBe(false)
})

/**
 * resolveMountUserCssInjector
 * Electron renderer mounts injectors when not in Storybook canvas.
 */
test('Test that resolveMountUserCssInjector is true for electron mode', () => {
  expect(resolveMountUserCssInjector(false, 'electron')).toBe(true)
})

/**
 * resolveMountUserCssInjector
 * Non-electron modes skip injectors.
 */
test('Test that resolveMountUserCssInjector is false outside electron', () => {
  expect(resolveMountUserCssInjector(false, 'spa')).toBe(false)
})
