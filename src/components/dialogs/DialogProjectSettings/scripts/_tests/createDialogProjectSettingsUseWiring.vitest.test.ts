/** @vitest-environment jsdom */
import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import { createDialogProjectSettingsUseHook } from '../createDialogProjectSettingsUseWiring'

/**
 * createDialogProjectSettingsUseHook
 * Exposes validation computeds that tolerate null local drafts before hydration.
 */
test('Test that useDialogProjectSettings validation computeds tolerate null drafts', () => {
  const useDialogProjectSettings = createDialogProjectSettingsUseHook({
    buildDialogProjectSettingsSaveValidationTooltipForDraft: () => ({
      bullets: [],
      flatText: '',
      intro: ''
    }),
    computed,
    createDialogProjectSettingsDialogActions: () => ({
      addDocumentTemplate: vi.fn(),
      addWorld: vi.fn(),
      openDialog: vi.fn(),
      removeDocumentTemplate: vi.fn(),
      removeWorld: vi.fn(),
      saveAndCloseDialog: vi.fn(async () => undefined),
      updateDocumentTemplateDisplayName: vi.fn(),
      updateDocumentTemplateIcon: vi.fn(),
      updateDocumentTemplateWorldAppendix: vi.fn(),
      updateWorldColor: vi.fn(),
      updateWorldColorPallete: vi.fn(),
      updateWorldDisplayName: vi.fn(),
      updateWorldTemplateLayout: vi.fn()
    }),
    createDialogProjectSettingsRefs: () => ({
      dialogModel: ref(false),
      documentName: ref(''),
      localDocumentTemplates: ref(null),
      localSettings: ref(null),
      localWorlds: ref(null),
      selectedCategoryTab: ref('generalSettings')
    }),
    hasDialogProjectSettingsDocumentTemplateNameValidationError: () => true,
    hasDialogProjectSettingsWorldColorPalleteValidationError: () => false,
    hasDialogProjectSettingsWorldNameValidationError: () => false,
    hasDialogProjectSettingsWorldTemplateLayoutValidationError: () => false,
    isDialogProjectSettingsFullDialogSaveDisabled: () => true,
    isDialogProjectSettingsProjectNameInvalid: (name) => name.trim().length === 0,
    registerComponentDialogStackGuard: vi.fn(),
    registerDialogProjectSettingsWatchers: vi.fn()
  })

  const props: I_dialogProjectSettingsProps = {}
  const api = useDialogProjectSettings(props)

  expect(api.hasGeneralSettingsValidationError.value).toBe(true)
  expect(api.hasWorldsSettingsValidationError.value).toBe(false)
  expect(api.hasDocumentTemplatesSettingsValidationError.value).toBe(true)
  expect(api.isSaveDisabled.value).toBe(true)
  expect(api.saveValidationErrorsTooltip.value.flatText).toBe('')
})
