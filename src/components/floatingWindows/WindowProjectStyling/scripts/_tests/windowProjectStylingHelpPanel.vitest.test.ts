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

test('Test that FA custom property names refresh after the help menu opens', async () => {
  const faTheme = await import('app/src/scripts/faTheme/faThemeCustomPropertyNames')
  const spy = vi.spyOn(faTheme, 'getFaColorCustomPropertyNamesForHelpPanel').mockReturnValue(['--a'])

  const { useWindowProjectStylingHelpPanel } = await import('../windowProjectStylingHelpPanel')
  const open = ref(false)

  const { faThemeCustomPropertyNames } = useWindowProjectStylingHelpPanel(open)

  expect(spy).toHaveBeenCalled()
  expect([...faThemeCustomPropertyNames.value]).toEqual(['--a'])

  spy.mockClear()

  open.value = true
  await flushPromises()

  expect(spy).toHaveBeenCalled()
})

test('useWindowProjectStylingHelpPanel leaves FA palette scanners idle unless the overlay menu reports open=true', async () => {
  const faTheme = await import('app/src/scripts/faTheme/faThemeCustomPropertyNames')
  const spy = vi.spyOn(faTheme, 'getFaColorCustomPropertyNamesForHelpPanel').mockReturnValue([
    '--palette'
  ])

  const { useWindowProjectStylingHelpPanel } = await import('../windowProjectStylingHelpPanel')

  const open = ref<boolean | undefined>(undefined)
  useWindowProjectStylingHelpPanel(open)

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
