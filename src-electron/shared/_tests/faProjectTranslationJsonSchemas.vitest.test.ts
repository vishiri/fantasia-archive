import { expect, test, vi } from 'vitest'

import {
  parseFaProjectDocumentTemplateTitleSingularTranslationsJson,
  parseFaProjectDocumentTemplateTitleSingularTranslationsSnapshot,
  serializeFaProjectDocumentTemplateTitleSingularTranslationsJson
} from '../faProjectDocumentTemplateTitleSingularTranslationsSchema'
import {
  parseFaProjectDocumentTemplateTitleTranslationsJson,
  parseFaProjectDocumentTemplateTitleTranslationsSnapshot,
  serializeFaProjectDocumentTemplateTitleTranslationsJson
} from '../faProjectDocumentTemplateTitleTranslationsSchema'
import {
  parseFaProjectDocumentTemplateWorldAppendixTranslationsJson,
  parseFaProjectDocumentTemplateWorldAppendixTranslationsSnapshot,
  serializeFaProjectDocumentTemplateWorldAppendixTranslationsJson
} from '../faProjectDocumentTemplateWorldAppendixTranslationsSchema'
import {
  parseFaProjectWorldDisplayNameTranslationsJson,
  parseFaProjectWorldDisplayNameTranslationsSnapshot,
  serializeFaProjectWorldDisplayNameTranslationsJson
} from '../faProjectWorldDisplayNameTranslationsSchema'
import {
  parseFaProjectWorldTemplatePlacementNicknameSingularTranslationsJson,
  parseFaProjectWorldTemplatePlacementNicknameSingularTranslationsSnapshot,
  serializeFaProjectWorldTemplatePlacementNicknameSingularTranslationsJson
} from '../faProjectWorldTemplatePlacementNicknameSingularTranslationsSchema'
import {
  parseFaProjectWorldTemplatePlacementNicknameTranslationsSnapshot,
  serializeFaProjectWorldTemplatePlacementNicknameTranslationsJson
} from '../faProjectWorldTemplatePlacementNicknameTranslationsSchema'

test('Test that translation JSON parsers return empty map for invalid stored JSON', () => {
  expect(parseFaProjectWorldDisplayNameTranslationsJson('not-json')).toEqual({})
  expect(parseFaProjectDocumentTemplateTitleTranslationsJson('{bad')).toEqual({})
  expect(parseFaProjectDocumentTemplateWorldAppendixTranslationsJson('not-json')).toEqual({})
  expect(parseFaProjectDocumentTemplateWorldAppendixTranslationsJson('[]')).toEqual({})
})

test('Test that translation JSON parsers reject unknown locale keys', () => {
  const invalidRecord = JSON.stringify({
    'en-US': 'ok',
    extra: 'nope'
  })
  expect(parseFaProjectWorldDisplayNameTranslationsJson(invalidRecord)).toEqual({})
  expect(parseFaProjectDocumentTemplateTitleTranslationsJson(invalidRecord)).toEqual({})
  expect(parseFaProjectDocumentTemplateWorldAppendixTranslationsJson(invalidRecord)).toEqual({})
})

test('Test that world display name snapshot parser requires at least one translation', () => {
  expect(() => parseFaProjectWorldDisplayNameTranslationsSnapshot({})).toThrow()
})

test('Test that title snapshot parser requires at least one translation', () => {
  expect(() => parseFaProjectDocumentTemplateTitleTranslationsSnapshot({})).toThrow()
})

test('Test that world appendix snapshot parser accepts an empty translation map', () => {
  expect(parseFaProjectDocumentTemplateWorldAppendixTranslationsSnapshot({})).toEqual({})
})

test('Test that translation serializers round-trip canonical locale maps', () => {
  const worldDisplayName = { 'en-US': 'Realm' }
  const title = { 'en-US': 'Character' }
  const appendix = { 'en-US': ' notes' }
  expect(
    parseFaProjectWorldDisplayNameTranslationsJson(
      serializeFaProjectWorldDisplayNameTranslationsJson(worldDisplayName)
    )
  ).toEqual(worldDisplayName)
  expect(
    parseFaProjectDocumentTemplateTitleTranslationsJson(
      serializeFaProjectDocumentTemplateTitleTranslationsJson(title)
    )
  ).toEqual(title)
  expect(
    parseFaProjectDocumentTemplateWorldAppendixTranslationsJson(
      serializeFaProjectDocumentTemplateWorldAppendixTranslationsJson(appendix)
    )
  ).toEqual({ 'en-US': 'notes' })
})

test('Test that singular title translation JSON parsers tolerate invalid stored JSON', () => {
  expect(parseFaProjectDocumentTemplateTitleSingularTranslationsJson('not-json')).toEqual({})
  expect(parseFaProjectDocumentTemplateTitleSingularTranslationsJson('{"extra":"nope"}')).toEqual({})
})

test('Test that placement nickname singular translation JSON parsers tolerate invalid stored JSON', () => {
  expect(parseFaProjectWorldTemplatePlacementNicknameSingularTranslationsJson('not-json')).toEqual({})
  expect(parseFaProjectWorldTemplatePlacementNicknameSingularTranslationsJson('{"extra":"nope"}')).toEqual({})
})

test('Test that placement nickname singular translation JSON parsers normalize valid stored JSON', () => {
  expect(
    parseFaProjectWorldTemplatePlacementNicknameSingularTranslationsJson('{"en-US":" alias "}')
  ).toEqual({ 'en-US': 'alias' })
})

test('Test that placement nickname plural translation snapshot parser accepts canonical maps', () => {
  expect(parseFaProjectWorldTemplatePlacementNicknameTranslationsSnapshot({ 'en-US': 'Alias' })).toEqual({
    'en-US': 'Alias'
  })
})

test('Test that placement nickname singular translation snapshot parser accepts canonical maps', () => {
  expect(parseFaProjectWorldTemplatePlacementNicknameSingularTranslationsSnapshot({ 'en-US': 'Alias' })).toEqual({
    'en-US': 'Alias'
  })
})

test('Test that title singular translation snapshot parser accepts canonical maps', () => {
  expect(parseFaProjectDocumentTemplateTitleSingularTranslationsSnapshot({ 'en-US': 'Hero' })).toEqual({
    'en-US': 'Hero'
  })
})

test('Test that translation serializers reject payloads that exceed storage limits', () => {
  const stringifySpy = vi.spyOn(JSON, 'stringify').mockReturnValue('x'.repeat(5000))

  expect(() => serializeFaProjectWorldDisplayNameTranslationsJson({ 'en-US': 'Realm' })).toThrow(
    /exceed storage limit/
  )
  expect(() => serializeFaProjectDocumentTemplateTitleTranslationsJson({ 'en-US': 'Character' })).toThrow(
    /exceed storage limit/
  )
  expect(() => serializeFaProjectDocumentTemplateTitleSingularTranslationsJson({ 'en-US': 'Hero' })).toThrow(
    /exceed storage limit/
  )
  expect(() => serializeFaProjectWorldTemplatePlacementNicknameTranslationsJson({ 'en-US': 'Alias' })).toThrow(
    /exceed storage limit/
  )
  expect(() => serializeFaProjectWorldTemplatePlacementNicknameSingularTranslationsJson({ 'en-US': 'Alias' })).toThrow(
    /exceed storage limit/
  )

  stringifySpy.mockRestore()

  const appendixStringifySpy = vi.spyOn(JSON, 'stringify').mockReturnValue('x'.repeat(9000))
  expect(() => serializeFaProjectDocumentTemplateWorldAppendixTranslationsJson({ 'en-US': 'notes' })).toThrow(
    /exceed storage limit/
  )
  appendixStringifySpy.mockRestore()
})
