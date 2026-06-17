import { expect, test } from 'vitest'

import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import {
  collectDialogProjectSettingsDocumentTemplateSaveValidationErrors,
  collectDialogProjectSettingsFullSaveValidationErrors,
  isDialogProjectSettingsFullDialogSaveDisabled
} from '../dialogProjectSettingsDialogSaveValidation'

const templateRow = {
  displayName: 'Character',
  documentCount: 0,
  icon: '',
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  worldAppendix: ''
}

/**
 * collectDialogProjectSettingsDocumentTemplateSaveValidationErrors
 * Returns no errors for null or valid template rows.
 */
test('Test that collectDialogProjectSettingsDocumentTemplateSaveValidationErrors handles valid rows', () => {
  expect(collectDialogProjectSettingsDocumentTemplateSaveValidationErrors(null)).toEqual([])
  expect(collectDialogProjectSettingsDocumentTemplateSaveValidationErrors([templateRow])).toEqual([])
})

/**
 * collectDialogProjectSettingsDocumentTemplateSaveValidationErrors
 * Reports blank template names with one-based index.
 */
test('Test that collectDialogProjectSettingsDocumentTemplateSaveValidationErrors reports blank names', () => {
  expect(collectDialogProjectSettingsDocumentTemplateSaveValidationErrors([
    templateRow,
    {
      ...templateRow,
      displayName: '   ',
      id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
    }
  ])).toEqual([
    {
      kind: 'documentTemplateNameRequired',
      templateIndexOneBased: 2
    }
  ])
})

/**
 * collectDialogProjectSettingsDocumentTemplateSaveValidationErrors
 * Skips sparse array holes without reporting errors.
 */
test('Test that collectDialogProjectSettingsDocumentTemplateSaveValidationErrors skips sparse entries', () => {
  const sparseTemplates = [templateRow] as I_dialogProjectSettingsDocumentTemplateDraft[]
  sparseTemplates.length = 2
  expect(collectDialogProjectSettingsDocumentTemplateSaveValidationErrors(sparseTemplates)).toEqual([])
})

/**
 * isDialogProjectSettingsFullDialogSaveDisabled
 * Combines project, worlds, and document template validation.
 */
test('Test that isDialogProjectSettingsFullDialogSaveDisabled blocks invalid template names', () => {
  expect(isDialogProjectSettingsFullDialogSaveDisabled('Project', [], [])).toBe(false)
  expect(isDialogProjectSettingsFullDialogSaveDisabled('Project', [], [
    {
      ...templateRow,
      displayName: '   '
    }
  ])).toBe(true)
})

/**
 * collectDialogProjectSettingsFullSaveValidationErrors
 * Merges project, world, and template validation errors.
 */
test('Test that collectDialogProjectSettingsFullSaveValidationErrors merges all error kinds', () => {
  const errors = collectDialogProjectSettingsFullSaveValidationErrors('   ', [
    {
      color: '',
      colorPallete: '',
      displayName: '   ',
      documentCount: 0,
      templateLayout: {
        groups: [],
        placements: []
      },
      id: '550e8400-e29b-41d4-a716-446655440000'
    }
  ], [
    {
      ...templateRow,
      displayName: '   '
    }
  ])
  expect(errors.map((error) => error.kind)).toEqual([
    'projectNameRequired',
    'worldNameRequired',
    'documentTemplateNameRequired'
  ])
})
