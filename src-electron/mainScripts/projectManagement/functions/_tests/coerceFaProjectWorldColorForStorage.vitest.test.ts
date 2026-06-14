import { expect, test } from 'vitest'

import { FA_PROJECT_WORLD_DEFAULT_COLOR } from '../faProjectDbSchemaDdl'
import { coerceFaProjectWorldColorForStorage } from '../coerceFaProjectWorldColorForStorage'

/**
 * coerceFaProjectWorldColorForStorage
 * Blank input falls back to the schema default color.
 */
test('Test that coerceFaProjectWorldColorForStorage uses default for blank input', () => {
  expect(coerceFaProjectWorldColorForStorage(undefined, FA_PROJECT_WORLD_DEFAULT_COLOR)).toBe(
    FA_PROJECT_WORLD_DEFAULT_COLOR
  )
  expect(coerceFaProjectWorldColorForStorage('   ', FA_PROJECT_WORLD_DEFAULT_COLOR)).toBe(
    FA_PROJECT_WORLD_DEFAULT_COLOR
  )
})

/**
 * coerceFaProjectWorldColorForStorage
 * Valid hex strings normalize to uppercase #RRGGBB.
 */
test('Test that coerceFaProjectWorldColorForStorage normalizes valid hex colors', () => {
  expect(coerceFaProjectWorldColorForStorage('#aabbcc', FA_PROJECT_WORLD_DEFAULT_COLOR)).toBe(
    '#AABBCC'
  )
})

/**
 * coerceFaProjectWorldColorForStorage
 * Invalid free-form strings coerce to the default without throwing.
 */
test('Test that coerceFaProjectWorldColorForStorage coerces invalid strings to default', () => {
  expect(coerceFaProjectWorldColorForStorage('red', FA_PROJECT_WORLD_DEFAULT_COLOR)).toBe(
    FA_PROJECT_WORLD_DEFAULT_COLOR
  )
})
