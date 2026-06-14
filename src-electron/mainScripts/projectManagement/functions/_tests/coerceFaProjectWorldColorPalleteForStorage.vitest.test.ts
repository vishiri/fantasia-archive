import { expect, test } from 'vitest'

import {
  coerceFaProjectWorldColorPalleteForStorage,
  hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates,
  isFaProjectWorldColorPalleteStorageValue
} from '../coerceFaProjectWorldColorPalleteForStorage'

/**
 * coerceFaProjectWorldColorPalleteForStorage
 * Returns empty string for blank input.
 */
test('Test that coerceFaProjectWorldColorPalleteForStorage returns empty for blank input', () => {
  expect(coerceFaProjectWorldColorPalleteForStorage(undefined, 2000)).toBe('')
  expect(coerceFaProjectWorldColorPalleteForStorage('   ', 2000)).toBe('')
})

/**
 * coerceFaProjectWorldColorPalleteForStorage
 * Uppercases valid semicolon-separated hex segments.
 */
test('Test that coerceFaProjectWorldColorPalleteForStorage normalizes valid palette segments', () => {
  expect(coerceFaProjectWorldColorPalleteForStorage('#aabbcc;#112233', 2000)).toBe('#AABBCC;#112233')
})

/**
 * coerceFaProjectWorldColorPalleteForStorage
 * Drops later duplicate hex segments using case-insensitive comparison.
 */
test('Test that coerceFaProjectWorldColorPalleteForStorage dedupes case-insensitive hex segments', () => {
  expect(coerceFaProjectWorldColorPalleteForStorage('#aabbcc;#AABBCC;#112233', 2000)).toBe('#AABBCC;#112233')
})

/**
 * coerceFaProjectWorldColorPalleteForStorage
 * Rejects invalid palette strings.
 */
test('Test that coerceFaProjectWorldColorPalleteForStorage rejects invalid palette strings', () => {
  expect(coerceFaProjectWorldColorPalleteForStorage('not-hex', 2000)).toBe('')
  expect(coerceFaProjectWorldColorPalleteForStorage('#aabbcc;bad', 2000)).toBe('')
})

/**
 * isFaProjectWorldColorPalleteStorageValue
 * Accepts empty segments between semicolons.
 */
test('Test that isFaProjectWorldColorPalleteStorageValue skips empty segments', () => {
  expect(isFaProjectWorldColorPalleteStorageValue('#AABBCC;;#112233', 2000)).toBe(true)
})

/**
 * isFaProjectWorldColorPalleteStorageValue
 * Rejects segments that are not #RRGGBB hex.
 */
test('Test that isFaProjectWorldColorPalleteStorageValue rejects invalid hex segments', () => {
  expect(isFaProjectWorldColorPalleteStorageValue('#AABBCC;bad', 2000)).toBe(false)
})

/**
 * coerceFaProjectWorldColorPalleteForStorage
 * Skips empty segments while normalizing.
 */
test('Test that coerceFaProjectWorldColorPalleteForStorage skips empty segments', () => {
  expect(coerceFaProjectWorldColorPalleteForStorage('#aabbcc;;#112233', 2000)).toBe('#AABBCC;#112233')
})

/**
 * isFaProjectWorldColorPalleteStorageValue
 * Enforces the 2000 character storage cap.
 */
test('Test that isFaProjectWorldColorPalleteStorageValue enforces max length', () => {
  expect(isFaProjectWorldColorPalleteStorageValue('a'.repeat(2001), 2000)).toBe(false)
  expect(isFaProjectWorldColorPalleteStorageValue('', 2000)).toBe(true)
})

/**
 * isFaProjectWorldColorPalleteStorageValue
 * Rejects duplicate #RRGGBB segments (case-insensitive).
 */
test('Test that isFaProjectWorldColorPalleteStorageValue rejects duplicate hex segments', () => {
  expect(isFaProjectWorldColorPalleteStorageValue('#AABBCC;#aabbcc', 2000)).toBe(false)
  expect(isFaProjectWorldColorPalleteStorageValue('#112233;#445566', 2000)).toBe(true)
})

/**
 * hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates
 * Returns false for blank palette strings.
 */
test('Test that hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates ignores blank input', () => {
  expect(hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates('')).toBe(false)
  expect(hasFaProjectWorldColorPalleteCaseInsensitiveDuplicates('   ')).toBe(false)
})

/**
 * coerceFaProjectWorldColorPalleteForStorage
 * Returns empty when the deduped palette still exceeds max length.
 */
test('Test that coerceFaProjectWorldColorPalleteForStorage rejects overlong deduped palettes', () => {
  expect(coerceFaProjectWorldColorPalleteForStorage('#112233;#445566', 10)).toBe('')
})
