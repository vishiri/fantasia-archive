import { expect, test } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

import { FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES } from 'app/i18n/faUserSettingsLanguageDisplayNames'
import {
  buildFaUserSettingsLanguageSelectorLocales,
  FA_USER_SETTINGS_LANGUAGE_CODES
} from 'app/types/faUserSettingsLanguageRegistry'

import { GLOBAL_LANGUAGE_SELECTOR_LOCALES } from '../globalLanguageSelectorLocales_manager'

const repoRoot = path.resolve(import.meta.dirname, '../../../../../..')

const latinDisplayNameCollator = new Intl.Collator('en', {
  sensitivity: 'base',
  usage: 'sort'
})

/**
 * GLOBAL_LANGUAGE_SELECTOR_LOCALES
 * Lists supported interface locales with flag assets and i18n name keys.
 */
test('Test that GLOBAL_LANGUAGE_SELECTOR_LOCALES maps every supported language code', () => {
  expect(GLOBAL_LANGUAGE_SELECTOR_LOCALES).toHaveLength(FA_USER_SETTINGS_LANGUAGE_CODES.length)
  expect(GLOBAL_LANGUAGE_SELECTOR_LOCALES.map((row) => row.code).sort()).toEqual(
    [...FA_USER_SETTINGS_LANGUAGE_CODES].sort()
  )
})

/**
 * GLOBAL_LANGUAGE_SELECTOR_LOCALES
 * Menu order follows Latin alphabetical order of endonym display names.
 */
test('Test that GLOBAL_LANGUAGE_SELECTOR_LOCALES is sorted by Latin display name', () => {
  const displayNames = GLOBAL_LANGUAGE_SELECTOR_LOCALES.map((row) => {
    return FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES[row.languageNamesKey]
  })
  const expectedSortedDisplayNames = [...displayNames].sort((left, right) => {
    return latinDisplayNameCollator.compare(left, right)
  })

  expect(displayNames).toEqual(expectedSortedDisplayNames)
})

/**
 * GLOBAL_LANGUAGE_SELECTOR_LOCALES
 * Each interface locale points at an on-disk countryFlags SVG asset.
 */
test('Test that GLOBAL_LANGUAGE_SELECTOR_LOCALES flag assets exist on disk', () => {
  for (const row of buildFaUserSettingsLanguageSelectorLocales()) {
    const relativePath = row.flagSrc.replace(/^\//, '')
    const absolutePath = path.join(repoRoot, 'public', relativePath)
    expect(fs.existsSync(absolutePath), `${row.code} → ${row.flagSrc}`).toBe(true)
  }
})

/**
 * GLOBAL_LANGUAGE_SELECTOR_LOCALES
 * Swedish uses Sweden ISO 3166-1 alpha-2 se, not El Salvador sv.
 */
test('Test that Swedish locale uses the Sweden flag asset', () => {
  const swedishRow = GLOBAL_LANGUAGE_SELECTOR_LOCALES.find((row) => row.code === 'sv')
  expect(swedishRow?.flagSrc).toBe('/countryFlags/se.svg')
})
