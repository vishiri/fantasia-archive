import { expect, test } from 'vitest'

import { i18n } from 'app/i18n/externalFileLoader'

import { applyFaI18nLocaleFromLanguageCode } from '../applyFaI18nLocaleFromLanguageCode'

/**
 * applyFaI18nLocaleFromLanguageCode
 * Updates the shared vue-i18n locale ref.
 */
test('Test that applyFaI18nLocaleFromLanguageCode sets i18n.global.locale', () => {
  applyFaI18nLocaleFromLanguageCode('de')
  expect(i18n.global.locale.value).toBe('de')
  applyFaI18nLocaleFromLanguageCode('en-US')
  expect(i18n.global.locale.value).toBe('en-US')
})
