import path from 'node:path'

import { expect, test } from 'vitest'

import {
  ensureFaProjectExtension,
  pathLooksLikeFaProjectFile
} from '../faProjectPathValidation'

test('pathLooksLikeFaProjectFile rejects empty and non-absolute paths', () => {
  expect(pathLooksLikeFaProjectFile('')).toBe(false)
  expect(pathLooksLikeFaProjectFile('relative\\a.faproject')).toBe(false)
})

test('pathLooksLikeFaProjectFile accepts absolute faproject paths', () => {
  expect(pathLooksLikeFaProjectFile('D:\\x\\y.faproject')).toBe(true)
  expect(pathLooksLikeFaProjectFile(`D:${path.sep}x${path.sep}y.FAPROJECT`)).toBe(true)
})

test('pathLooksLikeFaProjectFile normalizes forward slashes before checking absolute', () => {
  const posixStyle = 'D:/x/y.faproject'
  if (path.isAbsolute(posixStyle)) {
    expect(pathLooksLikeFaProjectFile(posixStyle)).toBe(true)
  }
})

test('ensureFaProjectExtension appends extension when missing', () => {
  expect(ensureFaProjectExtension('D:\\a\\proj')).toBe('D:\\a\\proj.faproject')
})

test('ensureFaProjectExtension preserves existing extension', () => {
  expect(ensureFaProjectExtension('D:\\a\\proj.faproject')).toBe('D:\\a\\proj.faproject')
})
