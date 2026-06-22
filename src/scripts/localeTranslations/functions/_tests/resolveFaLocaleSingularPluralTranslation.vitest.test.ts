import { expect, test } from 'vitest'

import {
  hasFaLocaleSingularPluralTranslation,
  normalizeFaLocaleSingularPluralTranslations,
  resolveFaLocaleSingularPluralDisplayTranslation,
  resolveFaLocaleSingularPluralDisplayTranslationLanguageCode,
  resolveFaLocaleSingularPluralDisplayTranslationResolution,
  resolveFaLocaleSingularPluralMissingFormsForLanguage,
  resolveFaLocaleSingularPluralMissingTranslationWarning
} from '../../faLocaleSingularPluralTranslations_manager'

test('Test that resolveFaLocaleSingularPluralDisplayTranslation prefers plural in active locale', () => {
  const translations = {
    plural: {
      'en-US': 'Characters',
      de: 'Charaktere'
    },
    singular: {
      'en-US': 'Character',
      de: 'Charakter'
    }
  }
  expect(resolveFaLocaleSingularPluralDisplayTranslation(translations, 'de')).toBe('Charaktere')
  const resolution = resolveFaLocaleSingularPluralDisplayTranslationResolution(translations, 'de')
  expect(resolution.usedForm).toBe('plural')
  expect(resolution.displayLanguageCode).toBe('de')
})

test('Test that resolveFaLocaleSingularPluralDisplayTranslation falls back to singular in active locale', () => {
  const translations = {
    plural: { 'en-US': 'Characters' },
    singular: { de: 'Charakter' }
  }
  expect(resolveFaLocaleSingularPluralDisplayTranslation(translations, 'de')).toBe('Charakter')
  const resolution = resolveFaLocaleSingularPluralDisplayTranslationResolution(translations, 'de')
  expect(resolution.usedForm).toBe('singular')
  expect(resolution.displayLanguageCode).toBe('de')
})

test('Test that resolveFaLocaleSingularPluralDisplayTranslation crosses locales after active locale exhausted', () => {
  const translations = {
    plural: { fr: 'Personnages' },
    singular: {}
  }
  expect(resolveFaLocaleSingularPluralDisplayTranslation(translations, 'de')).toBe('Personnages')
  expect(resolveFaLocaleSingularPluralDisplayTranslationLanguageCode(translations, 'de')).toBe('fr')
})

test('Test that resolveFaLocaleSingularPluralMissingFormsForLanguage detects both missing', () => {
  const translations = {
    plural: { 'en-US': 'Characters' },
    singular: { 'en-US': 'Character' }
  }
  expect(resolveFaLocaleSingularPluralMissingFormsForLanguage(translations, 'de')).toBe('both')
})

test('Test that resolveFaLocaleSingularPluralMissingFormsForLanguage detects plural only missing', () => {
  const translations = {
    plural: {},
    singular: { de: 'Charakter' }
  }
  expect(resolveFaLocaleSingularPluralMissingFormsForLanguage(translations, 'de')).toBe('plural')
})

test('Test that resolveFaLocaleSingularPluralMissingFormsForLanguage detects singular only missing', () => {
  const translations = {
    plural: { de: 'Charaktere' },
    singular: {}
  }
  expect(resolveFaLocaleSingularPluralMissingFormsForLanguage(translations, 'de')).toBe('singular')
})

test('Test that resolveFaLocaleSingularPluralMissingFormsForLanguage returns null when both forms filled', () => {
  const translations = {
    plural: { de: 'Charaktere' },
    singular: { de: 'Charakter' }
  }
  expect(resolveFaLocaleSingularPluralMissingFormsForLanguage(translations, 'de')).toBe(null)
})

test('Test that resolveFaLocaleSingularPluralMissingTranslationWarning returns null when active locale complete', () => {
  const translations = {
    plural: { de: 'Charaktere' },
    singular: { de: 'Charakter' }
  }
  expect(resolveFaLocaleSingularPluralMissingTranslationWarning(translations, 'de')).toBe(null)
})

test('Test that resolveFaLocaleSingularPluralMissingTranslationWarning omits fallback when resolved in active locale', () => {
  const translations = {
    plural: { de: '' },
    singular: { de: 'Charakter' }
  }
  expect(resolveFaLocaleSingularPluralMissingTranslationWarning(translations, 'de')).toEqual({
    fallbackLanguageCode: null,
    missingForm: 'plural'
  })
})

test('Test that resolveFaLocaleSingularPluralMissingTranslationWarning includes fallback locale', () => {
  const translations = {
    plural: { 'en-US': 'Characters' },
    singular: { 'en-US': 'Character' }
  }
  expect(resolveFaLocaleSingularPluralMissingTranslationWarning(translations, 'de')).toEqual({
    fallbackLanguageCode: 'en-US',
    missingForm: 'both'
  })
})

test('Test that hasFaLocaleSingularPluralTranslation detects any non-empty form', () => {
  expect(hasFaLocaleSingularPluralTranslation({
    plural: {},
    singular: {}
  })).toBe(false)
  expect(hasFaLocaleSingularPluralTranslation({
    plural: {},
    singular: { de: 'Held' }
  })).toBe(true)
  expect(hasFaLocaleSingularPluralTranslation({
    plural: { de: 'Helden' },
    singular: {}
  })).toBe(true)
})

test('Test that normalizeFaLocaleSingularPluralTranslations normalizes both maps', () => {
  const normalized = normalizeFaLocaleSingularPluralTranslations({
    plural: {
      'en-US': '  Characters  ',
      de: ''
    },
    singular: { de: ' Charakter ' }
  })
  expect(normalized).toEqual({
    plural: { 'en-US': 'Characters' },
    singular: { de: 'Charakter' }
  })
})
