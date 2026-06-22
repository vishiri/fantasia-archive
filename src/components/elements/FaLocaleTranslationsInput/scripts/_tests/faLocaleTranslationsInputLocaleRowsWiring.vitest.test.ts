import { expect, test } from 'vitest'

import { buildFaLocaleTranslationsInputLocaleRows } from '../faLocaleTranslationsInputLocaleRowsWiring'

test('Test that buildFaLocaleTranslationsInputLocaleRows moves preferred language to the front', () => {
  const rows = buildFaLocaleTranslationsInputLocaleRows('de')
  expect(rows[0]?.code).toBe('de')
  expect(rows.some((row) => row.code === 'en-US')).toBe(true)
})

test('Test that buildFaLocaleTranslationsInputLocaleRows keeps order when preferred language is first', () => {
  const rows = buildFaLocaleTranslationsInputLocaleRows('en-US')
  expect(rows[0]?.code).toBe('en-US')
})
