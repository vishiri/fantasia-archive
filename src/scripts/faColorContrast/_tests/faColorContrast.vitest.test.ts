import { expect, test, vi } from 'vitest'

import {
  FA_COLOR_CONTRAST_BLACK_HEX,
  FA_COLOR_CONTRAST_NEGATIVE_HEX,
  FA_DIALOG_PROJECT_SETTINGS_WORLD_COLOR_PALETTE_DUPLICATE_ICON_MIN_CONTRAST_RATIO
} from 'app/types/I_faColorContrast'
import {
  calculateFaColorContrastRatio,
  parseFaColorContrastHexToRgb,
  resolveFaDuplicatePaletteIconQuasarColor
} from '../functions/faColorContrast'

/**
 * parseFaColorContrastHexToRgb
 * Accepts #RGB and #RRGGBB hex strings.
 */
test('Test that parseFaColorContrastHexToRgb parses shorthand and full hex colors', () => {
  expect(parseFaColorContrastHexToRgb('#f00')).toEqual({
    b: 0,
    g: 0,
    r: 255
  })
  expect(parseFaColorContrastHexToRgb('#ff0000')).toEqual({
    b: 0,
    g: 0,
    r: 255
  })
  expect(parseFaColorContrastHexToRgb('invalid')).toBeNull()
  expect(parseFaColorContrastHexToRgb('  #abc  ')).toEqual({
    b: 204,
    g: 187,
    r: 170
  })
})

/**
 * parseFaColorContrastHexToRgb
 * Returns null when parseInt yields NaN for a matched hex group.
 */
test('Test that parseFaColorContrastHexToRgb returns null when hex parse yields NaN', () => {
  const parseIntSpy = vi.spyOn(Number, 'parseInt').mockReturnValueOnce(Number.NaN)
  expect(parseFaColorContrastHexToRgb('#abcdef')).toBeNull()
  parseIntSpy.mockRestore()
})

/**
 * parseFaColorContrastHexToRgb
 * Returns null when the regex match omits the hex capture group.
 */
test('Test that parseFaColorContrastHexToRgb returns null when the hex capture group is missing', () => {
  const execSpy = vi.spyOn(RegExp.prototype, 'exec').mockReturnValueOnce([
    '#abc',
    undefined,
    undefined,
    undefined,
    undefined,
    '#abc',
    0,
    '#abc'
  ] as unknown as RegExpExecArray)
  expect(parseFaColorContrastHexToRgb('#abc')).toBeNull()
  execSpy.mockRestore()
})

/**
 * calculateFaColorContrastRatio
 * Reports higher contrast for black-on-white than red-on-red.
 */
test('Test that calculateFaColorContrastRatio ranks black on white above red on red', () => {
  const blackOnWhite = calculateFaColorContrastRatio('#000000', '#ffffff')
  const negativeOnRed = calculateFaColorContrastRatio(FA_COLOR_CONTRAST_NEGATIVE_HEX, '#ff0000')
  expect(blackOnWhite).not.toBeNull()
  expect(negativeOnRed).not.toBeNull()
  if (blackOnWhite === null || negativeOnRed === null) {
    return
  }
  expect(blackOnWhite).toBeGreaterThan(negativeOnRed)
})

/**
 * calculateFaColorContrastRatio
 * Returns null when either color string is not a valid hex value.
 */
test('Test that calculateFaColorContrastRatio returns null for invalid hex input', () => {
  expect(calculateFaColorContrastRatio('not-a-color', '#ffffff')).toBeNull()
  expect(calculateFaColorContrastRatio('#000000', 'not-a-color')).toBeNull()
})

/**
 * resolveFaDuplicatePaletteIconQuasarColor
 * Uses black on saturated red swatches and negative on light swatches.
 */
test('Test that resolveFaDuplicatePaletteIconQuasarColor switches to black on low-contrast reds', () => {
  expect(resolveFaDuplicatePaletteIconQuasarColor(
    '#ff0000',
    FA_COLOR_CONTRAST_NEGATIVE_HEX,
    FA_COLOR_CONTRAST_BLACK_HEX,
    FA_DIALOG_PROJECT_SETTINGS_WORLD_COLOR_PALETTE_DUPLICATE_ICON_MIN_CONTRAST_RATIO
  )).toBe('black')
  expect(resolveFaDuplicatePaletteIconQuasarColor(
    '#ffffff',
    FA_COLOR_CONTRAST_NEGATIVE_HEX,
    FA_COLOR_CONTRAST_BLACK_HEX,
    FA_DIALOG_PROJECT_SETTINGS_WORLD_COLOR_PALETTE_DUPLICATE_ICON_MIN_CONTRAST_RATIO
  )).toBe('negative')
  expect(resolveFaDuplicatePaletteIconQuasarColor(
    'not-a-color',
    FA_COLOR_CONTRAST_NEGATIVE_HEX,
    FA_COLOR_CONTRAST_BLACK_HEX,
    FA_DIALOG_PROJECT_SETTINGS_WORLD_COLOR_PALETTE_DUPLICATE_ICON_MIN_CONTRAST_RATIO
  )).toBe('black')
})
