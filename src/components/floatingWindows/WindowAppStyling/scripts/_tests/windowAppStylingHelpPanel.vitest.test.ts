/** @vitest-environment jsdom */
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * useWindowAppStylingHelpPanel
 * Theme custom property names refresh after the help menu opens.
 */
test('Test that FA custom property names refresh after the app styling help menu opens', async () => {
  const faTheme = await import('app/src/scripts/faTheme/faTheme_manager')
  const spy = vi.spyOn(faTheme, 'getFaColorCustomPropertyNamesForHelpPanel').mockReturnValue(['--a'])

  const { useWindowAppStylingHelpPanel } = await import('../windowAppStyling_manager')
  const open = ref(false)

  const { faThemeCustomPropertyNames } = useWindowAppStylingHelpPanel(open)

  expect(spy).toHaveBeenCalled()
  expect([...faThemeCustomPropertyNames.value]).toEqual(['--a'])

  spy.mockClear()

  open.value = true
  await flushPromises()

  expect(spy).toHaveBeenCalled()
})

/**
 * useWindowAppStylingHelpPanel
 * Palette scan runs on init and when open becomes true, not on false transitions.
 */
test('Test that useWindowAppStylingHelpPanel skips palette refresh when help menu stays closed', async () => {
  const faTheme = await import('app/src/scripts/faTheme/faTheme_manager')
  const spy = vi.spyOn(faTheme, 'getFaColorCustomPropertyNamesForHelpPanel').mockReturnValue([
    '--palette'
  ])

  const { useWindowAppStylingHelpPanel } = await import('../windowAppStyling_manager')

  const open = ref<boolean | undefined>(undefined)
  useWindowAppStylingHelpPanel(open)

  const callsDuringComposableInit = spy.mock.calls.length
  expect(callsDuringComposableInit).toBeGreaterThan(0)

  spy.mockClear()
  open.value = false
  await flushPromises()
  expect(spy).not.toHaveBeenCalled()

  open.value = true
  await flushPromises()
  expect(spy).toHaveBeenCalled()
})
