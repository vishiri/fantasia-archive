import { expect, test } from 'vitest'

import { FA_PROJECT_WORLD_DEFAULT_COLOR } from '../faProjectDbSchemaDdl'
import { coerceFaProjectWorldColorForStorage } from '../coerceFaProjectWorldColorForStorage'

/**
 * coerceFaProjectWorldColorForStorage
 * Blank input stays empty so Project Settings can clear optional world color.
 */
test('Test that coerceFaProjectWorldColorForStorage keeps blank input empty', () => {
  expect(coerceFaProjectWorldColorForStorage(undefined, FA_PROJECT_WORLD_DEFAULT_COLOR)).toBe('')
  expect(coerceFaProjectWorldColorForStorage('   ', FA_PROJECT_WORLD_DEFAULT_COLOR)).toBe('')
  expect(coerceFaProjectWorldColorForStorage('', FA_PROJECT_WORLD_DEFAULT_COLOR)).toBe('')
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
