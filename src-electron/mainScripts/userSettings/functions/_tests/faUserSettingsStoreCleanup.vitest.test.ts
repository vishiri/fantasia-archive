import { expect, test } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from '../../faUserSettingsDefaults'
import { isFaUserSettingsAppTheme } from 'app/types/faUserSettingsAppThemeRegistry'

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
    isFaUserSettingsAppTheme
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
    isFaUserSettingsAppTheme
  )
  expect(sanitized.appTheme).toBe('darkThemeFantasy')
})
