import { expect, test } from 'vitest'

import { isFaUserSettingsLanguageCode } from '../isFaUserSettingsLanguageCode'

/**
 * isFaUserSettingsLanguageCode
 * Accepts supported locale strings.
 */
test('Test that isFaUserSettingsLanguageCode returns true for en-US fr de', () => {
  expect(isFaUserSettingsLanguageCode('en-US')).toBe(true)
  expect(isFaUserSettingsLanguageCode('fr')).toBe(true)
  expect(isFaUserSettingsLanguageCode('de')).toBe(true)
})

/**
 * isFaUserSettingsLanguageCode
 * Rejects other strings.
 */
test('Test that isFaUserSettingsLanguageCode returns false for unsupported codes', () => {
  expect(isFaUserSettingsLanguageCode('es')).toBe(false)
  expect(isFaUserSettingsLanguageCode('')).toBe(false)
})
