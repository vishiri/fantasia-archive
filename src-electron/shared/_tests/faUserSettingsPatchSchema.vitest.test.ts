import { expect, test } from 'vitest'
import { ZodError } from 'zod'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'

import { faUserSettingsPatchSchema, parseFaUserSettingsPatch } from '../faUserSettingsPatchSchema'

/**
 * parseFaUserSettingsPatch
 * Accepts an empty object as a no-op patch.
 */
test('Test that parseFaUserSettingsPatch accepts empty plain object', () => {
  expect(parseFaUserSettingsPatch({})).toEqual({})
})

/**
 * parseFaUserSettingsPatch
 * Accepts a single known boolean field.
 */
test('Test that parseFaUserSettingsPatch accepts a single-key boolean patch', () => {
  expect(parseFaUserSettingsPatch({ darkMode: true })).toEqual({ darkMode: true })
})

/**
 * parseFaUserSettingsPatch
 * Accepts a languageCode patch with a supported locale.
 */
test('Test that parseFaUserSettingsPatch accepts languageCode enum values', () => {
  expect(parseFaUserSettingsPatch({ languageCode: 'fr' })).toEqual({ languageCode: 'fr' })
  expect(parseFaUserSettingsPatch({ languageCode: 'de' })).toEqual({ languageCode: 'de' })
  expect(parseFaUserSettingsPatch({ languageCode: 'en-US' })).toEqual({ languageCode: 'en-US' })
})

/**
 * parseFaUserSettingsPatch
 * Rejects invalid languageCode strings.
 */
test('Test that parseFaUserSettingsPatch throws ZodError for invalid languageCode', () => {
  expect(() => {
    parseFaUserSettingsPatch({ languageCode: 'es' })
  }).toThrow(ZodError)
})

/**
 * parseFaUserSettingsPatch
 * Rejects non-string languageCode.
 */
test('Test that parseFaUserSettingsPatch throws ZodError when languageCode is not a string', () => {
  expect(() => {
    parseFaUserSettingsPatch({ languageCode: true })
  }).toThrow(ZodError)
})

/**
 * parseFaUserSettingsPatch
 * Accepts a full snapshot-shaped object with all known keys.
 */
test('Test that parseFaUserSettingsPatch accepts full settings object', () => {
  const full = { ...FA_USER_SETTINGS_DEFAULTS }
  expect(parseFaUserSettingsPatch(full)).toEqual(full)
})

/**
 * parseFaUserSettingsPatch
 * Rejects unknown keys under strict schema.
 */
test('Test that parseFaUserSettingsPatch throws ZodError for unknown key', () => {
  expect(() => {
    parseFaUserSettingsPatch({
      darkMode: true,
      futureKey: true
    })
  }).toThrow(ZodError)
})

/**
 * parseFaUserSettingsPatch
 * Rejects wrong type for a known key.
 */
test('Test that parseFaUserSettingsPatch throws ZodError when boolean field is string', () => {
  expect(() => {
    parseFaUserSettingsPatch({ darkMode: 'true' })
  }).toThrow(ZodError)
})

/**
 * parseFaUserSettingsPatch
 * Rejects null for a known key value.
 */
test('Test that parseFaUserSettingsPatch throws ZodError when boolean field is null', () => {
  expect(() => {
    parseFaUserSettingsPatch({ darkMode: null })
  }).toThrow(ZodError)
})

/**
 * parseFaUserSettingsPatch
 * Rejects non-plain object root with TypeError.
 */
test('Test that parseFaUserSettingsPatch throws TypeError for null root', () => {
  expect(() => {
    parseFaUserSettingsPatch(null)
  }).toThrow(TypeError)
})

/**
 * parseFaUserSettingsPatch
 * Rejects array root with TypeError.
 */
test('Test that parseFaUserSettingsPatch throws TypeError for array root', () => {
  expect(() => {
    parseFaUserSettingsPatch([])
  }).toThrow(TypeError)
})

/**
 * parseFaUserSettingsPatch
 * Rejects Date instance root because it is not a plain record.
 */
test('Test that parseFaUserSettingsPatch throws TypeError for Date root', () => {
  expect(() => {
    parseFaUserSettingsPatch(new Date())
  }).toThrow(TypeError)
})

/**
 * faUserSettingsPatchSchema
 * Rejects nested object used as a field value.
 */
test('Test that faUserSettingsPatchSchema rejects nested object for boolean field', () => {
  expect(() => {
    faUserSettingsPatchSchema.parse({ darkMode: { value: true } })
  }).toThrow(ZodError)
})
