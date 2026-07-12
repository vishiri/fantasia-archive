import { expect, test } from 'vitest'

import { normalizeFaProjectDocumentAppearanceColorForStorage } from '../faProjectDocumentAppearanceColorSchema'

/**
 * normalizeFaProjectDocumentAppearanceColorForStorage
 * Maps empty and whitespace strings to NULL.
 */
test('Test that normalizeFaProjectDocumentAppearanceColorForStorage maps empty to null', () => {
  expect(normalizeFaProjectDocumentAppearanceColorForStorage('')).toBeNull()
  expect(normalizeFaProjectDocumentAppearanceColorForStorage('   ')).toBeNull()
  expect(normalizeFaProjectDocumentAppearanceColorForStorage(null)).toBeNull()
  expect(normalizeFaProjectDocumentAppearanceColorForStorage(undefined)).toBeNull()
})

/**
 * normalizeFaProjectDocumentAppearanceColorForStorage
 * Uppercases valid #RRGGBB values.
 */
test('Test that normalizeFaProjectDocumentAppearanceColorForStorage uppercases valid hex', () => {
  expect(normalizeFaProjectDocumentAppearanceColorForStorage('#aabbcc')).toBe('#AABBCC')
})

/**
 * normalizeFaProjectDocumentAppearanceColorForStorage
 * Rejects invalid hex strings.
 */
test('Test that normalizeFaProjectDocumentAppearanceColorForStorage rejects invalid hex', () => {
  expect(() => normalizeFaProjectDocumentAppearanceColorForStorage('red')).toThrow(
    'Invalid document appearance color'
  )
})
