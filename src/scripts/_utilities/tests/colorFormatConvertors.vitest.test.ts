import { expect, test } from 'vitest'
import { hexToRgb, rgbToHex } from '../colorFormatConvertors'

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
 * hexToRgb
 * Test that hex values convert to comma-separated RGB.
 */
test('Test that hexToRgb converts hex to rgb list format', () => {
  expect(hexToRgb('00ff80')).toBe('0,255,128')
})
