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

/**
 * hexToRgb
 * Test that hex values convert to comma-separated RGB.
 */
test('Test that hexToRgb converts hex to rgb list format', () => {
  expect(hexToRgb('00ff80')).toBe('0,255,128')
})

/**
 * hexToRgb
 * Leading hash characters are ignored so common CSS-style hex strings parse correctly.
 */
test('Test that hexToRgb strips a leading hash before parsing', () => {
  expect(hexToRgb('#00ff80')).toBe('0,255,128')
})

/**
 * hexToRgb
 * Whitespace around the value is trimmed before parsing.
 */
test('Test that hexToRgb trims surrounding whitespace', () => {
  expect(hexToRgb('  #00ff80  ')).toBe('0,255,128')
})

/**
 * hexToRgb
 * An empty payload after trimming yields NaN bitwise channels, which normalize to zero in this implementation.
 */
test('Test that hexToRgb returns zero channels for an empty hex string', () => {
  expect(hexToRgb('')).toBe('0,0,0')
})
