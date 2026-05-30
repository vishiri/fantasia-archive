import { expect, test } from 'vitest'

import {
  resolveErrorNotFoundCardDetails,
  resolveErrorNotFoundReturnButtonMarginClass,
  resolveErrorNotFoundShowResumeCurrentProject
} from '../errorNotFoundPresentation'

/**
 * resolveErrorNotFoundShowResumeCurrentProject
 * Requires active session path text.
 */
test('Test that resolveErrorNotFoundShowResumeCurrentProject needs a trimmed path', () => {
  expect(resolveErrorNotFoundShowResumeCurrentProject(true, '  ')).toBe(false)
  expect(resolveErrorNotFoundShowResumeCurrentProject(true, 'C:\\a.faproject')).toBe(true)
})

/**
 * resolveErrorNotFoundReturnButtonMarginClass
 * Tighter margin when resume button is visible.
 */
test('Test that resolveErrorNotFoundReturnButtonMarginClass switches margin class', () => {
  expect(resolveErrorNotFoundReturnButtonMarginClass(true)).toBe('q-mt-lg')
  expect(resolveErrorNotFoundReturnButtonMarginClass(false)).toBe('q-mt-xl')
})

/**
 * resolveErrorNotFoundCardDetails
 * Joins subtitle keys with a newline.
 */
test('Test that resolveErrorNotFoundCardDetails joins subtitle lines', () => {
  const details = resolveErrorNotFoundCardDetails((key) => key)

  expect(details).toContain('errorNotFound.subTitleFirst')
  expect(details).toContain('errorNotFound.subTitleSecond')
})
