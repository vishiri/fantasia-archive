import { expect, test } from 'vitest'

import {
  determineAppName,
  isPlaywrightTestEnv,
  resolveUserDataRootFolderName
} from '../appIdentityPaths'

/**
 * determineAppName
 * Adds -dev suffix when DEBUGGING is set.
 */
test('determineAppName returns package name in production mode', () => {
  expect(determineAppName(undefined, 'fantasia-archive')).toBe('fantasia-archive')
})

test('determineAppName returns dev suffix when debugging', () => {
  expect(determineAppName('1', 'fantasia-archive')).toBe('fantasia-archive-dev')
})

/**
 * isPlaywrightTestEnv
 * True for components and e2e TEST_ENV values.
 */
test('isPlaywrightTestEnv recognizes playwright harness env values', () => {
  expect(isPlaywrightTestEnv('e2e')).toBe(true)
  expect(isPlaywrightTestEnv('components')).toBe(true)
  expect(isPlaywrightTestEnv(undefined)).toBe(false)
})

/**
 * resolveUserDataRootFolderName
 * Uses package name under playwright isolation.
 */
test('resolveUserDataRootFolderName uses package name for playwright', () => {
  expect(resolveUserDataRootFolderName('e2e', 'fantasia-archive', 'fantasia-archive-dev')).toBe('fantasia-archive')
})
