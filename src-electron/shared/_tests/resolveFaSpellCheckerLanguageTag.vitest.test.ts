import { expect, test } from 'vitest'

import { resolveFaSpellCheckerLanguageTag } from '../resolveFaSpellCheckerLanguageTag'

/**
 * resolveFaSpellCheckerLanguageTag
 * Empty available list yields null (caller skips setSpellCheckerLanguages).
 */
test('Test that resolveFaSpellCheckerLanguageTag returns null when available is empty', () => {
  expect(resolveFaSpellCheckerLanguageTag('en-US', [])).toBeNull()
})

/**
 * resolveFaSpellCheckerLanguageTag
 * en-US prefers en-US when present.
 */
test('Test that resolveFaSpellCheckerLanguageTag picks en-US for en-US code when listed', () => {
  expect(
    resolveFaSpellCheckerLanguageTag('en-US', ['de', 'en-US', 'fr'])
  ).toBe('en-US')
})

/**
 * resolveFaSpellCheckerLanguageTag
 * en-US falls back to en-GB when en-US missing.
 */
test('Test that resolveFaSpellCheckerLanguageTag falls back from en-US to en-GB', () => {
  expect(
    resolveFaSpellCheckerLanguageTag('en-US', ['fr', 'en-GB'])
  ).toBe('en-GB')
})

/**
 * resolveFaSpellCheckerLanguageTag
 * en-US falls back to bare en when only en exists.
 */
test('Test that resolveFaSpellCheckerLanguageTag falls back from en-US to en', () => {
  expect(
    resolveFaSpellCheckerLanguageTag('en-US', ['de', 'en'])
  ).toBe('en')
})

/**
 * resolveFaSpellCheckerLanguageTag
 * Matching is case-insensitive but returns the canonical tag from available.
 */
test('Test that resolveFaSpellCheckerLanguageTag preserves casing from available', () => {
  expect(
    resolveFaSpellCheckerLanguageTag('fr', ['FR', 'de'])
  ).toBe('FR')
})

/**
 * resolveFaSpellCheckerLanguageTag
 * fr prefers fr before fr-FR.
 */
test('Test that resolveFaSpellCheckerLanguageTag prefers fr over fr-FR when both exist', () => {
  expect(
    resolveFaSpellCheckerLanguageTag('fr', ['fr-FR', 'fr'])
  ).toBe('fr')
})

/**
 * resolveFaSpellCheckerLanguageTag
 * de prefers de before de-DE.
 */
test('Test that resolveFaSpellCheckerLanguageTag prefers de over de-DE when both exist', () => {
  expect(
    resolveFaSpellCheckerLanguageTag('de', ['de-DE', 'de'])
  ).toBe('de')
})

/**
 * resolveFaSpellCheckerLanguageTag
 * fr UI never falls back to English when only English is listed with other non-fr tags.
 */
test('Test that resolveFaSpellCheckerLanguageTag does not map fr UI to en-US when fr packs are absent', () => {
  expect(
    resolveFaSpellCheckerLanguageTag('fr', ['en-US', 'pl'])
  ).toBeNull()
})

/**
 * resolveFaSpellCheckerLanguageTag
 * de UI never falls back to English when only English is listed with other non-de tags.
 */
test('Test that resolveFaSpellCheckerLanguageTag does not map de UI to en-US when de packs are absent', () => {
  expect(
    resolveFaSpellCheckerLanguageTag('de', ['en-US', 'pl'])
  ).toBeNull()
})

/**
 * resolveFaSpellCheckerLanguageTag
 * de UI with no de tags returns null instead of first unrelated language.
 */
test('Test that resolveFaSpellCheckerLanguageTag returns null for de when list has no de family', () => {
  expect(
    resolveFaSpellCheckerLanguageTag('de', ['pl', 'sv'])
  ).toBeNull()
})

/**
 * resolveFaSpellCheckerLanguageTag
 * fr UI picks first fr-* variant in list order when exact keys are missing.
 */
test('Test that resolveFaSpellCheckerLanguageTag matches fr family prefix when fr-FR is absent', () => {
  expect(
    resolveFaSpellCheckerLanguageTag('fr', ['en-US', 'fr-CA', 'de'])
  ).toBe('fr-CA')
})

/**
 * resolveFaSpellCheckerLanguageTag
 * Sparse array with no de family yields null for de UI.
 */
test('Test that resolveFaSpellCheckerLanguageTag returns null for de when only unrelated tags after a hole', () => {
  const holey: string[] = []
  holey[1] = 'pl'
  expect(resolveFaSpellCheckerLanguageTag('de', holey)).toBeNull()
})

/**
 * resolveFaSpellCheckerLanguageTag
 * Array length with no string entries yields null for de.
 */
test('Test that resolveFaSpellCheckerLanguageTag returns null when no string tags exist', () => {
  expect(resolveFaSpellCheckerLanguageTag('de', new Array(2))).toBeNull()
})

/**
 * resolveFaSpellCheckerLanguageTag
 * en-US uses first string entry when no English variant is listed.
 */
test('Test that resolveFaSpellCheckerLanguageTag falls back to first string for en-US without English packs', () => {
  expect(
    resolveFaSpellCheckerLanguageTag('en-US', ['pl', 'sv'])
  ).toBe('pl')
})

/**
 * resolveFaSpellCheckerLanguageTag
 * fr family match skips non-string slots before fr-* tags.
 */
test('Test that resolveFaSpellCheckerLanguageTag family match skips holes before fr variant', () => {
  const holey: string[] = []
  holey[1] = 'fr-BE'
  expect(resolveFaSpellCheckerLanguageTag('fr', holey)).toBe('fr-BE')
})

/**
 * resolveFaSpellCheckerLanguageTag
 * de family matches de-* tags beyond de-DE.
 */
test('Test that resolveFaSpellCheckerLanguageTag matches de-AT for de UI', () => {
  expect(
    resolveFaSpellCheckerLanguageTag('de', ['fr', 'de-AT'])
  ).toBe('de-AT')
})
