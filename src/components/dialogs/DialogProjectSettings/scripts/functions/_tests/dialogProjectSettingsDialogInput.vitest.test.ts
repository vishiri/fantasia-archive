import { expect, test } from 'vitest'

import {
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB,
  FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB,
  isDialogProjectSettingsDirectInput,
  isDialogProjectSettingsSaveDisabled,
  isDialogProjectSettingsStoreTarget
} from '../dialogProjectSettingsDialogInput'

/**
 * isDialogProjectSettingsDirectInput
 * Accepts only the ProjectSettings dialog name.
 */
test('Test that isDialogProjectSettingsDirectInput matches ProjectSettings only', () => {
  expect(isDialogProjectSettingsDirectInput('ProjectSettings')).toBe(true)
  expect(isDialogProjectSettingsDirectInput('AppSettings')).toBe(false)
  expect(isDialogProjectSettingsDirectInput(undefined)).toBe(false)
})

/**
 * isDialogProjectSettingsStoreTarget
 * Accepts only the ProjectSettings store routing target.
 */
test('Test that isDialogProjectSettingsStoreTarget matches ProjectSettings only', () => {
  expect(isDialogProjectSettingsStoreTarget('ProjectSettings')).toBe(true)
  expect(isDialogProjectSettingsStoreTarget('Other')).toBe(false)
})

/**
 * isDialogProjectSettingsSaveDisabled
 * Treats whitespace-only names as invalid.
 */
test('Test that isDialogProjectSettingsSaveDisabled is true for blank names', () => {
  expect(isDialogProjectSettingsSaveDisabled('')).toBe(true)
  expect(isDialogProjectSettingsSaveDisabled('   ')).toBe(true)
  expect(isDialogProjectSettingsSaveDisabled('Valid')).toBe(false)
})

/**
 * FA_DIALOG_PROJECT_SETTINGS_* tab ids
 * Export stable tab keys for General and Worlds panels.
 */
test('Test that project settings tab constants are stable strings', () => {
  expect(FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB).toBe('generalSettings')
  expect(FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB).toBe('worldsSettings')
})
