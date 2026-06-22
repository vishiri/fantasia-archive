import { expect, test } from 'vitest'

import { FA_USER_SETTINGS_LANGUAGE_CODES } from 'app/types/faUserSettingsLanguageRegistry'
import { FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_TRANSLATION_MAX_LENGTH } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'

import {
  buildFaProjectDocumentTemplateTitleSingularPluralTranslations,
  hasFaProjectDocumentTemplateTitlePluralTranslation,
  normalizeFaProjectDocumentTemplateTitles,
  resolveFaProjectDocumentTemplateDisplayTitle,
  resolveFaProjectDocumentTemplateDisplayTitleLanguageCode,
  resolveFaProjectDocumentTemplateStorageTitle
} from '../faProjectDocumentTemplateTitle_manager'

function buildTitleTranslations (
  plural: Record<string, string>,
  singular: Record<string, string> = {}
) {
  return buildFaProjectDocumentTemplateTitleSingularPluralTranslations({
    titlePluralTranslations: plural,
    titleSingularTranslations: singular
  })
}

test('Test that resolveFaProjectDocumentTemplateTitle returns preferred language when present', () => {
  const titleTranslations = buildTitleTranslations({
    'en-US': 'English',
    de: 'German'
  })
  expect(resolveFaProjectDocumentTemplateDisplayTitle(titleTranslations, 'de')).toBe('German')
  expect(resolveFaProjectDocumentTemplateDisplayTitleLanguageCode(titleTranslations, 'de')).toBe('de')
})

test('Test that resolveFaProjectDocumentTemplateTitle falls back to en-US', () => {
  const titleTranslations = buildTitleTranslations({
    'en-US': 'English',
    de: ''
  })
  expect(resolveFaProjectDocumentTemplateDisplayTitle(titleTranslations, 'de')).toBe('English')
  expect(resolveFaProjectDocumentTemplateDisplayTitleLanguageCode(titleTranslations, 'de')).toBe('en-US')
})

test('Test that resolveFaProjectDocumentTemplateTitle scans remaining codes alphabetically', () => {
  const titleTranslations = buildTitleTranslations({
    fr: 'French',
    de: 'German'
  })
  expect(resolveFaProjectDocumentTemplateDisplayTitle(titleTranslations, 'ja')).toBe('German')
})

test('Test that resolveFaProjectDocumentTemplateTitle returns empty when no translations exist', () => {
  expect(resolveFaProjectDocumentTemplateDisplayTitle(buildTitleTranslations({}), 'en-US')).toBe('')
})

test('Test that hasFaProjectDocumentTemplateTitlePluralTranslation detects any non-empty locale', () => {
  expect(hasFaProjectDocumentTemplateTitlePluralTranslation({ de: '  ' })).toBe(false)
  expect(hasFaProjectDocumentTemplateTitlePluralTranslation({ de: ' Name ' })).toBe(true)
})

test('Test that resolveFaProjectDocumentTemplateTitleForStorage uses en-US fallback chain', () => {
  const titleTranslations = buildTitleTranslations({
    de: 'German only'
  })
  expect(resolveFaProjectDocumentTemplateStorageTitle(titleTranslations)).toBe('German only')
})

test('Test that normalizeFaProjectDocumentTemplateTitleTranslations trims and drops empty keys', () => {
  expect(normalizeFaProjectDocumentTemplateTitles({
    'en-US': '  Race  ',
    de: '   '
  })).toEqual({
    'en-US': 'Race'
  })
})

test('Test that document template title normalize respects max length constant', () => {
  const longValue = 'x'.repeat(FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_TRANSLATION_MAX_LENGTH + 10)
  const normalized = normalizeFaProjectDocumentTemplateTitles({
    'en-US': longValue
  })
  expect(normalized['en-US']?.length).toBe(FA_PROJECT_DOCUMENT_TEMPLATE_TITLE_TRANSLATION_MAX_LENGTH)
  expect(FA_USER_SETTINGS_LANGUAGE_CODES.length).toBeGreaterThan(0)
})
