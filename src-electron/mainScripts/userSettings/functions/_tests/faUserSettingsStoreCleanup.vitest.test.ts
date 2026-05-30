import { expect, test } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from '../../faUserSettingsDefaults'

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
    FA_USER_SETTINGS_DEFAULTS
  )
  expect(hasUnexpectedKeys).toBe(true)
  expect(sanitized.languageCode).toBe('fr')
  expect(sanitized.darkMode).toBe(FA_USER_SETTINGS_DEFAULTS.darkMode)
})
