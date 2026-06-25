import { expect, test } from 'vitest'

import type { I_extraEnvVariablesAPI } from 'app/types/I_faElectronRendererBridgeAPIs'

import { readAppControlMenusTestingTypeFromCachedSnapshot } from '../appControlMenusTestingType'

/**
 * readAppControlMenusTestingTypeFromCachedSnapshot
 * Missing snapshot yields an empty testing type string.
 */
test('Test that readAppControlMenusTestingTypeFromCachedSnapshot returns empty string without snapshot', () => {
  expect(readAppControlMenusTestingTypeFromCachedSnapshot(null)).toBe('')
  expect(readAppControlMenusTestingTypeFromCachedSnapshot(undefined)).toBe('')
})

/**
 * readAppControlMenusTestingTypeFromCachedSnapshot
 * Explicit false TEST_ENV is preserved for embed wiring.
 */
test('Test that readAppControlMenusTestingTypeFromCachedSnapshot preserves false TEST_ENV', () => {
  expect(readAppControlMenusTestingTypeFromCachedSnapshot({
    TEST_ENV: false
  } as I_extraEnvVariablesAPI)).toBe(false)
})

/**
 * readAppControlMenusTestingTypeFromCachedSnapshot
 * String TEST_ENV passes through; undefined becomes empty string.
 */
test('Test that readAppControlMenusTestingTypeFromCachedSnapshot maps string TEST_ENV values', () => {
  expect(readAppControlMenusTestingTypeFromCachedSnapshot({
    TEST_ENV: 'components'
  } as I_extraEnvVariablesAPI)).toBe('components')
  expect(readAppControlMenusTestingTypeFromCachedSnapshot({} as I_extraEnvVariablesAPI)).toBe('')
})
