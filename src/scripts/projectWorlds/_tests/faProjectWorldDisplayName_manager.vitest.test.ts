import { expect, test } from 'vitest'

import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'
import { FA_PROJECT_WORLD_DISPLAY_NAME_TRANSLATION_MAX_LENGTH } from 'app/types/I_faProjectWorldDisplayNameTranslations'

import {
  hasFaProjectWorldDisplayNameTranslation,
  normalizeFaProjectWorldDisplayNameTranslations,
  resolveFaProjectWorldDisplayName,
  resolveFaProjectWorldDisplayNameForStorage,
  resolveFaProjectWorldDisplayNameLanguageCode
} from '../faProjectWorldDisplayName_manager'

test('Test that resolveFaProjectWorldDisplayName returns preferred language when present', () => {
  const displayNameTranslations = {
    'en-US': 'English',
    de: 'German'
  }
  expect(resolveFaProjectWorldDisplayName(displayNameTranslations, 'de')).toBe('German')
  expect(resolveFaProjectWorldDisplayNameLanguageCode(displayNameTranslations, 'de')).toBe('de')
})

test('Test that resolveFaProjectWorldDisplayName falls back to en-US', () => {
  const displayNameTranslations = {
    'en-US': 'English',
    de: ''
  }
  expect(resolveFaProjectWorldDisplayName(displayNameTranslations, 'de')).toBe('English')
  expect(resolveFaProjectWorldDisplayNameLanguageCode(displayNameTranslations, 'de')).toBe('en-US')
})

test('Test that resolveFaProjectWorldDisplayName returns empty when no translations exist', () => {
  expect(resolveFaProjectWorldDisplayName({}, 'en-US')).toBe('')
})

test('Test that hasFaProjectWorldDisplayNameTranslation detects any non-empty locale', () => {
  expect(hasFaProjectWorldDisplayNameTranslation({ de: '  ' })).toBe(false)
  expect(hasFaProjectWorldDisplayNameTranslation({ de: ' Realm ' })).toBe(true)
})

test('Test that resolveFaProjectWorldDisplayNameForStorage uses en-US fallback chain', () => {
  expect(resolveFaProjectWorldDisplayNameForStorage({ de: 'German only' })).toBe('German only')
})

test('Test that normalizeFaProjectWorldDisplayNameTranslations trims and drops empty keys', () => {
  expect(normalizeFaProjectWorldDisplayNameTranslations({
    'en-US': '  Realm  ',
    de: '   '
  })).toEqual({
    'en-US': 'Realm'
  })
})

test('Test that world display name normalize respects max length constant', () => {
  const longValue = 'x'.repeat(FA_PROJECT_WORLD_DISPLAY_NAME_TRANSLATION_MAX_LENGTH + 10)
  const normalized = normalizeFaProjectWorldDisplayNameTranslations({
    'en-US': longValue
  })
  expect(normalized['en-US']?.length).toBe(FA_PROJECT_WORLD_DISPLAY_NAME_TRANSLATION_MAX_LENGTH)
  expect(FA_USER_SETTINGS_LANGUAGE_CODES.length).toBeGreaterThan(0)
})
