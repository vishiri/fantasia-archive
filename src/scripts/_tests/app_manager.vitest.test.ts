import { afterEach, expect, test, vi } from 'vitest'

import { isFantasiaStorybookCanvas } from 'app/src/scripts/appInternals/appInternals_manager'

import { useApp } from '../app_manager'

vi.mock('app/src/scripts/appInternals/appInternals_manager', () => ({
  isFantasiaStorybookCanvas: vi.fn(() => false)
}))

afterEach(() => {
  vi.unstubAllEnvs()
  vi.mocked(isFantasiaStorybookCanvas).mockReturnValue(false)
})

/**
 * useApp
 * mountUserCssInjector follows storybook canvas and MODE.
 */
test('Test that useApp mountUserCssInjector is true in electron when not on storybook canvas', () => {
  vi.mocked(isFantasiaStorybookCanvas).mockReturnValue(false)
  vi.stubEnv('MODE', 'electron')

  const { mountUserCssInjector } = useApp()

  expect(mountUserCssInjector.value).toBe(true)
})

/**
 * useApp
 * Storybook canvas suppresses user CSS injectors even in electron mode.
 */
test('Test that useApp mountUserCssInjector is false on storybook canvas', () => {
  vi.mocked(isFantasiaStorybookCanvas).mockReturnValue(true)
  vi.stubEnv('MODE', 'electron')

  const { mountUserCssInjector } = useApp()

  expect(mountUserCssInjector.value).toBe(false)
})
