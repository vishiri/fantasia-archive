import { expect, test } from 'vitest'

import { hasFaLocaleStringTranslationsAnyValue } from '../hasFaLocaleStringTranslationsAnyValue'

/**
 * hasFaLocaleStringTranslationsAnyValue
 * Returns true when any locale value is a non-empty trimmed string.
 */
test('Test that hasFaLocaleStringTranslationsAnyValue detects non-empty locale strings', () => {
  expect(hasFaLocaleStringTranslationsAnyValue({})).toBe(false)
  expect(hasFaLocaleStringTranslationsAnyValue({ 'en-US': '   ' })).toBe(false)
  expect(hasFaLocaleStringTranslationsAnyValue({ 'en-US': 'World' })).toBe(true)
  expect(hasFaLocaleStringTranslationsAnyValue({ de: 'Welt' })).toBe(true)
  expect(hasFaLocaleStringTranslationsAnyValue({
    'en-US': undefined as unknown as string
  })).toBe(false)
})
