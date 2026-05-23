import { expect, test, vi } from 'vitest'

import { i18n } from 'app/i18n/externalFileLoader'

import * as faInterfaceTextDirection from '../faInterfaceTextDirection'
import {
  applyFaI18nLocaleFromLanguageCode,
  applyFaUserSettingsLanguageSelection,
  isFaUserSettingsLanguageCode
} from '../rendererAppInternals'

/**
 * isFaUserSettingsLanguageCode
 * Accepts supported locale strings.
 */
test('Test that isFaUserSettingsLanguageCode returns true for supported locale codes', () => {
  expect(isFaUserSettingsLanguageCode('en-US')).toBe(true)
  expect(isFaUserSettingsLanguageCode('fr')).toBe(true)
  expect(isFaUserSettingsLanguageCode('de')).toBe(true)
  expect(isFaUserSettingsLanguageCode('es')).toBe(true)
  expect(isFaUserSettingsLanguageCode('ja')).toBe(true)
})

/**
 * isFaUserSettingsLanguageCode
 * Rejects other strings.
 */
test('Test that isFaUserSettingsLanguageCode returns false for unsupported codes', () => {
  expect(isFaUserSettingsLanguageCode('xx')).toBe(false)
  expect(isFaUserSettingsLanguageCode('')).toBe(false)
})

/**
 * applyFaI18nLocaleFromLanguageCode
 * Updates the shared vue-i18n locale ref and applies root text direction.
 */
test('Test that applyFaI18nLocaleFromLanguageCode sets i18n.global.locale', () => {
  const directionSpy = vi.spyOn(faInterfaceTextDirection, 'applyFaInterfaceTextDirectionFromLanguageCode')

  applyFaI18nLocaleFromLanguageCode('de')
  expect(i18n.global.locale.value).toBe('de')
  expect(directionSpy).toHaveBeenCalledWith('de')

  applyFaI18nLocaleFromLanguageCode('en-US')
  expect(i18n.global.locale.value).toBe('en-US')
  expect(directionSpy).toHaveBeenLastCalledWith('en-US')

  directionSpy.mockRestore()
})

/**
 * applyFaI18nLocaleFromLanguageCode
 * Arabic delegates rtl direction apply through the shared helper.
 */
test('Test that applyFaI18nLocaleFromLanguageCode applies rtl when Arabic is selected', () => {
  const directionSpy = vi.spyOn(faInterfaceTextDirection, 'applyFaInterfaceTextDirectionFromLanguageCode')

  applyFaI18nLocaleFromLanguageCode('ar')
  expect(i18n.global.locale.value).toBe('ar')
  expect(directionSpy).toHaveBeenCalledWith('ar')

  directionSpy.mockRestore()
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
