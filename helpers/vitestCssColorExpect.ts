import { expect } from 'vitest'

import { rgbToHex } from 'app/src/scripts/_utilities/functions/colorFormatConvertors'

/**
 * Normalizes hex or rgb()/rgba() CSS color strings to lowercase '#rrggbb'.
 */
export function normalizeCssColorToLowerHex (color: string): string {
  const trimmed = color.trim()
  if (trimmed.startsWith('#')) {
    return trimmed.toLowerCase()
  }
  const hex = rgbToHex(trimmed)
  if (hex === false) {
    throw new Error(`Unrecognized CSS color: ${color}`)
  }
  return hex.toLowerCase()
}

/**
 * Compares CSS color values from inline styles across jsdom (rgb) and happy-dom (hex).
 */
export function expectCssColorValue (actual: string, expectedHex: string): void {
  expect(normalizeCssColorToLowerHex(actual)).toBe(expectedHex.toLowerCase())
}

/**
 * Asserts a CSS property inside a style attribute string matches the expected hex color.
 */
export function expectInlineStyleColor (
  style: string | undefined,
  property: string,
  expectedHex: string
): void {
  const pattern = new RegExp(`${property}:\\s*([^;]+)`)
  const match = style?.match(pattern)
  const colorValue = match?.[1]
  expect(colorValue).toBeTruthy()
  expectCssColorValue(colorValue as string, expectedHex)
}
