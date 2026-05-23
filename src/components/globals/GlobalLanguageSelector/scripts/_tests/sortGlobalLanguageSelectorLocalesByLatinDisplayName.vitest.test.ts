import { expect, test } from 'vitest'

import { buildFaUserSettingsLanguageSelectorLocales } from 'app/types/faUserSettingsLanguageRegistry'

import { sortGlobalLanguageSelectorLocalesByLatinDisplayName } from '../sortGlobalLanguageSelectorLocalesByLatinDisplayName'

/**
 * sortGlobalLanguageSelectorLocalesByLatinDisplayName
 * Deutsch should appear before English, US in Latin sort order.
 */
test('Test that sortGlobalLanguageSelectorLocalesByLatinDisplayName orders known endonyms', () => {
  const rows = sortGlobalLanguageSelectorLocalesByLatinDisplayName(
    buildFaUserSettingsLanguageSelectorLocales()
  )
  const codes = rows.map((row) => row.code)
  const deIndex = codes.indexOf('de')
  const enUsIndex = codes.indexOf('en-US')

  expect(deIndex).toBeGreaterThan(-1)
  expect(enUsIndex).toBeGreaterThan(-1)
  expect(deIndex).toBeLessThan(enUsIndex)
})
