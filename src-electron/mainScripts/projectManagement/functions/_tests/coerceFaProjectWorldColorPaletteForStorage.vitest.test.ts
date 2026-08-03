import { expect, test } from 'vitest'

import {
  coerceFaProjectWorldColorPaletteForStorage,
  hasFaProjectWorldColorPaletteCaseInsensitiveDuplicates,
  isFaProjectWorldColorPaletteStorageValue
} from '../coerceFaProjectWorldColorPaletteForStorage'

/**
 * coerceFaProjectWorldColorPaletteForStorage
 * Returns empty string for blank input.
 */
test('Test that coerceFaProjectWorldColorPaletteForStorage returns empty for blank input', () => {
  expect(coerceFaProjectWorldColorPaletteForStorage(undefined, 2000)).toBe('')
  expect(coerceFaProjectWorldColorPaletteForStorage('   ', 2000)).toBe('')
})

/**
 * coerceFaProjectWorldColorPaletteForStorage
 * Uppercases valid semicolon-separated hex segments.
 */
test('Test that coerceFaProjectWorldColorPaletteForStorage normalizes valid palette segments', () => {
  expect(coerceFaProjectWorldColorPaletteForStorage('#aabbcc;#112233', 2000)).toBe('#AABBCC;#112233')
})

/**
 * coerceFaProjectWorldColorPaletteForStorage
 * Drops later duplicate hex segments using case-insensitive comparison.
 */
test('Test that coerceFaProjectWorldColorPaletteForStorage dedupes case-insensitive hex segments', () => {
  expect(coerceFaProjectWorldColorPaletteForStorage('#aabbcc;#AABBCC;#112233', 2000)).toBe('#AABBCC;#112233')
})

/**
 * coerceFaProjectWorldColorPaletteForStorage
 * Rejects invalid palette strings.
 */
test('Test that coerceFaProjectWorldColorPaletteForStorage rejects invalid palette strings', () => {
  expect(coerceFaProjectWorldColorPaletteForStorage('not-hex', 2000)).toBe('')
  expect(coerceFaProjectWorldColorPaletteForStorage('#aabbcc;bad', 2000)).toBe('')
})

/**
 * isFaProjectWorldColorPaletteStorageValue
 * Accepts empty segments between semicolons.
 */
test('Test that isFaProjectWorldColorPaletteStorageValue skips empty segments', () => {
  expect(isFaProjectWorldColorPaletteStorageValue('#AABBCC;;#112233', 2000)).toBe(true)
})

/**
 * isFaProjectWorldColorPaletteStorageValue
 * Rejects segments that are not #RRGGBB hex.
 */
test('Test that isFaProjectWorldColorPaletteStorageValue rejects invalid hex segments', () => {
  expect(isFaProjectWorldColorPaletteStorageValue('#AABBCC;bad', 2000)).toBe(false)
})

/**
 * coerceFaProjectWorldColorPaletteForStorage
 * Skips empty segments while normalizing.
 */
test('Test that coerceFaProjectWorldColorPaletteForStorage skips empty segments', () => {
  expect(coerceFaProjectWorldColorPaletteForStorage('#aabbcc;;#112233', 2000)).toBe('#AABBCC;#112233')
})

/**
 * isFaProjectWorldColorPaletteStorageValue
 * Enforces the 2000 character storage cap.
 */
test('Test that isFaProjectWorldColorPaletteStorageValue enforces max length', () => {
  expect(isFaProjectWorldColorPaletteStorageValue('a'.repeat(2001), 2000)).toBe(false)
  expect(isFaProjectWorldColorPaletteStorageValue('', 2000)).toBe(true)
})

/**
 * isFaProjectWorldColorPaletteStorageValue
 * Rejects duplicate #RRGGBB segments (case-insensitive).
 */
test('Test that isFaProjectWorldColorPaletteStorageValue rejects duplicate hex segments', () => {
  expect(isFaProjectWorldColorPaletteStorageValue('#AABBCC;#aabbcc', 2000)).toBe(false)
  expect(isFaProjectWorldColorPaletteStorageValue('#112233;#445566', 2000)).toBe(true)
})

/**
 * hasFaProjectWorldColorPaletteCaseInsensitiveDuplicates
 * Returns false for blank palette strings.
 */
test('Test that hasFaProjectWorldColorPaletteCaseInsensitiveDuplicates ignores blank input', () => {
  expect(hasFaProjectWorldColorPaletteCaseInsensitiveDuplicates('')).toBe(false)
  expect(hasFaProjectWorldColorPaletteCaseInsensitiveDuplicates('   ')).toBe(false)
})

/**
 * coerceFaProjectWorldColorPaletteForStorage
 * Returns empty when the deduped palette still exceeds max length.
 */
test('Test that coerceFaProjectWorldColorPaletteForStorage rejects overlong deduped palettes', () => {
  expect(coerceFaProjectWorldColorPaletteForStorage('#112233;#445566', 10)).toBe('')
})
