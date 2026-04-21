import { expect, test } from 'vitest'
import { ZodError } from 'zod'

import {
  FA_PROGRAM_STYLING_MAX_CSS_LENGTH,
  parseFaProgramStylingPatch
} from '../faProgramStylingPatchSchema'

/**
 * parseFaProgramStylingPatch
 * Accepts a valid patch with a string css value.
 */
test('parseFaProgramStylingPatch accepts a string css patch', () => {
  expect(parseFaProgramStylingPatch({ css: 'body { color: red; }' })).toEqual({
    css: 'body { color: red; }'
  })
})

/**
 * parseFaProgramStylingPatch
 * Accepts an empty css string (the user clearing their custom theme).
 */
test('parseFaProgramStylingPatch accepts empty css', () => {
  expect(parseFaProgramStylingPatch({ css: '' })).toEqual({ css: '' })
})

/**
 * parseFaProgramStylingPatch
 * Rejects non-plain object roots so adversarial bridge calls cannot bypass the strict shape.
 */
test('parseFaProgramStylingPatch rejects non-plain patch root', () => {
  expect(() => parseFaProgramStylingPatch(null)).toThrow(TypeError)
  expect(() => parseFaProgramStylingPatch('css')).toThrow(TypeError)
  expect(() => parseFaProgramStylingPatch([])).toThrow(TypeError)
})

/**
 * parseFaProgramStylingPatch
 * Rejects missing css (strict shape).
 */
test('parseFaProgramStylingPatch rejects missing css', () => {
  expect(() => parseFaProgramStylingPatch({})).toThrow(ZodError)
})

/**
 * parseFaProgramStylingPatch
 * Rejects non-string css values.
 */
test('parseFaProgramStylingPatch rejects non-string css', () => {
  expect(() => parseFaProgramStylingPatch({ css: 123 })).toThrow(ZodError)
  expect(() => parseFaProgramStylingPatch({ css: null })).toThrow(ZodError)
})

/**
 * parseFaProgramStylingPatch
 * Rejects unknown sibling keys (strict object).
 */
test('parseFaProgramStylingPatch rejects unknown sibling keys', () => {
  expect(() => parseFaProgramStylingPatch({
    css: '',
    extra: true
  })).toThrow(ZodError)
})

/**
 * parseFaProgramStylingPatch
 * Rejects css strings exceeding the FA_PROGRAM_STYLING_MAX_CSS_LENGTH cap so the JSON store stays bounded.
 */
test('parseFaProgramStylingPatch rejects oversized css', () => {
  const oversized = 'a'.repeat(FA_PROGRAM_STYLING_MAX_CSS_LENGTH + 1)
  expect(() => parseFaProgramStylingPatch({ css: oversized })).toThrow(ZodError)
})
