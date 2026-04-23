import { strToU8, zipSync } from 'fflate'
import { test, expect } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'
import { FA_PROGRAM_STYLING_STORE_DEFAULTS } from 'app/src-electron/mainScripts/programStyling/faProgramStylingStoreDefaults'
import { unzipProgramConfigBundle, zipProgramConfigBundle } from '../faProgramConfigBundle'
import { FA_PROGRAM_CONFIG_INNER, FA_PROGRAM_CONFIG_MAX_FILE_BYTES } from 'app/src-electron/shared/faProgramConfigConstants'

/**
 * zipProgramConfigBundle / unzipProgramConfigBundle
 * Round-trips a full three-file bundle.
 */
test('Test that zip and unzip round-trip the three allowlisted store JSON files', () => {
  const zipped = zipProgramConfigBundle({
    keybinds: { ...FA_KEYBINDS_STORE_DEFAULTS },
    programStyling: { ...FA_PROGRAM_STYLING_STORE_DEFAULTS },
    userSettings: { ...FA_USER_SETTINGS_DEFAULTS }
  })
  const { entries } = unzipProgramConfigBundle(zipped)
  const u = JSON.parse(entries.userSettings ?? '{}') as { languageCode: string }
  expect(u.languageCode).toBe('en-US')
  expect(entries.keybinds).toContain('schemaVersion')
  expect(entries.programStyling).toContain('css')
})

/**
 * unzipProgramConfigBundle
 * Ignores unknown entry names in the archive.
 */
test('Test that unzip drops unknown zip member names', () => {
  const junkName = 'evil-readme.txt'
  const us = JSON.stringify(FA_USER_SETTINGS_DEFAULTS)
  const z = zipSync({
    [FA_PROGRAM_CONFIG_INNER.userSettings]: strToU8(us, false),
    [junkName]: strToU8('be gone', false)
  })
  const { entries } = unzipProgramConfigBundle(z)
  expect(entries.userSettings).toBe(us)
})

test('Test that unzip throws when a allowlisted file exceeds the max byte cap', () => {
  const big = 'x'.repeat(FA_PROGRAM_CONFIG_MAX_FILE_BYTES + 1)
  const z = zipSync({
    [FA_PROGRAM_CONFIG_INNER.userSettings]: strToU8(big, false)
  })
  expect(() => unzipProgramConfigBundle(z)).toThrow(/too large/i)
})

test('Test that unzip throws when the sum of allowlisted file sizes exceeds the cap', () => {
  const half = 'y'.repeat(Math.floor(FA_PROGRAM_CONFIG_MAX_FILE_BYTES / 2) + 1)
  const z = zipSync({
    [FA_PROGRAM_CONFIG_INNER.keybinds]: strToU8(half, false),
    [FA_PROGRAM_CONFIG_INNER.userSettings]: strToU8(half, false)
  })
  expect(() => unzipProgramConfigBundle(z)).toThrow(/total too large/i)
})

test('Test that unzip finds allowlisted basenames in nested member paths', () => {
  const us = JSON.stringify(FA_USER_SETTINGS_DEFAULTS)
  const z = zipSync({
    [`nested/dir/${FA_PROGRAM_CONFIG_INNER.userSettings}`]: strToU8(us, false)
  })
  const { entries } = unzipProgramConfigBundle(z)
  expect(entries.userSettings).toBe(us)
})
