import { expect, test, vi } from 'vitest'

import {
  parseFaProjectWorldTemplateGroupDisplayNameTranslationsJson,
  parseFaProjectWorldTemplateGroupDisplayNameTranslationsSnapshot,
  serializeFaProjectWorldTemplateGroupDisplayNameTranslationsJson
} from '../faProjectWorldTemplateGroupDisplayNameTranslationsSchema'
import {
  parseFaProjectWorldTemplatePlacementNicknameTranslationsJson,
  parseFaProjectWorldTemplatePlacementNicknameTranslationsSnapshot,
  serializeFaProjectWorldTemplatePlacementNicknameTranslationsJson
} from '../faProjectWorldTemplatePlacementNicknameTranslationsSchema'

/**
 * parseFaProjectWorldTemplateGroupDisplayNameTranslationsJson
 * Returns empty object for invalid JSON or schema payloads.
 */
test('Test that group display name translation JSON parse tolerates invalid payloads', () => {
  expect(parseFaProjectWorldTemplateGroupDisplayNameTranslationsJson('not-json')).toEqual({})
  expect(parseFaProjectWorldTemplateGroupDisplayNameTranslationsJson('{"extra":true}')).toEqual({})
  expect(parseFaProjectWorldTemplateGroupDisplayNameTranslationsJson('{"en-US":"Creatures"}')).toEqual({
    'en-US': 'Creatures'
  })
})

/**
 * serializeFaProjectWorldTemplateGroupDisplayNameTranslationsJson
 * Serializes normalized maps and rejects oversized payloads.
 */
test('Test that group display name translation JSON serialize round-trips', () => {
  const serialized = serializeFaProjectWorldTemplateGroupDisplayNameTranslationsJson({
    'en-US': 'Creatures',
    de: ' Kreaturen '
  })
  expect(JSON.parse(serialized)).toEqual({
    'en-US': 'Creatures',
    de: 'Kreaturen'
  })
  const stringifySpy = vi.spyOn(JSON, 'stringify').mockReturnValue('x'.repeat(5000))
  expect(() => serializeFaProjectWorldTemplateGroupDisplayNameTranslationsJson({
    'en-US': 'Creatures'
  })).toThrow('World template group display name translations exceed storage limit')
  stringifySpy.mockRestore()
})

/**
 * parseFaProjectWorldTemplateGroupDisplayNameTranslationsSnapshot
 * Requires at least one non-empty translation.
 */
test('Test that group display name translation snapshot parse enforces required locale', () => {
  expect(parseFaProjectWorldTemplateGroupDisplayNameTranslationsSnapshot({
    'en-US': 'Creatures'
  })).toEqual({
    'en-US': 'Creatures'
  })
  expect(() => parseFaProjectWorldTemplateGroupDisplayNameTranslationsSnapshot({})).toThrow()
})

/**
 * parseFaProjectWorldTemplatePlacementNicknameTranslationsJson
 * Returns empty object for invalid JSON or schema payloads.
 */
test('Test that placement nickname translation JSON parse tolerates invalid payloads', () => {
  expect(parseFaProjectWorldTemplatePlacementNicknameTranslationsJson('not-json')).toEqual({})
  expect(parseFaProjectWorldTemplatePlacementNicknameTranslationsJson('{"extra":true}')).toEqual({})
  expect(parseFaProjectWorldTemplatePlacementNicknameTranslationsJson('{"en-US":"Hero"}')).toEqual({
    'en-US': 'Hero'
  })
})

/**
 * serializeFaProjectWorldTemplatePlacementNicknameTranslationsJson
 * Serializes normalized maps and rejects oversized payloads.
 */
test('Test that placement nickname translation JSON serialize round-trips', () => {
  const serialized = serializeFaProjectWorldTemplatePlacementNicknameTranslationsJson({
    'en-US': 'Hero',
    de: ' Held '
  })
  expect(JSON.parse(serialized)).toEqual({
    'en-US': 'Hero',
    de: 'Held'
  })
  const stringifySpy = vi.spyOn(JSON, 'stringify').mockReturnValue('x'.repeat(5000))
  expect(() => serializeFaProjectWorldTemplatePlacementNicknameTranslationsJson({
    'en-US': 'Hero'
  })).toThrow('World template placement nickname translations exceed storage limit')
  stringifySpy.mockRestore()
})

/**
 * parseFaProjectWorldTemplatePlacementNicknameTranslationsSnapshot
 * Accepts empty nickname maps for optional overrides.
 */
test('Test that placement nickname translation snapshot parse accepts empty maps', () => {
  expect(parseFaProjectWorldTemplatePlacementNicknameTranslationsSnapshot({})).toEqual({})
  expect(parseFaProjectWorldTemplatePlacementNicknameTranslationsSnapshot({
    'en-US': 'Alias'
  })).toEqual({
    'en-US': 'Alias'
  })
})
