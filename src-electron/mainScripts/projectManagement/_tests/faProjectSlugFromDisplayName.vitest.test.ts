import { expect, test } from 'vitest'

import {
  FA_PROJECT_SLUG_MAX_LEN
} from 'app/src-electron/shared/faProjectConstants'

import { faProjectSlugFromDisplayName } from '../faProjectSlugFromDisplayName'

test('faProjectSlugFromDisplayName maps spaces to dashes and lowercases', () => {
  expect(faProjectSlugFromDisplayName('Hello World')).toBe('hello-world')
})

test('faProjectSlugFromDisplayName falls back when slug is empty', () => {
  expect(faProjectSlugFromDisplayName('!!!')).toBe('fantasia-project')
})

test('faProjectSlugFromDisplayName prefixes Windows reserved stems', () => {
  expect(faProjectSlugFromDisplayName('con')).toBe('project-con')
})

test('faProjectSlugFromDisplayName rewrites dot-only collapse to the default slug', () => {
  expect(faProjectSlugFromDisplayName('...')).toBe('fantasia-project')
})

test('faProjectSlugFromDisplayName caps long ascii slugs', () => {
  const long = 'a'.repeat(FA_PROJECT_SLUG_MAX_LEN + 20)
  const slug = faProjectSlugFromDisplayName(long)
  expect(slug.length).toBeLessThanOrEqual(FA_PROJECT_SLUG_MAX_LEN)
})

test('faProjectSlugFromDisplayName trims trailing dashes after length cap', () => {
  const slug = faProjectSlugFromDisplayName(`${'a'.repeat(119)}-${'b'.repeat(30)}`)
  expect(slug.length).toBeLessThanOrEqual(FA_PROJECT_SLUG_MAX_LEN)
  expect(slug.endsWith('-')).toBe(false)
})
