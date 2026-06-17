import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import { createDialogProjectSettingsValidationComputeds } from '../createDialogProjectSettingsValidationComputedsWiring'

/**
 * createDialogProjectSettingsValidationComputeds
 * Wires tab error flags, save disabled state, and tooltip content from draft refs.
 */
test('Test that createDialogProjectSettingsValidationComputeds reflects validation helpers', () => {
  const buildTooltip = vi.fn(() => ({
    bullets: ['- Error'],
    flatText: 'Intro\n- Error',
    intro: 'Intro'
  }))
  const localSettings = ref({
    projectName: 'Realm',
    schemaVersion: 1 as const
  })
  const localWorlds = ref([
    {
      color: '',
      colorPallete: '#112233;#112233',
      displayName: '   ',
      documentCount: 0,
      templateLayout: {
        groups: [],
        placements: []
      },
      id: '550e8400-e29b-41d4-a716-446655440000'
    }
  ])
  const localDocumentTemplates = ref([
    {
      displayName: '   ',
      documentCount: 0,
      icon: '',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      worldAppendix: ''
    }
  ])

  const validation = createDialogProjectSettingsValidationComputeds({
    buildDialogProjectSettingsSaveValidationTooltipForDraft: buildTooltip,
    computed,
    hasDialogProjectSettingsDocumentTemplateNameValidationError: () => true,
    hasDialogProjectSettingsWorldColorPalleteValidationError: () => true,
    hasDialogProjectSettingsWorldNameValidationError: () => true,
    hasDialogProjectSettingsWorldTemplateLayoutValidationError: () => false,
    isDialogProjectSettingsFullDialogSaveDisabled: () => true,
    isDialogProjectSettingsProjectNameInvalid: () => false,
    localDocumentTemplates,
    localSettings,
    localWorlds
  })

  expect(validation.hasGeneralSettingsValidationError.value).toBe(false)
  expect(validation.hasWorldsSettingsValidationError.value).toBe(true)
  expect(validation.hasDocumentTemplatesSettingsValidationError.value).toBe(true)
  expect(validation.isSaveDisabled.value).toBe(true)
  expect(validation.saveValidationErrorsTooltip.value.intro).toBe('Intro')
  expect(buildTooltip).toHaveBeenCalledWith('Realm', localWorlds.value, localDocumentTemplates.value)
})
