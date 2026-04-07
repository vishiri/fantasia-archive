import { expect, test } from 'vitest'
import { specialCharacterFixer } from '../specialCharactersFixer'

/**
 * specialCharacterFixer
 * Test replacement of configured special characters.
 */
test('Test that specialCharacterFixer replaces configured characters', () => {
  expect(specialCharacterFixer('A@B|C')).toBe("A{'@'}B{'|'}C")
})

/**
 * specialCharacterFixer
 * Test passthrough for strings without targeted characters.
 */
test('Test that specialCharacterFixer keeps regular strings unchanged', () => {
  expect(specialCharacterFixer('plain-text')).toBe('plain-text')
})
