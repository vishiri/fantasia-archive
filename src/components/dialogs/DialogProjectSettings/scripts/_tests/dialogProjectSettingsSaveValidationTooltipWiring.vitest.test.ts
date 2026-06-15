import { expect, test, vi } from 'vitest'

import { createBuildDialogProjectSettingsSaveValidationTooltip } from '../dialogProjectSettingsSaveValidationTooltipWiring'
import * as dialogProjectSettingsDialogSaveValidation from '../dialogProjectSettingsDialogSaveValidation'

const defaultTemplateName = 'New document template'
const defaultWorldName = 'New world'

/**
 * createBuildDialogProjectSettingsSaveValidationTooltip
 * Resolves localized duplicate palette bullets with WORLD labels.
 */
test('Test that createBuildDialogProjectSettingsSaveValidationTooltip builds duplicate palette tooltip', () => {
  const buildTooltip = createBuildDialogProjectSettingsSaveValidationTooltip({
    defaultNewTemplateName: defaultTemplateName,
    defaultNewWorldName: defaultWorldName,
    translate: (key, params) => {
      if (key === 'dialogs.projectSettings.saveErrors.tooltipIntro') {
        return 'Unable to save, following errors found:'
      }
      if (key === 'dialogs.projectSettings.saveErrors.bulletDuplicatePalette') {
        return `Duplicate colors found in palette of "${params?.worldLabel ?? ''}".`
      }
      return key
    }
  })

  const tooltip = buildTooltip('Project', [
    {
      color: '',
      colorPallete: '#112233;#112233',
      displayName: 'Realm Alpha',
      documentCount: 0,
      id: '550e8400-e29b-41d4-a716-446655440000'
    }
  ], [])

  expect(tooltip.intro).toBe('Unable to save, following errors found:')
  expect(tooltip.bullets).toEqual([
    '- Duplicate colors found in palette of "Realm Alpha".'
  ])
  expect(tooltip.flatText).toBe(
    'Unable to save, following errors found:\n' +
    '- Duplicate colors found in palette of "Realm Alpha".'
  )
})

/**
 * createBuildDialogProjectSettingsSaveValidationTooltip
 * Resolves localized world name bullets with WORLD labels.
 */
test('Test that createBuildDialogProjectSettingsSaveValidationTooltip builds world name tooltip', () => {
  const buildTooltip = createBuildDialogProjectSettingsSaveValidationTooltip({
    defaultNewTemplateName: defaultTemplateName,
    defaultNewWorldName: defaultWorldName,
    translate: (key, params) => {
      if (key === 'dialogs.projectSettings.saveErrors.tooltipIntro') {
        return 'Unable to save, following errors found:'
      }
      if (key === 'dialogs.projectSettings.saveErrors.bulletWorldNameRequired') {
        return `World name is required for "${params?.worldLabel ?? ''}".`
      }
      return key
    }
  })

  const tooltip = buildTooltip('Project', [
    {
      color: '',
      colorPallete: '',
      displayName: '   ',
      documentCount: 0,
      id: '550e8400-e29b-41d4-a716-446655440000'
    }
  ], [])

  expect(tooltip.bullets).toEqual([
    '- World name is required for "New world".'
  ])
})

/**
 * createBuildDialogProjectSettingsSaveValidationTooltip
 * Resolves project name required copy without a world label.
 */
test('Test that createBuildDialogProjectSettingsSaveValidationTooltip builds project name tooltip', () => {
  const buildTooltip = createBuildDialogProjectSettingsSaveValidationTooltip({
    defaultNewTemplateName: defaultTemplateName,
    defaultNewWorldName: defaultWorldName,
    translate: (key) => {
      if (key === 'dialogs.projectSettings.saveErrors.tooltipIntro') {
        return 'Unable to save, following errors found:'
      }
      if (key === 'dialogs.projectSettings.fields.projectName.errorRequired') {
        return 'Project name is required.'
      }
      return key
    }
  })

  const tooltip = buildTooltip('   ', [
    {
      color: '',
      colorPallete: '',
      displayName: 'Realm',
      documentCount: 0,
      id: '550e8400-e29b-41d4-a716-446655440000'
    }
  ], [])

  expect(tooltip.bullets).toEqual([
    '- Project name is required.'
  ])
})

/**
 * createBuildDialogProjectSettingsSaveValidationTooltip
 * Resolves document template name bullets with template labels.
 */
test('Test that createBuildDialogProjectSettingsSaveValidationTooltip builds document template name tooltip', () => {
  const buildTooltip = createBuildDialogProjectSettingsSaveValidationTooltip({
    defaultNewTemplateName: defaultTemplateName,
    defaultNewWorldName: defaultWorldName,
    translate: (key, params) => {
      if (key === 'dialogs.projectSettings.saveErrors.tooltipIntro') {
        return 'Unable to save, following errors found:'
      }
      if (key === 'dialogs.projectSettings.saveErrors.bulletDocumentTemplateNameRequired') {
        return `Document template name is required for "${params?.templateLabel ?? ''}".`
      }
      return key
    }
  })

  const tooltip = buildTooltip('Project', [], [
    {
      displayName: '   ',
      documentCount: 0,
      icon: '',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      worldAppendix: ''
    }
  ])

  expect(tooltip.bullets).toEqual([
    '- Document template name is required for "New document template".'
  ])
})

/**
 * createBuildDialogProjectSettingsSaveValidationTooltip
 * Falls back to the default world label when the worlds list is unavailable.
 */
test('Test that createBuildDialogProjectSettingsSaveValidationTooltip falls back when worlds list is missing', () => {
  const collectSpy = vi.spyOn(
    dialogProjectSettingsDialogSaveValidation,
    'collectDialogProjectSettingsFullSaveValidationErrors'
  ).mockReturnValue([
    {
      kind: 'worldNameRequired'
    }
  ])
  const buildTooltip = createBuildDialogProjectSettingsSaveValidationTooltip({
    defaultNewTemplateName: defaultTemplateName,
    defaultNewWorldName: defaultWorldName,
    translate: (key, params) => {
      if (key === 'dialogs.projectSettings.saveErrors.tooltipIntro') {
        return 'Unable to save, following errors found:'
      }
      if (key === 'dialogs.projectSettings.saveErrors.bulletWorldNameRequired') {
        return `World name is required for "${params?.worldLabel ?? ''}".`
      }
      return key
    }
  })

  const tooltip = buildTooltip('Project', null, [])

  expect(tooltip.bullets).toEqual([
    '- World name is required for "New world".'
  ])
  collectSpy.mockRestore()
})

/**
 * createBuildDialogProjectSettingsSaveValidationTooltip
 * Falls back to the default template label when the templates list is unavailable.
 */
test('Test that createBuildDialogProjectSettingsSaveValidationTooltip falls back when templates list is missing', () => {
  const collectSpy = vi.spyOn(
    dialogProjectSettingsDialogSaveValidation,
    'collectDialogProjectSettingsFullSaveValidationErrors'
  ).mockReturnValue([
    {
      kind: 'documentTemplateNameRequired'
    }
  ])
  const buildTooltip = createBuildDialogProjectSettingsSaveValidationTooltip({
    defaultNewTemplateName: defaultTemplateName,
    defaultNewWorldName: defaultWorldName,
    translate: (key, params) => {
      if (key === 'dialogs.projectSettings.saveErrors.tooltipIntro') {
        return 'Unable to save, following errors found:'
      }
      if (key === 'dialogs.projectSettings.saveErrors.bulletDocumentTemplateNameRequired') {
        return `Document template name is required for "${params?.templateLabel ?? ''}".`
      }
      return key
    }
  })

  const tooltip = buildTooltip('Project', [], null)

  expect(tooltip.bullets).toEqual([
    '- Document template name is required for "New document template".'
  ])
  collectSpy.mockRestore()
})
