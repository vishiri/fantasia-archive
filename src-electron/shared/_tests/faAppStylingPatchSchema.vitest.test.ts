import { expect, test } from 'vitest'
import { ZodError } from 'zod'

import {
  FA_APP_STYLING_MAX_CSS_LENGTH,
  parseFaAppStylingPatch
} from '../faAppStylingPatchSchema'

/**
 * parseFaAppStylingPatch
 * Accepts a valid patch with only css.
 */
test('parseFaAppStylingPatch accepts a string css patch', () => {
  expect(parseFaAppStylingPatch({ css: 'body { color: red; }' })).toEqual({
    css: 'body { color: red; }'
  })
})

/**
 * parseFaAppStylingPatch
 * Accepts a frame-only patch.
 */
test('parseFaAppStylingPatch accepts a frame-only patch', () => {
  expect(parseFaAppStylingPatch({
    frame: {
      height: 400,
      width: 400,
      x: 0,
      y: 0
    }
  })).toEqual({
    frame: {
      height: 400,
      width: 400,
      x: 0,
      y: 0
    }
  })
})

/**
 * parseFaAppStylingPatch
 * Accepts an empty css string.
 */
test('parseFaAppStylingPatch accepts empty css', () => {
  expect(parseFaAppStylingPatch({ css: '' })).toEqual({ css: '' })
})

/**
 * parseFaAppStylingPatch
 * Accepts null frame.
 */
test('parseFaAppStylingPatch accepts null frame with css', () => {
  expect(parseFaAppStylingPatch({
    css: 'a',
    frame: null
  })).toEqual({
    css: 'a',
    frame: null
  })
})

/**
 * parseFaAppStylingPatch
 * Rejects non-plain object roots.
 */
test('parseFaAppStylingPatch rejects non-plain patch root', () => {
  expect(() => parseFaAppStylingPatch(null)).toThrow(TypeError)
  expect(() => parseFaAppStylingPatch('css')).toThrow(TypeError)
  expect(() => parseFaAppStylingPatch([])).toThrow(TypeError)
})

/**
 * parseFaAppStylingPatch
 * Rejects empty object (must include css and/or frame).
 */
test('parseFaAppStylingPatch rejects empty object', () => {
  expect(() => parseFaAppStylingPatch({})).toThrow(ZodError)
})

/**
 * parseFaAppStylingPatch
 * Rejects non-string css when css is present.
 */
test('parseFaAppStylingPatch rejects non-string css', () => {
  expect(() => parseFaAppStylingPatch({ css: 123 })).toThrow(ZodError)
  expect(() => parseFaAppStylingPatch({ css: null })).toThrow(ZodError)
})

/**
 * parseFaAppStylingPatch
 * Rejects unknown sibling keys.
 */
test('parseFaAppStylingPatch rejects unknown sibling keys', () => {
  expect(() => parseFaAppStylingPatch({
    css: '',
    extra: true
  })).toThrow(ZodError)
})

/**
 * parseFaAppStylingPatch
 * Rejects css strings exceeding the cap.
 */
test('parseFaAppStylingPatch rejects oversized css', () => {
  const oversized = 'a'.repeat(FA_APP_STYLING_MAX_CSS_LENGTH + 1)
  expect(() => parseFaAppStylingPatch({ css: oversized })).toThrow(ZodError)
})
