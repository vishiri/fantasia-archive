import { computed } from 'vue'
import { expect, test, vi } from 'vitest'

import { createFaLocaleTranslationsInputPresentationWiring } from '../faLocaleTranslationsInputPresentationWiring'

test('Test that createFaLocaleTranslationsInputPresentationWiring detects menuPanel presentation', () => {
  const fieldWiring = createFaLocaleTranslationsInputPresentationWiring({
    computed,
    nextTick: async () => {},
    readPreferredLanguageInputFocus: () => null,
    readPresentation: () => 'field'
  })
  expect(fieldWiring.isMenuPanelPresentation.value).toBe(false)

  const menuPanelWiring = createFaLocaleTranslationsInputPresentationWiring({
    computed,
    nextTick: async () => {},
    readPreferredLanguageInputFocus: () => null,
    readPresentation: () => 'menuPanel'
  })
  expect(menuPanelWiring.isMenuPanelPresentation.value).toBe(true)
})

test('Test that createFaLocaleTranslationsInputPresentationWiring focusPreferredLanguageInput schedules focus', async () => {
  const focus = vi.fn()
  const nextTick = vi.fn(async () => {})
  const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    callback(performance.now())
    return 1
  })
  const originalRequestAnimationFrame = window.requestAnimationFrame
  window.requestAnimationFrame = requestAnimationFrame

  const wiring = createFaLocaleTranslationsInputPresentationWiring({
    computed,
    nextTick,
    readPreferredLanguageInputFocus: () => focus,
    readPresentation: () => 'menuPanel'
  })

  wiring.focusPreferredLanguageInput()
  await Promise.resolve()

  expect(nextTick).toHaveBeenCalled()
  expect(requestAnimationFrame).toHaveBeenCalled()
  expect(focus).toHaveBeenCalled()

  window.requestAnimationFrame = originalRequestAnimationFrame
})

test('Test that createFaLocaleTranslationsInputPresentationWiring focusPreferredLanguageInput no-ops without focus fn', async () => {
  const wiring = createFaLocaleTranslationsInputPresentationWiring({
    computed,
    nextTick: async () => {},
    readPreferredLanguageInputFocus: () => null,
    readPresentation: () => 'menuPanel'
  })

  wiring.focusPreferredLanguageInput()
  await Promise.resolve()
})
