import { expect, test } from 'vitest'

import { parseFaProjectOpenInput } from '../faProjectOpenInputSchema'

test('Test that parse accepts empty object', () => {
  expect(parseFaProjectOpenInput({})).toEqual({})
})

test('Test that parse accepts optional filePath', () => {
  expect(parseFaProjectOpenInput({ filePath: 'D:\\x.faproject' })).toEqual({
    filePath: 'D:\\x.faproject'
  })
})

test('Test that parse throws TypeError for non-plain objects', () => {
  expect(() => parseFaProjectOpenInput(null)).toThrow(TypeError)
  expect(() => parseFaProjectOpenInput([])).toThrow(TypeError)
})

test('Test that parse rejects strict object violations', () => {
  expect(() => parseFaProjectOpenInput({ extra: 1 })).toThrow(/Unrecognized key/u)
  expect(() => parseFaProjectOpenInput({ filePath: '' })).toThrow()
})
