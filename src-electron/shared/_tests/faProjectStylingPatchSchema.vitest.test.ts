import { expect, test } from 'vitest'

import { FA_APP_STYLING_MAX_CSS_LENGTH } from 'app/src-electron/shared/faAppStylingPatchSchema'

import { parseFaProjectStylingPatch } from '../faProjectStylingPatchSchema'

/**
 * parseFaProjectStylingPatch
 * Plain empty object parses to an empty patch.
 */
test('Test that parseFaProjectStylingPatch accepts an empty object', () => {
  expect(parseFaProjectStylingPatch({})).toEqual({})
})

/**
 * parseFaProjectStylingPatch
 * Rejects primitives and arrays at the IPC boundary shape.
 */
test('Test that parseFaProjectStylingPatch throws TypeError for non-object payloads', () => {
  expect(() => parseFaProjectStylingPatch(null)).toThrow(TypeError)
  expect(() => parseFaProjectStylingPatch([])).toThrow(TypeError)
})

/**
 * parseFaProjectStylingPatch
 * Rejects oversized css strings using the shared app styling cap.
 */
test('Test that parseFaProjectStylingPatch rejects css above the max length', () => {
  const oversized = 'a'.repeat(FA_APP_STYLING_MAX_CSS_LENGTH + 1)
  expect(() => parseFaProjectStylingPatch({ css: oversized })).toThrow()
})

/**
 * parseFaProjectStylingPatch
 * Accepts rectangular frame payloads and nullable frame sentinel.
 */
test('Test that parseFaProjectStylingPatch accepts frame and null frame', () => {
  expect(
    parseFaProjectStylingPatch({
      css: '',
      frame: {
        height: 100,
        width: 200,
        x: 0,
        y: -1
      }
    })
  ).toEqual({
    css: '',
    frame: {
      height: 100,
      width: 200,
      x: 0,
      y: -1
    }
  })
  expect(parseFaProjectStylingPatch({ frame: null })).toEqual({
    frame: null
  })
})

/**
 * parseFaProjectStylingPatch
 * Strict schema forbids stray keys beyond css and frame.
 */
test('Test that parseFaProjectStylingPatch rejects unknown keys', () => {
  expect(() =>
    parseFaProjectStylingPatch({
      extra: true
    })).toThrow()
})
