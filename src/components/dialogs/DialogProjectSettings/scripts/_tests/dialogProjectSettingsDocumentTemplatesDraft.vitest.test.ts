import { expect, test } from 'vitest'

import {
  appendDialogProjectSettingsDocumentTemplateDraft,
  collectInvalidDialogProjectSettingsDocumentTemplateIds,
  hasDialogProjectSettingsDocumentTemplateNameValidationError,
  isDialogProjectSettingsDocumentTemplateRemoveDisabled,
  mapDialogProjectSettingsDocumentTemplatesToSnapshot,
  resolveDialogProjectSettingsDocumentTemplateDisplayIcon,
  isDialogProjectSettingsDocumentTemplateResolvedTitleUsingFallback,
  isDialogProjectSettingsDocumentTemplateMissingCurrentLanguageTranslations,
  resolveDialogProjectSettingsDocumentTemplateResolvedTitle,
  resolveDialogProjectSettingsDocumentTemplateResolvedTitleLanguageCode
} from '../dialogProjectSettingsDocumentTemplatesDraft'

/**
 * resolveDialogProjectSettingsDocumentTemplateResolvedTitle
 * Delegates to the shared resolver for the active UI language.
 */
test('Test that resolveDialogProjectSettingsDocumentTemplateResolvedTitle uses language fallback', () => {
  expect(resolveDialogProjectSettingsDocumentTemplateResolvedTitle(
    {
      titleTranslations: {
        de: 'German',
        fr: 'French'
      }
    },
    'ja'
  )).toBe('German')
})

test('Test that isDialogProjectSettingsDocumentTemplateResolvedTitleUsingFallback detects missing active locale', () => {
  const template = {
    titleTranslations: {
      'en-US': 'Races'
    }
  }
  expect(isDialogProjectSettingsDocumentTemplateResolvedTitleUsingFallback(template, 'de')).toBe(true)
  expect(resolveDialogProjectSettingsDocumentTemplateResolvedTitleLanguageCode(template, 'de')).toBe('en-US')
  expect(isDialogProjectSettingsDocumentTemplateResolvedTitleUsingFallback(template, 'en-US')).toBe(false)
})

test('Test that isDialogProjectSettingsDocumentTemplateMissingCurrentLanguageTranslations detects empty active locale', () => {
  const template = {
    titleTranslations: {
      'en-US': 'Races'
    }
  }
  expect(isDialogProjectSettingsDocumentTemplateMissingCurrentLanguageTranslations(template, 'de')).toBe(true)
  expect(isDialogProjectSettingsDocumentTemplateMissingCurrentLanguageTranslations(template, 'en-US')).toBe(false)
  expect(isDialogProjectSettingsDocumentTemplateMissingCurrentLanguageTranslations(
    { titleTranslations: { de: 'Rassen' } },
    'de'
  )).toBe(false)
})

/**
 * resolveDialogProjectSettingsDocumentTemplateDisplayIcon
 * Uses the shared empty-template placeholder when icon is blank.
 */
test('Test that resolveDialogProjectSettingsDocumentTemplateDisplayIcon falls back to placeholder icon', () => {
  expect(resolveDialogProjectSettingsDocumentTemplateDisplayIcon('', 'mdi-file-outline')).toBe('mdi-file-outline')
  expect(resolveDialogProjectSettingsDocumentTemplateDisplayIcon('  ', 'mdi-file-outline')).toBe('mdi-file-outline')
  expect(resolveDialogProjectSettingsDocumentTemplateDisplayIcon(' fa-solid fa-dragon ', 'mdi-file-outline')).toBe('fa-solid fa-dragon')
})

/**
 * mapDialogProjectSettingsDocumentTemplatesToSnapshot
 * Omits blank optional strings from the IPC payload.
 */
test('Test that mapDialogProjectSettingsDocumentTemplatesToSnapshot trims optional fields', () => {
  const snapshot = mapDialogProjectSettingsDocumentTemplatesToSnapshot([
    {
      documentCount: 0,
      icon: '  ',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      titleTranslations: { 'en-US': '  Character  ' },
      worldAppendixTranslations: { 'en-US': 'Notes' }
    }
  ])

  expect(snapshot).toEqual([
    {
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      titleTranslations: { 'en-US': 'Character' },
      worldAppendixTranslations: { 'en-US': 'Notes' }
    }
  ])
})

/**
 * isDialogProjectSettingsDocumentTemplateRemoveDisabled
 * Blocks delete only when documents reference the template.
 */
test('Test that isDialogProjectSettingsDocumentTemplateRemoveDisabled respects documentCount', () => {
  expect(isDialogProjectSettingsDocumentTemplateRemoveDisabled({
    documentCount: 0,
    icon: '',
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    titleTranslations: { 'en-US': 'Tpl' },
    worldAppendixTranslations: {}
  })).toBe(false)
  expect(isDialogProjectSettingsDocumentTemplateRemoveDisabled({
    documentCount: 1,
    icon: '',
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    titleTranslations: { 'en-US': 'Tpl' },
    worldAppendixTranslations: {}
  })).toBe(true)
})

/**
 * hasDialogProjectSettingsDocumentTemplateNameValidationError
 * Treats null as invalid and allows an empty template list.
 */
test('Test that hasDialogProjectSettingsDocumentTemplateNameValidationError handles null and empty lists', () => {
  expect(hasDialogProjectSettingsDocumentTemplateNameValidationError(null)).toBe(true)
  expect(hasDialogProjectSettingsDocumentTemplateNameValidationError([])).toBe(false)
  expect(hasDialogProjectSettingsDocumentTemplateNameValidationError(
    appendDialogProjectSettingsDocumentTemplateDraft([], 'en-US', 'New template')
  )).toBe(false)
  expect(hasDialogProjectSettingsDocumentTemplateNameValidationError([
    {
      documentCount: 0,
      icon: '',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      titleTranslations: { 'en-US': '   ' },
      worldAppendixTranslations: {}
    }
  ])).toBe(true)
})

/**
 * collectInvalidDialogProjectSettingsDocumentTemplateIds
 * Returns ids for templates whose trimmed display name is blank.
 */
test('Test that collectInvalidDialogProjectSettingsDocumentTemplateIds collects blank template ids', () => {
  expect(collectInvalidDialogProjectSettingsDocumentTemplateIds(null)).toEqual(new Set())
  expect(collectInvalidDialogProjectSettingsDocumentTemplateIds([
    {
      documentCount: 0,
      icon: '',
      id: 'template-a',
      titleTranslations: { 'en-US': 'Character' },
      worldAppendixTranslations: {}
    },
    {
      documentCount: 0,
      icon: '',
      id: 'template-b',
      titleTranslations: { 'en-US': '   ' },
      worldAppendixTranslations: {}
    }
  ])).toEqual(new Set(['template-b']))
})

/**
 * isDialogProjectSettingsDocumentTemplateTabValidationError
 * Mirrors blank-name validation for tab row styling.
 */
test('Test that isDialogProjectSettingsDocumentTemplateTabValidationError flags blank names', async () => {
  const {
    isDialogProjectSettingsDocumentTemplateTabValidationError,
    resolveDialogProjectSettingsDocumentTemplateSaveErrorDisplayName
  } = await import('../dialogProjectSettingsDocumentTemplatesDraft')

  expect(isDialogProjectSettingsDocumentTemplateTabValidationError({
    documentCount: 0,
    icon: '',
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    titleTranslations: { 'en-US': '   ' },
    worldAppendixTranslations: {}
  })).toBe(true)
  expect(resolveDialogProjectSettingsDocumentTemplateSaveErrorDisplayName(
    { 'en-US': '  Hero  ' },
    'en-US',
    'Default'
  )).toBe('Hero')
  expect(resolveDialogProjectSettingsDocumentTemplateSaveErrorDisplayName(
    { 'en-US': '   ' },
    'en-US',
    'Default'
  )).toBe('Default')
})

/**
 * mapDialogProjectSettingsDocumentTemplatesToSnapshot
 * Includes icon when non-blank after trim.
 */
test('Test that mapDialogProjectSettingsDocumentTemplatesToSnapshot includes icon when set', () => {
  const snapshot = mapDialogProjectSettingsDocumentTemplatesToSnapshot([
    {
      documentCount: 0,
      icon: ' person ',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      titleTranslations: { 'en-US': 'Character' },
      worldAppendixTranslations: {}
    }
  ])
  expect(snapshot[0]?.icon).toBe('person')
})
