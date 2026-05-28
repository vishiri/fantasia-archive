import { ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import { FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB } from '../dialogProjectSettingsConstants'
import { createDialogProjectSettingsDialogActions } from '../dialogProjectSettingsDialogActions'

const { fetchFreshMock, runFaActionAwaitMock } = vi.hoisted(() => ({
  fetchFreshMock: vi.fn(),
  runFaActionAwaitMock: vi.fn(async () => true)
}))

vi.mock('app/src/stores/scripts/sFaProjectSettingsBridge', () => ({
  faProjectSettingsFetchFreshForDialog: fetchFreshMock
}))

vi.mock('app/src/scripts/actionManager/faActionManagerRun', () => ({
  runFaActionAwait: runFaActionAwaitMock
}))

const directSnapshot: I_faProjectSettingsRoot = {
  projectName: 'Direct',
  schemaVersion: 1
}

beforeEach(() => {
  fetchFreshMock.mockReset()
  fetchFreshMock.mockResolvedValue({
    projectName: 'From Db',
    schemaVersion: 1
  })
  runFaActionAwaitMock.mockReset()
  runFaActionAwaitMock.mockResolvedValue(true)
})

/**
 * createDialogProjectSettingsDialogActions
 * openDialog uses directSettingsSnapshot without calling the bridge fetch helper.
 */
test('Test that openDialog hydrates from directSettingsSnapshot when provided', () => {
  const dialogModel = ref(false)
  const documentName = ref('')
  const localSettings = ref<I_faProjectSettingsRoot | null>(null)
  const selectedCategoryTab = ref('other')

  const { openDialog } = createDialogProjectSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    props: { directSettingsSnapshot: directSnapshot },
    selectedCategoryTab
  })

  openDialog('ProjectSettings')

  expect(dialogModel.value).toBe(true)
  expect(documentName.value).toBe('ProjectSettings')
  expect(selectedCategoryTab.value).toBe(FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB)
  expect(localSettings.value).toEqual(directSnapshot)
  expect(fetchFreshMock).not.toHaveBeenCalled()
})

/**
 * createDialogProjectSettingsDialogActions
 * openDialog fetches fresh settings from SQLite when no direct snapshot is passed.
 */
test('Test that openDialog fetches fresh settings from the bridge when needed', async () => {
  const dialogModel = ref(false)
  const documentName = ref('')
  const localSettings = ref<I_faProjectSettingsRoot | null>(null)
  const selectedCategoryTab = ref('other')

  const { openDialog } = createDialogProjectSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    props: {},
    selectedCategoryTab
  })

  openDialog('ProjectSettings')
  await Promise.resolve()

  expect(fetchFreshMock).toHaveBeenCalledOnce()
  expect(localSettings.value).toEqual({
    projectName: 'From Db',
    schemaVersion: 1
  })
})

/**
 * createDialogProjectSettingsDialogActions
 * saveAndCloseDialog dispatches saveProjectSettings with trimmed project name.
 */
test('Test that saveAndCloseDialog dispatches saveProjectSettings with trimmed name', async () => {
  const dialogModel = ref(true)
  const documentName = ref('ProjectSettings')
  const localSettings = ref<I_faProjectSettingsRoot | null>({
    projectName: '  Trimmed  ',
    schemaVersion: 1
  })
  const selectedCategoryTab = ref(FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB)

  const { saveAndCloseDialog } = createDialogProjectSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    props: {},
    selectedCategoryTab
  })

  await saveAndCloseDialog()

  expect(runFaActionAwaitMock).toHaveBeenCalledWith('saveProjectSettings', {
    settings: {
      projectName: 'Trimmed'
    }
  })
  expect(dialogModel.value).toBe(false)
})

/**
 * createDialogProjectSettingsDialogActions
 * saveAndCloseDialog skips dispatch when local settings are null or name is blank.
 */
test('Test that saveAndCloseDialog no-ops without local settings or blank name', async () => {
  const dialogModel = ref(true)
  const documentName = ref('')
  const localSettings = ref<I_faProjectSettingsRoot | null>(null)
  const selectedCategoryTab = ref(FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB)

  const { saveAndCloseDialog } = createDialogProjectSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    props: {},
    selectedCategoryTab
  })

  await saveAndCloseDialog()
  expect(runFaActionAwaitMock).not.toHaveBeenCalled()

  localSettings.value = {
    projectName: '   ',
    schemaVersion: 1
  }
  await saveAndCloseDialog()
  expect(runFaActionAwaitMock).not.toHaveBeenCalled()
  expect(dialogModel.value).toBe(true)
})
