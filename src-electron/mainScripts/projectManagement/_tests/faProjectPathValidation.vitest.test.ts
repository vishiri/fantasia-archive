import path from 'node:path'

import { expect, test } from 'vitest'

import {
  ensureFaProjectExtension,
  faDisplayNameFallbackFromProjectPath,
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

test('pathLooksLikeFaProjectFile accepts drive-letter paths with forward slashes on any host', () => {
  expect(pathLooksLikeFaProjectFile('D:/x/y.faproject')).toBe(true)
})

test('ensureFaProjectExtension appends extension when missing', () => {
  expect(ensureFaProjectExtension('D:\\a\\proj')).toBe('D:\\a\\proj.faproject')
})

test('ensureFaProjectExtension preserves existing extension', () => {
  expect(ensureFaProjectExtension('D:\\a\\proj.faproject')).toBe('D:\\a\\proj.faproject')
})

test('faDisplayNameFallbackFromProjectPath uses basename stem', () => {
  expect(faDisplayNameFallbackFromProjectPath('D:\\w\\My Book.faproject')).toBe('My Book')
})

test('faDisplayNameFallbackFromProjectPath keeps basename when extension suffix mismatches', () => {
  expect(faDisplayNameFallbackFromProjectPath('D:\\only\\Backup')).toBe('Backup')
})

test('faDisplayNameFallbackFromProjectPath falls back to Project when stem empty', () => {
  expect(faDisplayNameFallbackFromProjectPath('D:\\w\\.faproject')).toBe('Project')
})

test('faDisplayNameFallbackFromProjectPath falls back to Project when stem is only dots', () => {
  expect(faDisplayNameFallbackFromProjectPath('D:\\w\\..faproject')).toBe('Project')
})
