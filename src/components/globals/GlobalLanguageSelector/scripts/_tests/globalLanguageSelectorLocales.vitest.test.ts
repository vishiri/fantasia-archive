import { expect, test } from 'vitest'

import { GLOBAL_LANGUAGE_SELECTOR_LOCALES } from '../globalLanguageSelectorLocales'

/**
 * GLOBAL_LANGUAGE_SELECTOR_LOCALES
 * Lists the three supported interface locales with flag assets and i18n name keys.
 */
test('Test that GLOBAL_LANGUAGE_SELECTOR_LOCALES maps en-US de and fr', () => {
  expect(GLOBAL_LANGUAGE_SELECTOR_LOCALES).toHaveLength(3)
  expect(GLOBAL_LANGUAGE_SELECTOR_LOCALES.map((row) => row.code).sort()).toEqual([
    'de',
    'en-US',
    'fr'
  ])
})
