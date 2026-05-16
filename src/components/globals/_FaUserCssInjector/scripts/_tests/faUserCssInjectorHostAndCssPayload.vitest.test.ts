/** @vitest-environment jsdom */

import { expect, test } from 'vitest'

import {
  resolveFaUserCssInjectorEffectiveCssPayload,
  resolveFaUserCssInjectorHostDocument
} from '../faUserCssInjectorHostAndCssPayload'

test('Test live preview dominates persisted css when preview is non-null string', () => {
  expect(resolveFaUserCssInjectorEffectiveCssPayload('z', '.a{color:red}')).toBe('z')
})

test('Test persisted css path when preview is null', () => {
  expect(resolveFaUserCssInjectorEffectiveCssPayload(null, '.persisted{display:block}')).toBe('.persisted{display:block}')
})

test('Test host document resolves only when binding exists', () => {
  expect(resolveFaUserCssInjectorHostDocument({})).toBeUndefined()

  expect(resolveFaUserCssInjectorHostDocument({
    document: undefined
  })).toBeUndefined()

  expect(resolveFaUserCssInjectorHostDocument(globalThis)).toBe(document)
})
