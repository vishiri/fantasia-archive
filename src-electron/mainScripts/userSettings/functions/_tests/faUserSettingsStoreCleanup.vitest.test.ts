import { expect, test } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from '../../faUserSettingsDefaults'
import { isFaUserSettingsAppTheme } from 'app/types/faUserSettingsAppThemeRegistry'
import { isFaUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { buildSanitizedFaUserSettings } from '../faUserSettingsStoreCleanup'

/**
 * buildSanitizedFaUserSettings
 * Drops unknown keys and fills missing known keys from defaults.
 */
test('buildSanitizedFaUserSettings flags unexpected keys', () => {
  const {
    hasUnexpectedKeys,
    sanitized
  } = buildSanitizedFaUserSettings(
    {
      languageCode: 'fr',
      staleKey: true
    } as unknown as Parameters<typeof buildSanitizedFaUserSettings>[0],
    FA_USER_SETTINGS_DEFAULTS,
    isFaUserSettingsAppTheme,
    isFaUserSettingsLanguageCode
  )
  expect(hasUnexpectedKeys).toBe(true)
  expect(sanitized.languageCode).toBe('fr')
  expect(sanitized.appTheme).toBe(FA_USER_SETTINGS_DEFAULTS.appTheme)
})

/**
 * buildSanitizedFaUserSettings
 * Invalid persisted appTheme falls back to the default theme id.
 */
test('buildSanitizedFaUserSettings clamps invalid appTheme to default', () => {
  const {
    sanitized
  } = buildSanitizedFaUserSettings(
    {
      appTheme: 'notATheme'
    } as unknown as Parameters<typeof buildSanitizedFaUserSettings>[0],
    FA_USER_SETTINGS_DEFAULTS,
    isFaUserSettingsAppTheme,
    isFaUserSettingsLanguageCode
  )
  expect(sanitized.appTheme).toBe('darkThemeFantasy')
})

/**
 * buildSanitizedFaUserSettings
 * A language code outside the registry falls back to the default locale.
 */
test('buildSanitizedFaUserSettings clamps an invalid language code to the default', () => {
  const {
    sanitized
  } = buildSanitizedFaUserSettings(
    {
      languageCode: 'not-a-locale'
    } as unknown as Parameters<typeof buildSanitizedFaUserSettings>[0],
    FA_USER_SETTINGS_DEFAULTS,
    isFaUserSettingsAppTheme,
    isFaUserSettingsLanguageCode
  )
  expect(sanitized.languageCode).toBe('en-US')
})

/**
 * buildSanitizedFaUserSettings
 * A non-boolean flag falls back to the default instead of staying as junk.
 */
test('buildSanitizedFaUserSettings clamps a non-boolean flag to the default', () => {
  const {
    sanitized
  } = buildSanitizedFaUserSettings(
    {
      skipWelcomeScreen: 'yes'
    } as unknown as Parameters<typeof buildSanitizedFaUserSettings>[0],
    FA_USER_SETTINGS_DEFAULTS,
    isFaUserSettingsAppTheme,
    isFaUserSettingsLanguageCode
  )
  expect(sanitized.skipWelcomeScreen).toBe(false)
})
