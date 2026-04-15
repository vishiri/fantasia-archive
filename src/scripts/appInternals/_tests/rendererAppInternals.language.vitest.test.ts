import { expect, test, vi } from 'vitest'

import { i18n } from 'app/i18n/externalFileLoader'

import {
  applyFaI18nLocaleFromLanguageCode,
  applyFaUserSettingsLanguageSelection,
  isFaUserSettingsLanguageCode
} from '../rendererAppInternals'

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

/**
 * applyFaI18nLocaleFromLanguageCode
 * Updates the shared vue-i18n locale ref.
 */
test('Test that applyFaI18nLocaleFromLanguageCode sets i18n.global.locale', () => {
  applyFaI18nLocaleFromLanguageCode('de')
  expect(i18n.global.locale.value).toBe('de')
  applyFaI18nLocaleFromLanguageCode('en-US')
  expect(i18n.global.locale.value).toBe('en-US')
})

/**
 * applyFaUserSettingsLanguageSelection
 * Skips persistence when the code is unchanged.
 */
test('Test that applyFaUserSettingsLanguageSelection no-ops when language is already active', async () => {
  const updateSettings = vi.fn(async () => {
    // empty
  })

  await applyFaUserSettingsLanguageSelection(updateSettings, 'en-US', 'en-US')

  expect(updateSettings).not.toHaveBeenCalled()
})

/**
 * applyFaUserSettingsLanguageSelection
 * Delegates persistence to updateSettings when the code changes (locale switches inside the store before notify).
 */
test('Test that applyFaUserSettingsLanguageSelection calls updateSettings with the new language code', async () => {
  const updateSettings = vi.fn(async () => {
    // empty
  })

  await applyFaUserSettingsLanguageSelection(updateSettings, 'fr', 'en-US')

  expect(updateSettings).toHaveBeenCalledWith({ languageCode: 'fr' })
})
