/** @vitest-environment jsdom */

import { expect, test } from 'vitest'

import { resolveFaLocaleTranslationsSummaryButtonElement } from '../resolveFaLocaleTranslationsSummaryButtonElement'

/**
 * resolveFaLocaleTranslationsSummaryButtonElement
 * Returns null when the button component ref is unset.
 */
test('Test that resolveFaLocaleTranslationsSummaryButtonElement returns null for null ref', () => {
  expect(resolveFaLocaleTranslationsSummaryButtonElement(null)).toBeNull()
})

/**
 * resolveFaLocaleTranslationsSummaryButtonElement
 * Returns the root element when it is an HTMLElement.
 */
test('Test that resolveFaLocaleTranslationsSummaryButtonElement returns HTMLElement $el', () => {
  const element = document.createElement('button')
  const buttonComponent = { $el: element }
  expect(resolveFaLocaleTranslationsSummaryButtonElement(buttonComponent as never)).toBe(element)
})

/**
 * resolveFaLocaleTranslationsSummaryButtonElement
 * Returns null when the component root is not an HTMLElement.
 */
test('Test that resolveFaLocaleTranslationsSummaryButtonElement returns null for non-HTMLElement $el', () => {
  const buttonComponent = { $el: 'not-an-element' }
  expect(resolveFaLocaleTranslationsSummaryButtonElement(buttonComponent as never)).toBeNull()
})
