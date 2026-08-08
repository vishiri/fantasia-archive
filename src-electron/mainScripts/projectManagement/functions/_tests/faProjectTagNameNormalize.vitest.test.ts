import { expect, test } from 'vitest'

import {
  areFaProjectTagNamesCaseInsensitiveEqual,
  normalizeFaProjectTagName
} from '../faProjectTagNameNormalize'

/**
 * normalizeFaProjectTagName
 * Trims surrounding whitespace from tag names.
 */
test('Test that normalizeFaProjectTagName trims whitespace', () => {
  expect(normalizeFaProjectTagName('  Heroes  ')).toBe('Heroes')
  expect(normalizeFaProjectTagName('')).toBe('')
})

/**
 * areFaProjectTagNamesCaseInsensitiveEqual
 * Treats case variants as the same tag name.
 */
test('Test that areFaProjectTagNamesCaseInsensitiveEqual ignores case', () => {
  expect(areFaProjectTagNamesCaseInsensitiveEqual('Player Party', 'player party')).toBe(true)
  expect(areFaProjectTagNamesCaseInsensitiveEqual('Heroes', 'Villains')).toBe(false)
})
