import path from 'node:path'

import { expect, test } from 'vitest'

import {
  ensureFaProjectExtension,
  faDisplayNameFallbackFromProjectPath,
  pathLooksLikeFaProjectFile
} from '../faProjectPathValidation'

const pathApi = {
  basename: path.basename.bind(path),
  isAbsolute: path.isAbsolute.bind(path),
  sep: path.sep,
  win32: path.win32
}

const projectFileExtension = 'faproject'

/**
 * pathLooksLikeFaProjectFile
 * Rejects empty and non-absolute paths; accepts absolute .faproject paths.
 */
test('pathLooksLikeFaProjectFile rejects empty and non-absolute paths', () => {
  expect(pathLooksLikeFaProjectFile('', pathApi, projectFileExtension)).toBe(false)
  expect(pathLooksLikeFaProjectFile('relative\\a.faproject', pathApi, projectFileExtension)).toBe(false)
})

test('pathLooksLikeFaProjectFile accepts absolute faproject paths', () => {
  expect(pathLooksLikeFaProjectFile('D:\\x\\y.faproject', pathApi, projectFileExtension)).toBe(true)
  expect(pathLooksLikeFaProjectFile(`D:${path.sep}x${path.sep}y.FAPROJECT`, pathApi, projectFileExtension)).toBe(true)
})

test('pathLooksLikeFaProjectFile accepts drive-letter paths with forward slashes on any host', () => {
  expect(pathLooksLikeFaProjectFile('D:/x/y.faproject', pathApi, projectFileExtension)).toBe(true)
})

/**
 * ensureFaProjectExtension
 * Appends or preserves the project file extension.
 */
test('ensureFaProjectExtension appends extension when missing', () => {
  expect(ensureFaProjectExtension('D:\\a\\proj', projectFileExtension)).toBe('D:\\a\\proj.faproject')
})

test('ensureFaProjectExtension preserves existing extension', () => {
  expect(ensureFaProjectExtension('D:\\a\\proj.faproject', projectFileExtension)).toBe('D:\\a\\proj.faproject')
})

/**
 * faDisplayNameFallbackFromProjectPath
 * Derives a display name stem from an absolute project path.
 */
test('faDisplayNameFallbackFromProjectPath uses basename stem', () => {
  expect(faDisplayNameFallbackFromProjectPath('D:\\w\\My Book.faproject', pathApi, projectFileExtension)).toBe('My Book')
})

test('faDisplayNameFallbackFromProjectPath keeps basename when extension suffix mismatches', () => {
  expect(faDisplayNameFallbackFromProjectPath('D:\\only\\Backup', pathApi, projectFileExtension)).toBe('Backup')
})

test('faDisplayNameFallbackFromProjectPath falls back to Project when stem empty', () => {
  expect(faDisplayNameFallbackFromProjectPath('D:\\w\\.faproject', pathApi, projectFileExtension)).toBe('Project')
})

test('faDisplayNameFallbackFromProjectPath falls back to Project when stem is only dots', () => {
  expect(faDisplayNameFallbackFromProjectPath('D:\\w\\..faproject', pathApi, projectFileExtension)).toBe('Project')
})

test('faDisplayNameFallbackFromProjectPath uses unix-style basename on forward-slash posix paths', () => {
  expect(faDisplayNameFallbackFromProjectPath('/home/me/My Book.faproject', pathApi, projectFileExtension)).toBe('My Book')
})
