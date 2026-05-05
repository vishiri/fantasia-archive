import { expect, test } from 'vitest'
import { ZodError } from 'zod'

import { parseFaProjectCreateInput } from '../faProjectCreateInputSchema'

test('parseFaProjectCreateInput accepts a trimmed project name', () => {
  const r = parseFaProjectCreateInput({ projectName: '  Ship  ' })
  expect(r.projectName).toBe('Ship')
})

test('parseFaProjectCreateInput throws TypeError for non-plain objects', () => {
  expect(() => parseFaProjectCreateInput(null)).toThrowError(TypeError)
  expect(() => parseFaProjectCreateInput([])).toThrowError(TypeError)
})

test('parseFaProjectCreateInput throws ZodError for invalid name', () => {
  expect(() => parseFaProjectCreateInput({ projectName: '' })).toThrowError(ZodError)
})
