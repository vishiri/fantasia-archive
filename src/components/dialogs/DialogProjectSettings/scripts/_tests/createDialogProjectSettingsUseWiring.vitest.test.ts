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
      addWorld: vi.fn(),
      openDialog: vi.fn(),
      removeWorld: vi.fn(),
      saveAndCloseDialog: vi.fn(async () => undefined),
      updateWorldColor: vi.fn(),
      updateWorldColorPallete: vi.fn(),
      updateWorldDisplayName: vi.fn()
    }),
    createDialogProjectSettingsRefs: () => ({
      dialogModel: ref(false),
      documentName: ref(''),
      localSettings: ref(null),
      localWorlds: ref(null),
      selectedCategoryTab: ref('generalSettings')
    }),
    hasDialogProjectSettingsWorldColorPalleteValidationError: () => false,
    hasDialogProjectSettingsWorldNameValidationError: () => false,
    isDialogProjectSettingsDialogSaveDisabled: () => true,
    isDialogProjectSettingsProjectNameInvalid: (name) => name.trim().length === 0,
    registerComponentDialogStackGuard: vi.fn(),
    registerDialogProjectSettingsWatchers: vi.fn()
  })

  const props: I_dialogProjectSettingsProps = {}
  const api = useDialogProjectSettings(props)

  expect(api.hasGeneralSettingsValidationError.value).toBe(true)
  expect(api.hasWorldsSettingsValidationError.value).toBe(false)
  expect(api.isSaveDisabled.value).toBe(true)
  expect(api.saveValidationErrorsTooltip.value.flatText).toBe('')
})
