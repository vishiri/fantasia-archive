import { expect, test } from 'vitest'

import {
  globalLanguageSelectorShouldNotifyLanguageApplied,
  resolveGlobalLanguageSelectorAppliedPair
} from '../functions/globalLanguageSelectorLanguageCodeWatchGate'

test('Test resolvePair returns null for undefined transitions', () => {
  expect(resolveGlobalLanguageSelectorAppliedPair(undefined, 'en-US')).toBeNull()
})

test('Test resolvePair returns null when prior absent', () => {
  expect(resolveGlobalLanguageSelectorAppliedPair('en-US', undefined)).toBeNull()
})

test('Test resolvePair returns null on idempotent repeats', () => {
  expect(resolveGlobalLanguageSelectorAppliedPair('en-US', 'en-US')).toBeNull()
})

test('Test resolvePair returns ordered tuple when language truly changes', () => {
  expect(resolveGlobalLanguageSelectorAppliedPair('fr', 'en-US')).toEqual(['en-US', 'fr'])
})

test('Test notify matcher mirrors resolver nullability', () => {
  expect(globalLanguageSelectorShouldNotifyLanguageApplied('fr', 'en-US')).toBe(true)
  expect(globalLanguageSelectorShouldNotifyLanguageApplied('en-US', undefined)).toBe(false)
})
