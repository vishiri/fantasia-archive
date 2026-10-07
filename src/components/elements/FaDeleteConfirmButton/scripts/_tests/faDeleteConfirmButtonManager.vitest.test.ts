/** @vitest-environment jsdom */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { nextTick, ref } from 'vue'

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
  const api = useFaDeleteConfirmButton({
    isRemoveDisabled: () => false
  })
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
  const api = useFaDeleteConfirmButton({
    isRemoveDisabled: () => false
  })
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
  const api = useFaDeleteConfirmButton({
    isRemoveDisabled: () => false
  })
  api.onMenuShow()
  vi.advanceTimersByTime(2000)
  api.onMenuHide()
  expect(api.secondsRemaining.value).toBe(5)
})

/**
 * useFaDeleteConfirmButton
 * Disabling remove while the confirm menu is open must close it.
 */
test('Test that useFaDeleteConfirmButton closes the menu when remove becomes disabled', async () => {
  const removeDisabled = ref(false)
  const api = useFaDeleteConfirmButton({
    isRemoveDisabled: () => removeDisabled.value
  })
  api.menuOpen.value = true
  expect(api.secondsRemaining.value).toBe(5)

  removeDisabled.value = true
  await nextTick()
  expect(api.menuOpen.value).toBe(false)
  expect(api.secondsRemaining.value).toBe(5)
})
