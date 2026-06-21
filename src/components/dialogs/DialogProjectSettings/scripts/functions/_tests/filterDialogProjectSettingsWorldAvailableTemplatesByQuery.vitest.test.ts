import { expect, test } from 'vitest'

import { filterDialogProjectSettingsWorldAvailableTemplatesByQuery } from '../filterDialogProjectSettingsWorldAvailableTemplatesByQuery'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'

const templateA: I_dialogProjectSettingsDocumentTemplateDraft = {
  displayName: 'Character',
  documentCount: 0,
  icon: 'mdi-account',
  id: 'template-a',
  worldAppendix: ' sheet'
}

const templateB: I_dialogProjectSettingsDocumentTemplateDraft = {
  displayName: 'Locations',
  documentCount: 0,
  icon: 'mdi-map',
  id: 'template-b',
  worldAppendix: ' atlas'
}

const templates = [templateA, templateB]

test('Test that available templates filter returns all rows for blank query', () => {
  expect(filterDialogProjectSettingsWorldAvailableTemplatesByQuery(templates, '')).toEqual(templates)
  expect(filterDialogProjectSettingsWorldAvailableTemplatesByQuery(templates, '   ')).toEqual(templates)
})

test('Test that available templates filter matches display name case-insensitively', () => {
  expect(filterDialogProjectSettingsWorldAvailableTemplatesByQuery(templates, 'char')).toEqual([templateA])
})

test('Test that available templates filter matches world appendix case-insensitively', () => {
  expect(filterDialogProjectSettingsWorldAvailableTemplatesByQuery(templates, 'atlas')).toEqual([templateB])
})

test('Test that available templates filter excludes rows without name or appendix match', () => {
  expect(filterDialogProjectSettingsWorldAvailableTemplatesByQuery(templates, 'missing')).toEqual([])
})
