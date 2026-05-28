import { expect, test } from 'vitest'
import { ZodError } from 'zod'

import { FA_PROJECT_NAME_MAX_LEN } from 'app/src-electron/shared/faProjectConstants'

import { parseFaProjectSettingsPatch } from '../faProjectSettingsPatchSchema'

/**
 * parseFaProjectSettingsPatch
 * Accepts an empty object as a no-op patch.
 */
test('Test that parseFaProjectSettingsPatch accepts empty plain object', () => {
  expect(parseFaProjectSettingsPatch({})).toEqual({})
})

/**
 * parseFaProjectSettingsPatch
 * Trims projectName and accepts a valid display name.
 */
test('Test that parseFaProjectSettingsPatch trims projectName', () => {
  expect(parseFaProjectSettingsPatch({ projectName: '  Alpha  ' })).toEqual({
    projectName: 'Alpha'
  })
})

/**
 * parseFaProjectSettingsPatch
 * Rejects projectName longer than FA_PROJECT_NAME_MAX_LEN.
 */
test('Test that parseFaProjectSettingsPatch rejects projectName above max length', () => {
  expect(() => {
    parseFaProjectSettingsPatch({
      projectName: 'x'.repeat(FA_PROJECT_NAME_MAX_LEN + 1)
    })
  }).toThrow(ZodError)
})

/**
 * parseFaProjectSettingsPatch
 * Rejects whitespace-only projectName after trim.
 */
test('Test that parseFaProjectSettingsPatch rejects empty projectName after trim', () => {
  expect(() => {
    parseFaProjectSettingsPatch({ projectName: '   ' })
  }).toThrow(ZodError)
})

/**
 * parseFaProjectSettingsPatch
 * Rejects unknown keys under strict schema.
 */
test('Test that parseFaProjectSettingsPatch throws ZodError for unknown key', () => {
  expect(() => {
    parseFaProjectSettingsPatch({
      projectName: 'Ok',
      futureKey: true
    })
  }).toThrow(ZodError)
})

/**
 * parseFaProjectSettingsPatch
 * Rejects non-plain object root with TypeError.
 */
test('Test that parseFaProjectSettingsPatch throws TypeError for null root', () => {
  expect(() => {
    parseFaProjectSettingsPatch(null)
  }).toThrow(TypeError)
})

/**
 * parseFaProjectSettingsPatch
 * Rejects array root with TypeError.
 */
test('Test that parseFaProjectSettingsPatch throws TypeError for array root', () => {
  expect(() => {
    parseFaProjectSettingsPatch([])
  }).toThrow(TypeError)
})
