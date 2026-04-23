import { test, expect } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import {
  parseFaKeybindsRootFile,
  parseFaProgramStylingRootFile,
  parseFaUserSettingsFile
} from 'app/src-electron/shared/faProgramConfigFileSchema'

/**
 * faUserSettingsFileSchema
 * Accepts a full user settings object matching defaults shape.
 */
test('Test that parseFaUserSettingsFile accepts a valid full settings file', () => {
  const v = parseFaUserSettingsFile({ ...FA_USER_SETTINGS_DEFAULTS })
  expect(v.languageCode).toBe('en-US')
})

/**
 * faKeybindsRootFileSchema
 * Accepts schemaVersion and overrides with known command id.
 */
test('Test that parseFaKeybindsRootFile accepts a minimal keybinds root', () => {
  const v = parseFaKeybindsRootFile({
    overrides: {
      openProgramSettings: {
        code: 'KeyP',
        mods: ['ctrl']
      }
    },
    schemaVersion: 1
  })
  expect(v.schemaVersion).toBe(1)
})

/**
 * faProgramStylingRootFileSchema
 * Enforces max css length via shared bound.
 */
test('Test that parseFaProgramStylingRootFile normalizes a valid root', () => {
  const v = parseFaProgramStylingRootFile({
    css: 'body { margin:0 }',
    schemaVersion: 1
  })
  expect(v.css).toBe('body { margin:0 }')
  expect(v.schemaVersion).toBe(1)
})
