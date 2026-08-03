import { expect, test } from 'vitest'
import { rgbToHex } from '../functions/colorFormatConvertors'

/**
 * rgbToHex
 * Test that RGB string values convert to a hex color.
 */
test('Test that rgbToHex converts rgb-like numbers to hex', () => {
  expect(rgbToHex('rgb(255, 0, 128)')).toBe('#ff0080')
})

/**
 * rgbToHex
 * Single-digit channel hex values receive a leading zero when building the hex string.
 */
test('Test that rgbToHex pads hex nibbles shorter than two characters', () => {
  expect(rgbToHex('rgb(5, 6, 7)')).toBe('#050607')
})

/**
 * rgbToHex
 * Test that invalid values return false.
 */
test('Test that rgbToHex returns false for invalid values', () => {
  expect(rgbToHex('not-a-color')).toBe(false)
})

/**
 * rgbToHex
 * rgba() strings from computed styles include alpha digit groups; only the first three channels become hex.
 */
test('Test that rgbToHex ignores alpha channel segments after the first three RGB groups', () => {
  expect(rgbToHex('rgba(255, 0, 128, 0.5)')).toBe('#ff0080')
})

/**
 * rgbToHex
 * Fewer than three numeric channels cannot form a full RGB hex triplet.
 */
test('Test that rgbToHex returns false when fewer than three numeric channels are present', () => {
  expect(rgbToHex('rgb(9, 10)')).toBe(false)
})
