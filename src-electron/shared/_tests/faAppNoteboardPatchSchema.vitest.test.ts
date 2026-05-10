import { expect, test } from 'vitest'

import {
  FA_APP_NOTEBOARD_MAX_TEXT_LENGTH,
  parseFaAppNoteboardPatch
} from 'app/src-electron/shared/faAppNoteboardPatchSchema'

/**
 * parseFaAppNoteboardPatch
 * Accepts empty object and partial fields.
 */
test('Test that parseFaAppNoteboardPatch accepts an empty object', () => {
  expect(parseFaAppNoteboardPatch({})).toEqual({})
})

/**
 * parseFaAppNoteboardPatch
 * Rejects non-plain objects.
 */
test('Test that parseFaAppNoteboardPatch throws TypeError for non-object payloads', () => {
  expect(() => parseFaAppNoteboardPatch(null)).toThrow(TypeError)
  expect(() => parseFaAppNoteboardPatch([])).toThrow(TypeError)
})

/**
 * parseFaAppNoteboardPatch
 * Enforces text max length.
 */
test('Test that parseFaAppNoteboardPatch rejects text above the max length', () => {
  expect(() => parseFaAppNoteboardPatch({
    text: 'a'.repeat(FA_APP_NOTEBOARD_MAX_TEXT_LENGTH + 1)
  })).toThrow()
})

/**
 * parseFaAppNoteboardPatch
 * Accepts a valid frame and null frame.
 */
test('Test that parseFaAppNoteboardPatch accepts frame and null frame', () => {
  expect(parseFaAppNoteboardPatch({
    frame: {
      height: 200,
      width: 200,
      x: 0,
      y: 0
    }
  })).toEqual({
    frame: {
      height: 200,
      width: 200,
      x: 0,
      y: 0
    }
  })
  expect(parseFaAppNoteboardPatch({ frame: null })).toEqual({ frame: null })
})

/**
 * parseFaAppNoteboardPatch
 * Rejects extra keys under strict mode.
 */
test('Test that parseFaAppNoteboardPatch rejects unknown keys', () => {
  expect(() => parseFaAppNoteboardPatch({
    extra: true,
    text: 'a'
  })).toThrow()
})
