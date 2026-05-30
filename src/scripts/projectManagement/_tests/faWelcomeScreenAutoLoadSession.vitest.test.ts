import { beforeEach, expect, test } from 'vitest'

import {
  awaitWelcomeScreenAutoLoadBootCompletion,
  hasWelcomeScreenAutoLoadBootBeenAttempted,
  hasWelcomeScreenAutoLoadMruHeadFailed,
  markWelcomeScreenAutoLoadBootAttempted,
  markWelcomeScreenAutoLoadBootCompletion,
  markWelcomeScreenAutoLoadMruHeadFailed,
  resetWelcomeScreenAutoLoadBootAttemptedForTests
} from '../functions/faWelcomeScreenAutoLoadSession'

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

/**
 * awaitWelcomeScreenAutoLoadBootCompletion
 * Resolves immediately when boot skip was never started.
 */
test('Test that awaitWelcomeScreenAutoLoadBootCompletion resolves when boot skip was not started', async () => {
  await expect(awaitWelcomeScreenAutoLoadBootCompletion()).resolves.toBeUndefined()
})

/**
 * awaitWelcomeScreenAutoLoadBootCompletion
 * Waits until markWelcomeScreenAutoLoadBootCompletion runs after boot skip.
 */
test('Test that awaitWelcomeScreenAutoLoadBootCompletion waits for boot completion', async () => {
  markWelcomeScreenAutoLoadBootAttempted()
  const pending = awaitWelcomeScreenAutoLoadBootCompletion()
  markWelcomeScreenAutoLoadBootCompletion()
  await expect(pending).resolves.toBeUndefined()
})
