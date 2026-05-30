import { expect, test } from 'vitest'

import { FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES } from 'app/i18n/faUserSettingsLanguageDisplayNames'
import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'

import { GLOBAL_LANGUAGE_SELECTOR_LOCALES } from '../globalLanguageSelectorLocales_manager'

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
