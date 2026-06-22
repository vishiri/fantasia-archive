import { expect, test } from 'vitest'

import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'
import { FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_TRANSLATION_MAX_LENGTH } from 'app/types/I_faProjectDocumentTemplateWorldAppendixTranslations'

import {
  hasFaProjectDocumentTemplateWorldAppendixTranslation,
  normalizeFaProjectDocumentTemplateWorldAppendixTranslations,
  resolveFaProjectDocumentTemplateWorldAppendix,
  resolveFaProjectDocumentTemplateWorldAppendixForStorage,
  resolveFaProjectDocumentTemplateWorldAppendixLanguageCode
} from '../faProjectDocumentTemplateWorldAppendix_manager'

test('Test that resolveFaProjectDocumentTemplateWorldAppendix returns preferred language when present', () => {
  const worldAppendixTranslations = {
    'en-US': ' of Earth',
    de: ' der Erde'
  }
  expect(resolveFaProjectDocumentTemplateWorldAppendix(worldAppendixTranslations, 'de')).toBe('der Erde')
  expect(resolveFaProjectDocumentTemplateWorldAppendixLanguageCode(worldAppendixTranslations, 'de')).toBe('de')
})

test('Test that resolveFaProjectDocumentTemplateWorldAppendix falls back to en-US', () => {
  const worldAppendixTranslations = {
    'en-US': ' notes',
    de: ''
  }
  expect(resolveFaProjectDocumentTemplateWorldAppendix(worldAppendixTranslations, 'de')).toBe('notes')
  expect(resolveFaProjectDocumentTemplateWorldAppendixLanguageCode(worldAppendixTranslations, 'de')).toBe('en-US')
})

test('Test that resolveFaProjectDocumentTemplateWorldAppendix returns empty when no translations exist', () => {
  expect(resolveFaProjectDocumentTemplateWorldAppendix({}, 'en-US')).toBe('')
})

test('Test that hasFaProjectDocumentTemplateWorldAppendixTranslation detects any non-empty locale', () => {
  expect(hasFaProjectDocumentTemplateWorldAppendixTranslation({ de: '  ' })).toBe(false)
  expect(hasFaProjectDocumentTemplateWorldAppendixTranslation({ de: ' appendix ' })).toBe(true)
})

test('Test that resolveFaProjectDocumentTemplateWorldAppendixForStorage uses en-US fallback chain', () => {
  expect(resolveFaProjectDocumentTemplateWorldAppendixForStorage({ de: ' appendix ' })).toBe('appendix')
})

test('Test that normalizeFaProjectDocumentTemplateWorldAppendixTranslations trims and drops empty keys', () => {
  expect(normalizeFaProjectDocumentTemplateWorldAppendixTranslations({
    'en-US': '  notes  ',
    de: '   '
  })).toEqual({
    'en-US': 'notes'
  })
})

test('Test that world appendix normalize respects max length constant', () => {
  const longValue = 'x'.repeat(FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_TRANSLATION_MAX_LENGTH + 10)
  const normalized = normalizeFaProjectDocumentTemplateWorldAppendixTranslations({
    'en-US': longValue
  })
  expect(normalized['en-US']?.length).toBe(FA_PROJECT_DOCUMENT_TEMPLATE_WORLD_APPENDIX_TRANSLATION_MAX_LENGTH)
  expect(FA_USER_SETTINGS_LANGUAGE_CODES.length).toBeGreaterThan(0)
})
