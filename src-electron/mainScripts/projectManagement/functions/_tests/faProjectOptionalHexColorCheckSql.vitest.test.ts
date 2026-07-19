import { expect, test } from 'vitest'

import { buildFaProjectOptionalHexColorCheckSql } from '../faProjectOptionalHexColorCheckSql'

/**
 * buildFaProjectOptionalHexColorCheckSql
 * Worlds-style CHECK rejects NULL, allows empty or hex.
 */
test('Test that buildFaProjectOptionalHexColorCheckSql without null allows empty or hex', () => {
  expect(buildFaProjectOptionalHexColorCheckSql('color', false)).toBe(
    "(color = '' OR (length(color) = 7 AND substr(color, 1, 1) = '#'))"
  )
})

/**
 * buildFaProjectOptionalHexColorCheckSql
 * Document-style CHECK allows NULL, empty, or hex.
 */
test('Test that buildFaProjectOptionalHexColorCheckSql with null allows null empty or hex', () => {
  expect(buildFaProjectOptionalHexColorCheckSql('document_text_color', true)).toBe(
    "(document_text_color IS NULL OR document_text_color = '' OR " +
      "(length(document_text_color) = 7 AND substr(document_text_color, 1, 1) = '#'))"
  )
})
