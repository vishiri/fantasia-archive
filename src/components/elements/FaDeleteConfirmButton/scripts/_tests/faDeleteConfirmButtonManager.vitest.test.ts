/** @vitest-environment jsdom */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { useFaDeleteConfirmButton } from '../faDeleteConfirmButton_manager'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

/**
 * useFaDeleteConfirmButton exposes countdown-gated confirm delete.
 */
test('Test that useFaDeleteConfirmButton blocks confirm until countdown finishes', () => {
  const api = useFaDeleteConfirmButton()
  const onConfirm = vi.fn()
  api.onConfirmDelete(onConfirm)
  expect(onConfirm).not.toHaveBeenCalled()
  api.onMenuShow()
  while (api.secondsRemaining.value > 0) {
    vi.advanceTimersByTime(1000)
  }
  api.onConfirmDelete(onConfirm)
  expect(onConfirm).toHaveBeenCalledTimes(1)
  expect(api.menuOpen.value).toBe(false)
})

/**
 * useFaDeleteConfirmButton starts countdown when menu opens via v-model.
 */
test('Test that useFaDeleteConfirmButton watch restarts countdown when menu opens', () => {
  const api = useFaDeleteConfirmButton()
  api.menuOpen.value = true
  expect(api.secondsRemaining.value).toBe(5)
  vi.advanceTimersByTime(3000)
  api.menuOpen.value = false
  expect(api.secondsRemaining.value).toBe(5)
})

/**
 * useFaDeleteConfirmButton resets countdown when menu hides.
 */
test('Test that useFaDeleteConfirmButton resets countdown on menu hide', () => {
  const api = useFaDeleteConfirmButton()
  api.onMenuShow()
  vi.advanceTimersByTime(2000)
  api.onMenuHide()
  expect(api.secondsRemaining.value).toBe(5)
})
