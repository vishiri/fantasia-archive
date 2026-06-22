import { expect, test } from 'vitest'

import { filterDialogProjectSettingsDocumentTemplatesByQuery } from '../filterDialogProjectSettingsDocumentTemplatesByQuery'
import { buildDialogProjectSettingsDocumentTemplateDraft } from '../../_tests/dialogProjectSettingsDocumentTemplateDraftFixtures'

const templateA = buildDialogProjectSettingsDocumentTemplateDraft({
  icon: 'mdi-account',
  id: 'template-a',
  worldAppendixTranslations: { 'en-US': 'sheet' }
})

const templateB = buildDialogProjectSettingsDocumentTemplateDraft({
  icon: 'mdi-map',
  id: 'template-b',
  titleTranslations: { 'en-US': 'Locations' },
  worldAppendixTranslations: { 'en-US': 'atlas' }
})

const templates = [templateA, templateB]

test('Test that available templates filter returns all rows for blank query', () => {
  expect(filterDialogProjectSettingsDocumentTemplatesByQuery(templates, '', 'en-US')).toEqual(templates)
  expect(filterDialogProjectSettingsDocumentTemplatesByQuery(templates, '   ', 'en-US')).toEqual(templates)
})

test('Test that available templates filter matches display name case-insensitively', () => {
  expect(filterDialogProjectSettingsDocumentTemplatesByQuery(templates, 'char', 'en-US')).toEqual([templateA])
})

test('Test that available templates filter matches world appendix case-insensitively', () => {
  expect(filterDialogProjectSettingsDocumentTemplatesByQuery(templates, 'atlas', 'en-US')).toEqual([templateB])
})

test('Test that available templates filter excludes rows without name or appendix match', () => {
  expect(filterDialogProjectSettingsDocumentTemplatesByQuery(templates, 'missing', 'en-US')).toEqual([])
})

test('Test that available templates filter resolves titles for the active UI language', () => {
  const germanTemplate = buildDialogProjectSettingsDocumentTemplateDraft({
    id: 'template-de',
    titleTranslations: { de: 'Held' }
  })
  expect(filterDialogProjectSettingsDocumentTemplatesByQuery(
    [germanTemplate],
    'held',
    'de'
  )).toEqual([germanTemplate])
})
