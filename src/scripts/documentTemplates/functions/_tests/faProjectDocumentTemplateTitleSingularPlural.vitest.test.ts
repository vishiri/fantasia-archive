import { expect, test, vi } from 'vitest'

import {
  buildFaProjectDocumentTemplateTitleSingularPluralTranslations,
  createNormalizeFaProjectDocumentTemplateTitleSingularPluralTranslations,
  createResolveFaProjectDocumentTemplateDisplayTitleFromFields
} from '../faProjectDocumentTemplateTitleSingularPlural'

test('Test that buildFaProjectDocumentTemplateTitleSingularPluralTranslations pairs plural and singular maps', () => {
  expect(buildFaProjectDocumentTemplateTitleSingularPluralTranslations({
    titlePluralTranslations: { 'en-US': 'Races' },
    titleSingularTranslations: { 'en-US': 'Race' }
  })).toEqual({
    plural: { 'en-US': 'Races' },
    singular: { 'en-US': 'Race' }
  })
})

test('Test that createNormalizeFaProjectDocumentTemplateTitleSingularPluralTranslations normalizes both maps', () => {
  const normalizePlural = vi.fn((translations: Record<string, string>) => translations)
  const normalizeSingular = vi.fn((translations: Record<string, string>) => translations)
  const normalize = createNormalizeFaProjectDocumentTemplateTitleSingularPluralTranslations({
    normalizePlural,
    normalizeSingular
  })
  const input = {
    titlePluralTranslations: { 'en-US': 'Races' },
    titleSingularTranslations: { 'en-US': 'Race' }
  }
  expect(normalize(input)).toEqual(input)
  expect(normalizePlural).toHaveBeenCalledWith(input.titlePluralTranslations)
  expect(normalizeSingular).toHaveBeenCalledWith(input.titleSingularTranslations)
})

test('Test that createResolveFaProjectDocumentTemplateDisplayTitleFromFields resolves combined maps', () => {
  const resolveDisplayTitle = vi.fn(() => 'Resolved')
  const resolve = createResolveFaProjectDocumentTemplateDisplayTitleFromFields({
    buildSingularPlural: buildFaProjectDocumentTemplateTitleSingularPluralTranslations,
    resolveDisplayTitle
  })
  expect(resolve({ 'en-US': 'Races' }, { 'en-US': 'Race' }, 'en-US')).toBe('Resolved')
  expect(resolveDisplayTitle).toHaveBeenCalledWith({
    plural: { 'en-US': 'Races' },
    singular: { 'en-US': 'Race' }
  }, 'en-US')
})
