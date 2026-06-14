import { expect, test, vi } from 'vitest'

import { createBuildDialogProjectSettingsSaveValidationTooltip } from '../dialogProjectSettingsSaveValidationTooltipWiring'
import * as dialogProjectSettingsWorldsDraft from '../functions/dialogProjectSettingsWorldsDraft'

/**
 * createBuildDialogProjectSettingsSaveValidationTooltip
 * Resolves localized duplicate palette bullets with WORLD labels.
 */
test('Test that createBuildDialogProjectSettingsSaveValidationTooltip builds duplicate palette tooltip', () => {
  const buildTooltip = createBuildDialogProjectSettingsSaveValidationTooltip({
    defaultNewWorldName: 'New world',
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
  ])

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
    defaultNewWorldName: 'New world',
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
  ])

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
    defaultNewWorldName: 'New world',
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
  ])

  expect(tooltip.bullets).toEqual([
    '- Project name is required.'
  ])
})

/**
 * createBuildDialogProjectSettingsSaveValidationTooltip
 * Falls back to the default world label when the worlds list is unavailable.
 */
test('Test that createBuildDialogProjectSettingsSaveValidationTooltip falls back when worlds list is missing', () => {
  const collectSpy = vi.spyOn(
    dialogProjectSettingsWorldsDraft,
    'collectDialogProjectSettingsSaveValidationErrors'
  ).mockReturnValue([
    {
      kind: 'worldNameRequired'
    }
  ])
  const buildTooltip = createBuildDialogProjectSettingsSaveValidationTooltip({
    defaultNewWorldName: 'New world',
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

  const tooltip = buildTooltip('Project', null)

  expect(tooltip.bullets).toEqual([
    '- World name is required for "New world".'
  ])
  collectSpy.mockRestore()
})
