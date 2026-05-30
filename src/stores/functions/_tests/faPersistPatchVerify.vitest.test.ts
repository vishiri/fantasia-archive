import { expect, test } from 'vitest'

import { didCssPatchPersist, didObjectPatchPersist } from '../faPersistPatchVerify'

/**
 * didObjectPatchPersist
 * Compares each patch key to the retrieved object with strict equality.
 */
test('Test that didObjectPatchPersist is true only when every patch key matches', () => {
  expect(didObjectPatchPersist({ languageCode: 'en-US' }, {
    languageCode: 'en-US',
    theme: 'dark'
  })).toBe(true)
  expect(didObjectPatchPersist({ languageCode: 'fr' }, { languageCode: 'en-US' })).toBe(false)
})

/**
 * didCssPatchPersist
 * True when retrieved CSS equals the expected editor value.
 */
test('Test that didCssPatchPersist compares css strings', () => {
  expect(didCssPatchPersist('a { }', 'a { }')).toBe(true)
  expect(didCssPatchPersist('a { }', 'b { }')).toBe(false)
})
