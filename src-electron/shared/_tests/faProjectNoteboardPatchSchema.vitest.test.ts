import { expect, test } from 'vitest'

import { FA_APP_NOTEBOARD_MAX_TEXT_LENGTH } from 'app/src-electron/shared/faAppNoteboardPatchSchema'
import { parseFaProjectNoteboardPatch } from 'app/src-electron/shared/faProjectNoteboardPatchSchema'

test('Test that parseFaProjectNoteboardPatch accepts an empty object', () => {
  expect(parseFaProjectNoteboardPatch({})).toEqual({})
})

test('Test that parseFaProjectNoteboardPatch throws TypeError for non-object payloads', () => {
  expect(() => parseFaProjectNoteboardPatch(null)).toThrow(TypeError)
  expect(() => parseFaProjectNoteboardPatch([])).toThrow(TypeError)
})

test('Test that parseFaProjectNoteboardPatch rejects text above the max length', () => {
  expect(() =>
    parseFaProjectNoteboardPatch({
      text: 'a'.repeat(FA_APP_NOTEBOARD_MAX_TEXT_LENGTH + 1)
    })).toThrow()
})

test('Test that parseFaProjectNoteboardPatch accepts frame and null frame', () => {
  expect(
    parseFaProjectNoteboardPatch({
      frame: {
        height: 200,
        width: 200,
        x: 0,
        y: 0
      }
    })
  ).toEqual({
    frame: {
      height: 200,
      width: 200,
      x: 0,
      y: 0
    }
  })
  expect(parseFaProjectNoteboardPatch({ frame: null })).toEqual({
    frame: null
  })
})

test('Test that parseFaProjectNoteboardPatch rejects unknown keys', () => {
  expect(() =>
    parseFaProjectNoteboardPatch({
      extra: true,
      text: 'a'
    })).toThrow()
})
