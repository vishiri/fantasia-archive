import { expect, test } from 'vitest'

import { parseFaProjectOverlayFinitePx } from '../faProjectOverlayFrameKvShared'

/**
 * parseFaProjectOverlayFinitePx
 * Returns undefined for empty or non-finite stored values.
 */
test('Test that parseFaProjectOverlayFinitePx rejects empty and invalid strings', () => {
  expect(parseFaProjectOverlayFinitePx(undefined)).toBeUndefined()
  expect(parseFaProjectOverlayFinitePx('')).toBeUndefined()
  expect(parseFaProjectOverlayFinitePx('   ')).toBeUndefined()
  expect(parseFaProjectOverlayFinitePx('not-a-number')).toBeUndefined()
})

/**
 * parseFaProjectOverlayFinitePx
 * Parses finite numeric strings into numbers.
 */
test('Test that parseFaProjectOverlayFinitePx parses finite numbers', () => {
  expect(parseFaProjectOverlayFinitePx('12')).toBe(12)
  expect(parseFaProjectOverlayFinitePx(' 24.5 ')).toBe(24.5)
})
