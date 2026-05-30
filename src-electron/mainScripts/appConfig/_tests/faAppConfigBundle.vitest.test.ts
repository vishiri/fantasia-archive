import { strToU8, zipSync } from 'fflate'
import { test, expect } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/keybinds_managerDefaults'
import { FA_APP_STYLING_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appStyling/appStyling_managerDefaults'
import { unzipAppConfigBundle, zipAppConfigBundle } from '../faAppConfigBundleWiring'
import { FA_APP_CONFIG_INNER, FA_APP_CONFIG_MAX_FILE_BYTES } from 'app/src-electron/shared/faAppConfigConstants'

test('Test that zip and unzip round-trip allowlisted store JSON files including noteboard', () => {
  const zipped = zipAppConfigBundle({
    keybinds: { ...FA_KEYBINDS_STORE_DEFAULTS },
    appNoteboard: {
      frame: null,
      schemaVersion: 1,
      text: 'nb'
    },
    appStyling: { ...FA_APP_STYLING_STORE_DEFAULTS },
    userSettings: { ...FA_USER_SETTINGS_DEFAULTS }
  })
  const { entries } = unzipAppConfigBundle(zipped)
  const u = JSON.parse(entries.userSettings ?? '{}') as { languageCode: string }
  expect(u.languageCode).toBe('en-US')
  expect(entries.keybinds).toContain('schemaVersion')
  expect(entries.appStyling).toContain('css')
  expect(entries.appNoteboard).toContain('nb')
})

/**
 * unzipAppConfigBundle
 * Ignores unknown entry names in the archive.
 */
test('Test that unzip drops unknown zip member names', () => {
  const junkName = 'evil-readme.txt'
  const us = JSON.stringify(FA_USER_SETTINGS_DEFAULTS)
  const z = zipSync({
    [FA_APP_CONFIG_INNER.userSettings]: strToU8(us, false),
    [junkName]: strToU8('be gone', false)
  })
  const { entries } = unzipAppConfigBundle(z)
  expect(entries.userSettings).toBe(us)
})

test('Test that unzip throws when a allowlisted file exceeds the max byte cap', () => {
  const big = 'x'.repeat(FA_APP_CONFIG_MAX_FILE_BYTES + 1)
  const z = zipSync({
    [FA_APP_CONFIG_INNER.userSettings]: strToU8(big, false)
  })
  expect(() => unzipAppConfigBundle(z)).toThrow(/too large/i)
})

test('Test that unzip throws when the sum of allowlisted file sizes exceeds the cap', () => {
  const half = 'y'.repeat(Math.floor(FA_APP_CONFIG_MAX_FILE_BYTES / 2) + 1)
  const z = zipSync({
    [FA_APP_CONFIG_INNER.keybinds]: strToU8(half, false),
    [FA_APP_CONFIG_INNER.userSettings]: strToU8(half, false)
  })
  expect(() => unzipAppConfigBundle(z)).toThrow(/total too large/i)
})

test('Test that unzip finds allowlisted basenames in nested member paths', () => {
  const us = JSON.stringify(FA_USER_SETTINGS_DEFAULTS)
  const z = zipSync({
    [`nested/dir/${FA_APP_CONFIG_INNER.userSettings}`]: strToU8(us, false)
  })
  const { entries } = unzipAppConfigBundle(z)
  expect(entries.userSettings).toBe(us)
})

test('Test that unzip ignores non-canonical store basenames', () => {
  const nb = JSON.stringify({
    frame: null,
    schemaVersion: 1,
    text: 'orphan'
  })
  const z = zipSync({
    'fa-non-canonical-noteboard.json': strToU8(nb, false),
    'fa-non-canonical-styling.json': strToU8('{}', false)
  })
  const { entries } = unzipAppConfigBundle(z)
  expect(entries.appNoteboard).toBeUndefined()
  expect(entries.appStyling).toBeUndefined()
})
