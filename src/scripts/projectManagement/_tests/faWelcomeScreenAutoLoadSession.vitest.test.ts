import { beforeEach, expect, test } from 'vitest'

import {
  hasWelcomeScreenAutoLoadBootBeenAttempted,
  hasWelcomeScreenAutoLoadMruHeadFailed,
  markWelcomeScreenAutoLoadBootAttempted,
  markWelcomeScreenAutoLoadMruHeadFailed,
  resetWelcomeScreenAutoLoadBootAttemptedForTests
} from '../faWelcomeScreenAutoLoadSession'

beforeEach(() => {
  resetWelcomeScreenAutoLoadBootAttemptedForTests()
})

/**
 * markWelcomeScreenAutoLoadBootAttempted
 * Records that boot routing already ran welcome auto-load so SplashPage mount does not retry.
 */
test('Test that markWelcomeScreenAutoLoadBootAttempted prevents duplicate splash mount auto-load', () => {
  expect(hasWelcomeScreenAutoLoadBootBeenAttempted()).toBe(false)
  markWelcomeScreenAutoLoadBootAttempted()
  expect(hasWelcomeScreenAutoLoadBootBeenAttempted()).toBe(true)
})

/**
 * markWelcomeScreenAutoLoadMruHeadFailed
 * Blocks further automatic welcome auto-load for the session.
 */
test('Test that markWelcomeScreenAutoLoadMruHeadFailed records MRU head failure', () => {
  expect(hasWelcomeScreenAutoLoadMruHeadFailed()).toBe(false)
  markWelcomeScreenAutoLoadMruHeadFailed()
  expect(hasWelcomeScreenAutoLoadMruHeadFailed()).toBe(true)
})
