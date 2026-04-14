import { expect, test } from 'vitest'
import { ZodError } from 'zod'

import { parseFaKeybindsPatch } from '../faKeybindsPatchSchema'

/**
 * parseFaKeybindsPatch
 * Accepts an empty plain object.
 */
test('parseFaKeybindsPatch accepts empty object', () => {
  expect(parseFaKeybindsPatch({})).toEqual({})
})

/**
 * parseFaKeybindsPatch
 * Accepts merge-style overrides with a valid chord.
 */
test('parseFaKeybindsPatch accepts partial overrides', () => {
  const parsed = parseFaKeybindsPatch({
    overrides: {
      openProgramSettings: {
        code: 'KeyA',
        mods: ['ctrl']
      }
    }
  })
  expect(parsed.overrides?.openProgramSettings).toEqual({
    code: 'KeyA',
    mods: ['ctrl']
  })
})

/**
 * parseFaKeybindsPatch
 * Accepts explicit null override entries.
 */
test('parseFaKeybindsPatch accepts null override entries', () => {
  const parsed = parseFaKeybindsPatch({
    overrides: {
      openProgramSettings: null
    }
  })
  expect(parsed.overrides?.openProgramSettings).toBeNull()
})

/**
 * parseFaKeybindsPatch
 * Rejects replaceAllOverrides without overrides via superRefine.
 */
test('parseFaKeybindsPatch rejects replaceAllOverrides without overrides', () => {
  expect(() => {
    parseFaKeybindsPatch({ replaceAllOverrides: true })
  }).toThrow(ZodError)
})

/**
 * parseFaKeybindsPatch
 * Rejects non-plain objects at the top level.
 */
test('parseFaKeybindsPatch rejects non-plain patch root', () => {
  expect(() => {
    parseFaKeybindsPatch(null)
  }).toThrow(TypeError)
})

/**
 * parseFaKeybindsPatch
 * Rejects unknown override keys (strict object).
 */
test('parseFaKeybindsPatch rejects unknown override keys', () => {
  expect(() => {
    parseFaKeybindsPatch({
      overrides: {
        unknownCommand: null
      }
    })
  }).toThrow(ZodError)
})
