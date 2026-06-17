import { expect, test } from 'vitest'

import {
  appendDialogProjectSettingsDocumentTemplateDraft,
  collectInvalidDialogProjectSettingsDocumentTemplateIds,
  hasDialogProjectSettingsDocumentTemplateNameValidationError,
  isDialogProjectSettingsDocumentTemplateRemoveDisabled,
  mapDialogProjectSettingsDocumentTemplatesToSnapshot,
  resolveDialogProjectSettingsDocumentTemplateDisplayIcon
} from '../dialogProjectSettingsDocumentTemplatesDraft'

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
      displayName: '  Character  ',
      documentCount: 0,
      icon: '  ',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      worldAppendix: '  Notes  '
    }
  ])

  expect(snapshot).toEqual([
    {
      displayName: 'Character',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      worldAppendix: 'Notes'
    }
  ])
})

/**
 * isDialogProjectSettingsDocumentTemplateRemoveDisabled
 * Blocks delete only when documents reference the template.
 */
test('Test that isDialogProjectSettingsDocumentTemplateRemoveDisabled respects documentCount', () => {
  expect(isDialogProjectSettingsDocumentTemplateRemoveDisabled({
    displayName: 'Tpl',
    documentCount: 0,
    icon: '',
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    worldAppendix: ''
  })).toBe(false)
  expect(isDialogProjectSettingsDocumentTemplateRemoveDisabled({
    displayName: 'Tpl',
    documentCount: 1,
    icon: '',
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    worldAppendix: ''
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
    appendDialogProjectSettingsDocumentTemplateDraft([], 'New template')
  )).toBe(false)
  expect(hasDialogProjectSettingsDocumentTemplateNameValidationError([
    {
      displayName: '   ',
      documentCount: 0,
      icon: '',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      worldAppendix: ''
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
      displayName: 'Character',
      documentCount: 0,
      icon: '',
      id: 'template-a',
      worldAppendix: ''
    },
    {
      displayName: '   ',
      documentCount: 0,
      icon: '',
      id: 'template-b',
      worldAppendix: ''
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
    displayName: '   ',
    documentCount: 0,
    icon: '',
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    worldAppendix: ''
  })).toBe(true)
  expect(resolveDialogProjectSettingsDocumentTemplateSaveErrorDisplayName('  Hero  ', 'Default')).toBe('Hero')
  expect(resolveDialogProjectSettingsDocumentTemplateSaveErrorDisplayName('   ', 'Default')).toBe('Default')
})

/**
 * mapDialogProjectSettingsDocumentTemplatesToSnapshot
 * Includes icon when non-blank after trim.
 */
test('Test that mapDialogProjectSettingsDocumentTemplatesToSnapshot includes icon when set', () => {
  const snapshot = mapDialogProjectSettingsDocumentTemplatesToSnapshot([
    {
      displayName: 'Character',
      documentCount: 0,
      icon: ' person ',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      worldAppendix: ''
    }
  ])
  expect(snapshot[0]?.icon).toBe('person')
})
