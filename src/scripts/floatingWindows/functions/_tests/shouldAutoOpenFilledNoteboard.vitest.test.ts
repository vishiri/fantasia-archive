import { expect, test } from 'vitest'

import {
  maybeAutoOpenFilledNoteboard,
  shouldAutoOpenFilledNoteboard
} from '../shouldAutoOpenFilledNoteboard'

/**
 * shouldAutoOpenFilledNoteboard
 * Returns false when the prevent setting is enabled even if text is filled.
 */
test('Test that shouldAutoOpenFilledNoteboard is false when prevent is true', () => {
  expect(shouldAutoOpenFilledNoteboard({
    preventFilledPopup: true,
    text: 'notes'
  })).toBe(false)
})

/**
 * shouldAutoOpenFilledNoteboard
 * Returns false for empty and whitespace-only text.
 */
test('Test that shouldAutoOpenFilledNoteboard is false for empty or whitespace text', () => {
  expect(shouldAutoOpenFilledNoteboard({
    preventFilledPopup: false,
    text: ''
  })).toBe(false)
  expect(shouldAutoOpenFilledNoteboard({
    preventFilledPopup: false,
    text: '   \n\t'
  })).toBe(false)
})

/**
 * shouldAutoOpenFilledNoteboard
 * Returns true when prevent is off and trimmed text is non-empty.
 */
test('Test that shouldAutoOpenFilledNoteboard is true for filled text when prevent is false', () => {
  expect(shouldAutoOpenFilledNoteboard({
    preventFilledPopup: false,
    text: '  hello  '
  })).toBe(true)
})

/**
 * maybeAutoOpenFilledNoteboard
 * Calls setWindowOpen(true) only when canOpen and shouldAutoOpen agree.
 */
test('Test that maybeAutoOpenFilledNoteboard opens only when allowed and filled', () => {
  const opened: boolean[] = []
  const setWindowOpen = (open: boolean): void => {
    opened.push(open)
  }

  maybeAutoOpenFilledNoteboard({
    canOpen: false,
    preventFilledPopup: false,
    setWindowOpen,
    text: 'notes'
  })
  expect(opened).toEqual([])

  maybeAutoOpenFilledNoteboard({
    canOpen: true,
    preventFilledPopup: true,
    setWindowOpen,
    text: 'notes'
  })
  expect(opened).toEqual([])

  maybeAutoOpenFilledNoteboard({
    canOpen: true,
    preventFilledPopup: false,
    setWindowOpen,
    text: ''
  })
  expect(opened).toEqual([])

  maybeAutoOpenFilledNoteboard({
    canOpen: true,
    preventFilledPopup: false,
    setWindowOpen,
    text: 'notes'
  })
  expect(opened).toEqual([true])
})
