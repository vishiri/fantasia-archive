import { expect, test } from 'vitest'

import { mapProjectOverviewTranslationStrings } from '../parseProjectOverviewTranslationsJson'
import { parseProjectOverviewTranslationsJson } from '../../scripts/applyProjectOverviewChartModelWiring'

/**
 * mapProjectOverviewTranslationStrings
 * Keeps string entries from valid objects and drops non-string values.
 */
test('Test that mapProjectOverviewTranslationStrings keeps string map entries', () => {
  expect(mapProjectOverviewTranslationStrings({
    'en-US': 'Heroes',
    fr: 'Heros',
    nb: 1
  })).toEqual({
    'en-US': 'Heroes',
    fr: 'Heros'
  })
})

/**
 * mapProjectOverviewTranslationStrings
 * Returns empty maps for null, arrays, and non-objects.
 */
test('Test that mapProjectOverviewTranslationStrings returns empty for non-objects', () => {
  expect(mapProjectOverviewTranslationStrings(null)).toEqual({})
  expect(mapProjectOverviewTranslationStrings([])).toEqual({})
  expect(mapProjectOverviewTranslationStrings('x')).toEqual({})
})

/**
 * parseProjectOverviewTranslationsJson
 * Invalid JSON becomes an empty map.
 */
test('Test that parseProjectOverviewTranslationsJson returns empty for invalid JSON', () => {
  expect(parseProjectOverviewTranslationsJson('{')).toEqual({})
  expect(parseProjectOverviewTranslationsJson('null')).toEqual({})
  expect(parseProjectOverviewTranslationsJson('[]')).toEqual({})
  expect(parseProjectOverviewTranslationsJson('"x"')).toEqual({})
})
