/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'

import { dispatchFaQuasarEscapeKeyEvent } from '../dialogManagementDismissWiring'

/**
 * dispatchFaQuasarEscapeKeyEvent
 * Dispatches a bubbled Escape event with keyCode 27 for Quasar escape-key.
 */
test('Test that dispatchFaQuasarEscapeKeyEvent dispatches Escape with keyCode 27', () => {
  const listener = vi.fn((event: Event) => {
    const keyboardEvent = event as KeyboardEvent
    expect(keyboardEvent.key).toBe('Escape')
    expect(keyboardEvent.code).toBe('Escape')
    expect(keyboardEvent.keyCode).toBe(27)
    expect(keyboardEvent.which).toBe(27)
  })
  window.addEventListener('keydown', listener)
  dispatchFaQuasarEscapeKeyEvent('keydown')
  window.removeEventListener('keydown', listener)
  expect(listener).toHaveBeenCalledOnce()
})
