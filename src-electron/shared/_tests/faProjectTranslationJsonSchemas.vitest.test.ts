import { expect, test } from 'vitest'

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

test('Test that translation JSON parsers return empty map for invalid stored JSON', () => {
  expect(parseFaProjectWorldDisplayNameTranslationsJson('not-json')).toEqual({})
  expect(parseFaProjectDocumentTemplateTitleTranslationsJson('{bad')).toEqual({})
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
