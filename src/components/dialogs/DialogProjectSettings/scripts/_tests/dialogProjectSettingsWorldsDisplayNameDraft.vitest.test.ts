import { expect, test } from 'vitest'

import {
  isDialogProjectSettingsWorldMissingCurrentLanguageTranslations,
  isDialogProjectSettingsWorldNameInvalid,
  isDialogProjectSettingsWorldResolvedDisplayNameUsingFallback,
  normalizeDialogProjectSettingsWorldDisplayNameTranslations,
  resolveDialogProjectSettingsWorldResolvedDisplayName,
  resolveDialogProjectSettingsWorldResolvedDisplayNameLanguageCode,
  resolveDialogProjectSettingsWorldSaveErrorDisplayName
} from '../dialogProjectSettingsWorldsDisplayNameDraft'

test('Test that resolveDialogProjectSettingsWorldResolvedDisplayName resolves current locale', () => {
  expect(resolveDialogProjectSettingsWorldResolvedDisplayName(
    {
      displayNameTranslations: {
        'en-US': 'Realm',
        de: 'Reich'
      }
    },
    'de'
  )).toBe('Reich')
})

test('Test that resolveDialogProjectSettingsWorldResolvedDisplayNameLanguageCode reports fallback source', () => {
  expect(resolveDialogProjectSettingsWorldResolvedDisplayNameLanguageCode(
    {
      displayNameTranslations: {
        'en-US': 'Realm',
        de: ''
      }
    },
    'de'
  )).toBe('en-US')
})

test('Test that isDialogProjectSettingsWorldResolvedDisplayNameUsingFallback is true when another locale is used', () => {
  expect(isDialogProjectSettingsWorldResolvedDisplayNameUsingFallback(
    {
      displayNameTranslations: {
        'en-US': 'Realm',
        de: ''
      }
    },
    'de'
  )).toBe(true)
})

test('Test that isDialogProjectSettingsWorldNameInvalid detects empty translation maps', () => {
  expect(isDialogProjectSettingsWorldNameInvalid({ 'en-US': '   ' })).toBe(true)
  expect(isDialogProjectSettingsWorldNameInvalid({ 'en-US': 'Realm' })).toBe(false)
})

test('Test that resolveDialogProjectSettingsWorldSaveErrorDisplayName falls back to default label', () => {
  expect(resolveDialogProjectSettingsWorldSaveErrorDisplayName(
    { 'en-US': '   ' },
    'en-US',
    'New world'
  )).toBe('New world')
})

test('Test that normalizeDialogProjectSettingsWorldDisplayNameTranslations trims locale values', () => {
  expect(normalizeDialogProjectSettingsWorldDisplayNameTranslations({
    'en-US': '  Realm  '
  })).toEqual({
    'en-US': 'Realm'
  })
})

test('Test that isDialogProjectSettingsWorldMissingCurrentLanguageTranslations detects missing active locale', () => {
  expect(isDialogProjectSettingsWorldMissingCurrentLanguageTranslations(
    { displayNameTranslations: { 'en-US': 'Realm' } },
    'de'
  )).toBe(true)
  expect(isDialogProjectSettingsWorldMissingCurrentLanguageTranslations(
    {
      displayNameTranslations: {
        de: 'Reich',
        'en-US': 'Realm'
      }
    },
    'de'
  )).toBe(false)
  expect(isDialogProjectSettingsWorldMissingCurrentLanguageTranslations(
    { displayNameTranslations: { de: '   ' } },
    'de'
  )).toBe(true)
})
