import { expect, test } from 'vitest'

import { FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES } from 'app/i18n/faUserSettingsLanguageDisplayNames'
import { buildFaUserSettingsLanguageSelectorLocales } from 'app/types/faUserSettingsLanguageRegistry'

import { sortGlobalLanguageSelectorLocalesByLatinDisplayName } from '../functions/sortGlobalLanguageSelectorLocalesByLatinDisplayName'

/**
 * sortGlobalLanguageSelectorLocalesByLatinDisplayName
 * Deutsch should appear before English, US in Latin sort order.
 */
test('Test that sortGlobalLanguageSelectorLocalesByLatinDisplayName orders known endonyms', () => {
  const rows = sortGlobalLanguageSelectorLocalesByLatinDisplayName(
    buildFaUserSettingsLanguageSelectorLocales(),
    FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES
  )
  const codes = rows.map((row) => row.code)
  const deIndex = codes.indexOf('de')
  const enUsIndex = codes.indexOf('en-US')

  expect(deIndex).toBeGreaterThan(-1)
  expect(enUsIndex).toBeGreaterThan(-1)
  expect(deIndex).toBeLessThan(enUsIndex)
})
