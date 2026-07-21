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
 * Maps legacy doNotCollapseTreeOptions onto forceSublevelCollapseInTree: false and drops the old key.
 */
test('Test that migrateLegacyFaUserSettingsKeys maps doNotCollapseTreeOptions onto force off', () => {
  const migrated = migrateLegacyFaUserSettingsKeys({
    darkMode: true,
    doNotCollapseTreeOptions: true
  })

  expect(migrated.forceSublevelCollapseInTree).toBe(false)
  expect(migrated.doNotCollapseTreeOptions).toBeUndefined()
  expect(migrated.darkMode).toBe(true)
})

/**
 * migrateLegacyFaUserSettingsKeys
 * Prefer an already-present forceSublevelCollapseInTree boolean over legacy doNotCollapseTreeOptions.
 */
test('Test that migrateLegacyFaUserSettingsKeys keeps existing forceSublevelCollapseInTree', () => {
  const migrated = migrateLegacyFaUserSettingsKeys({
    doNotCollapseTreeOptions: true,
    forceSublevelCollapseInTree: true
  })

  expect(migrated.forceSublevelCollapseInTree).toBe(true)
  expect(migrated.doNotCollapseTreeOptions).toBeUndefined()
})

/**
 * migrateLegacyFaUserSettingsKeys
 * Maps legacy preventFilledNoteBoardPopup onto preventFilledAppNoteBoardPopup and drops the old key.
 */
test('Test that migrateLegacyFaUserSettingsKeys maps preventFilledNoteBoardPopup onto app key', () => {
  const migrated = migrateLegacyFaUserSettingsKeys({
    darkMode: true,
    preventFilledNoteBoardPopup: true
  })

  expect(migrated.preventFilledAppNoteBoardPopup).toBe(true)
  expect(migrated.preventFilledNoteBoardPopup).toBeUndefined()
  expect(migrated.darkMode).toBe(true)
})

/**
 * migrateLegacyFaUserSettingsKeys
 * Prefer legacy preventFilledNoteBoardPopup over a defaulted preventFilledAppNoteBoardPopup.
 */
test('Test that migrateLegacyFaUserSettingsKeys overwrites app noteboard prevent when legacy key is present', () => {
  const migrated = migrateLegacyFaUserSettingsKeys({
    preventFilledAppNoteBoardPopup: false,
    preventFilledNoteBoardPopup: true
  })

  expect(migrated.preventFilledAppNoteBoardPopup).toBe(true)
  expect(migrated.preventFilledNoteBoardPopup).toBeUndefined()
})

/**
 * migrateLegacyFaUserSettingsKeys
 * Non-object roots become an empty record so callers can fall through to schema validation.
 */
test('Test that migrateLegacyFaUserSettingsKeys returns an empty record for non-object input', () => {
  expect(migrateLegacyFaUserSettingsKeys(null)).toEqual({})
  expect(migrateLegacyFaUserSettingsKeys('x')).toEqual({})
})
