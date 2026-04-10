import { createPinia, setActivePinia } from 'pinia'
import { expect, test } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { useDialogProgramSettings } from 'app/src/components/dialogs/DialogProgramSettings/scripts/useDialogProgramSettings'

/**
 * useDialogProgramSettings
 * Exposes the expected reactive handles for the program settings dialog shell.
 */
test('useDialogProgramSettings returns dialog state and search computeds', () => {
  setActivePinia(createPinia())

  const api = useDialogProgramSettings({
    directSettingsSnapshot: { ...FA_USER_SETTINGS_DEFAULTS }
  })

  expect(api.dialogModel.value).toBe(false)
  expect(api.programSettingsTree.value).toEqual({})
  expect(api.hasActiveSearchQuery.value).toBe(false)
  expect(api.searchFilteredProgramSettingsTree.value).toEqual({})
  expect(typeof api.saveAndCloseDialog).toBe('function')
  expect(typeof api.updateLocalSetting).toBe('function')
})
