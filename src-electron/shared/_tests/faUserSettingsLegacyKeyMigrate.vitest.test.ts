import { expect, test } from 'vitest'

import { migrateLegacyFaUserSettingsKeys } from '../faUserSettingsLegacyKeyMigrate'

/**
 * migrateLegacyFaUserSettingsKeys
 * Copies legacy disableDocumentControlBar* booleans onto disableAppControlBar* and drops old keys.
 */
test('Test that migrateLegacyFaUserSettingsKeys maps legacy control bar keys onto new keys', () => {
  const migrated = migrateLegacyFaUserSettingsKeys({
    darkMode: true,
    disableDocumentControlBar: true,
    disableDocumentControlBarGuides: true
  })

  expect(migrated.disableAppControlBar).toBe(true)
  expect(migrated.disableAppControlBarGuides).toBe(true)
  expect(migrated.disableDocumentControlBar).toBeUndefined()
  expect(migrated.disableDocumentControlBarGuides).toBeUndefined()
  expect(migrated.darkMode).toBe(true)
})

/**
 * migrateLegacyFaUserSettingsKeys
 * Prefer legacy boolean over a defaulted new key so first post-upgrade load keeps the saved preference.
 */
test('Test that migrateLegacyFaUserSettingsKeys overwrites new keys when legacy keys are present', () => {
  const migrated = migrateLegacyFaUserSettingsKeys({
    disableAppControlBar: false,
    disableDocumentControlBar: true
  })

  expect(migrated.disableAppControlBar).toBe(true)
  expect(migrated.disableDocumentControlBar).toBeUndefined()
})

/**
 * migrateLegacyFaUserSettingsKeys
 * Non-object roots become an empty record so callers can fall through to schema validation.
 */
test('Test that migrateLegacyFaUserSettingsKeys returns an empty record for non-object input', () => {
  expect(migrateLegacyFaUserSettingsKeys(null)).toEqual({})
  expect(migrateLegacyFaUserSettingsKeys('x')).toEqual({})
})
