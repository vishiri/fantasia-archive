import { createPinia, setActivePinia } from 'pinia'
import { expect, test } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { useDialogAppSettings } from 'app/src/components/dialogs/DialogAppSettings/scripts/dialogAppSettings_manager'

/**
 * useDialogAppSettings
 * Exposes the expected reactive handles for the app settings dialog shell.
 */
test('useDialogAppSettings returns dialog state and search computeds', () => {
  setActivePinia(createPinia())

  const api = useDialogAppSettings({
    directSettingsSnapshot: { ...FA_USER_SETTINGS_DEFAULTS }
  })

  expect(api.dialogModel.value).toBe(false)
  expect(api.documentName.value).toBe('')
  expect(api.localSettings.value).toBe(null)
  expect(api.appSettingsTree.value).toEqual({})
  expect(api.searchSettingsQuery.value).toBe('')
  expect(api.selectedCategoryTab.value).toBe('')
  expect(api.hasActiveSearchQuery.value).toBe(false)
  expect(api.searchFilteredAppSettingsTree.value).toEqual({})
  expect(typeof api.saveAndCloseDialog).toBe('function')
  expect(typeof api.updateLocalSetting).toBe('function')
})
