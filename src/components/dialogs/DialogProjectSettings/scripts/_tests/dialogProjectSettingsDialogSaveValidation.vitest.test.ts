import { expect, test } from 'vitest'

import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import { buildDialogProjectSettingsDocumentTemplateDraft } from '../../_tests/dialogProjectSettingsDocumentTemplateDraftFixtures'
import {
  collectDialogProjectSettingsDocumentTemplateSaveValidationErrors,
  collectDialogProjectSettingsFullSaveValidationErrors,
  isDialogProjectSettingsFullDialogSaveDisabled
} from '../dialogProjectSettingsDialogSaveValidation'

const templateRow = buildDialogProjectSettingsDocumentTemplateDraft()

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
    buildDialogProjectSettingsDocumentTemplateDraft({
      id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      titlePluralTranslations: { 'en-US': '   ' },
      titleSingularTranslations: {},
    })
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
    buildDialogProjectSettingsDocumentTemplateDraft({
      titlePluralTranslations: { 'en-US': '   ' },
      titleSingularTranslations: {},
    })
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
      displayNameTranslations: { 'en-US': '   ' },
      documentCount: 0,
      templateLayout: {
        groups: [],
        placements: []
      },
      id: '550e8400-e29b-41d4-a716-446655440000'
    }
  ], [
    buildDialogProjectSettingsDocumentTemplateDraft({
      titlePluralTranslations: { 'en-US': '   ' },
      titleSingularTranslations: {},
    })
  ])
  expect(errors.map((error) => error.kind)).toEqual([
    'projectNameRequired',
    'worldNameRequired',
    'documentTemplateNameRequired'
  ])
})
