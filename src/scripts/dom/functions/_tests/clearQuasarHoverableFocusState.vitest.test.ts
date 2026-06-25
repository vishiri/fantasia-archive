/** @vitest-environment jsdom */

import { expect, test, vi } from 'vitest'

import { clearQuasarHoverableFocusState } from '../clearQuasarHoverableFocusState'

test('Test that clearQuasarHoverableFocusState blurs the hoverable element and its focus helper', () => {
  const element = document.createElement('div')
  element.classList.add('q-manual-focusable--focused')
  const focusHelper = document.createElement('div')
  focusHelper.className = 'q-focus-helper'
  element.append(focusHelper)
  document.body.append(element)

  const blurSpy = vi.spyOn(element, 'blur')
  const helperBlurSpy = vi.spyOn(focusHelper, 'blur')

  clearQuasarHoverableFocusState(element)

  expect(element.classList.contains('q-manual-focusable--focused')).toBe(false)
  expect(blurSpy).toHaveBeenCalledTimes(1)
  expect(helperBlurSpy).toHaveBeenCalledTimes(1)
})

/**
 * clearQuasarHoverableFocusState
 * No-ops when the element is null or undefined.
 */
test('Test that clearQuasarHoverableFocusState no-ops for null', () => {
  expect(() => clearQuasarHoverableFocusState(null)).not.toThrow()
})
