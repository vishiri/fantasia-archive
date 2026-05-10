import { expect, test } from 'vitest'

import {
  FA_PROJECT_NAME_MAX_LEN
} from 'app/src-electron/shared/faProjectConstants'

import { faProjectSlugFromDisplayName } from '../faProjectSlugFromDisplayName'

test('faProjectSlugFromDisplayName preserves spaces and casing when safe', () => {
  expect(faProjectSlugFromDisplayName('Some project')).toBe('Some project')
  expect(faProjectSlugFromDisplayName('Hello World')).toBe('Hello World')
})

test('faProjectSlugFromDisplayName folds path-forbidden punctuation into spaced words', () => {
  expect(faProjectSlugFromDisplayName('a:b|c*d?q')).toBe('a b c d q')
})

test('faProjectSlugFromDisplayName uses default when trimmed input is whitespace only', () => {
  expect(faProjectSlugFromDisplayName('   \t  \n')).toBe('fantasia-project')
})

test('faProjectSlugFromDisplayName falls back when there is no letters or digits', () => {
  expect(faProjectSlugFromDisplayName('!!!')).toBe('fantasia-project')
})

test('faProjectSlugFromDisplayName prefixes Windows reserved stems', () => {
  expect(faProjectSlugFromDisplayName('con')).toBe('project-con')
})

test('faProjectSlugFromDisplayName rewrites dot-only collapse to the default basename', () => {
  expect(faProjectSlugFromDisplayName('...')).toBe('fantasia-project')
})

test('faProjectSlugFromDisplayName caps long ascii basenames', () => {
  const long = 'a'.repeat(FA_PROJECT_NAME_MAX_LEN + 20)
  const slug = faProjectSlugFromDisplayName(long)
  expect(slug.length).toBeLessThanOrEqual(FA_PROJECT_NAME_MAX_LEN)
})

test('faProjectSlugFromDisplayName trims trailing dots and spaces after length cap', () => {
  const slug = faProjectSlugFromDisplayName(`${'m'.repeat(118)} ..`)
  expect(slug.length).toBeLessThanOrEqual(FA_PROJECT_NAME_MAX_LEN)
  expect(slug.endsWith('.')).toBe(false)
  expect(/\s$/u.test(slug)).toBe(false)
})

test('faProjectSlugFromDisplayName drops emoji-only names to the default basename', () => {
  expect(faProjectSlugFromDisplayName('😀')).toBe('fantasia-project')
})

test('faProjectSlugFromDisplayName trims hidden-file leading dots on Unix', () => {
  expect(faProjectSlugFromDisplayName('.My Project')).toBe('My Project')
})
