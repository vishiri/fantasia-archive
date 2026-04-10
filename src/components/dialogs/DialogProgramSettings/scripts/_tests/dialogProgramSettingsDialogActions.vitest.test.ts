import { ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { createDialogProgramSettingsDialogActions } from 'app/src/components/dialogs/DialogProgramSettings/scripts/dialogProgramSettingsDialogActions'
import type { T_programSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

vi.mock('src/stores/S_FaUserSettings', () => ({
  S_FaUserSettings: vi.fn()
}))

beforeEach(() => {
  vi.mocked(S_FaUserSettings).mockReset()
})

/**
 * createDialogProgramSettingsDialogActions
 * openDialog hydrates from directSettingsSnapshot without calling the user-settings store.
 */
test('openDialog builds tree from directSettingsSnapshot when provided', () => {
  vi.mocked(S_FaUserSettings).mockImplementation(() => {
    throw new Error('pinia unavailable')
  })

  const dialogModel = ref(false)
  const documentName = ref('')
  const localSettings = ref<I_faUserSettings | null>(null)
  const programSettingsTree = ref<T_programSettingsRenderTree>({})
  const searchSettingsQuery = ref<string | null>('x')

  const { openDialog } = createDialogProgramSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    programSettingsTree,
    props: {
      directSettingsSnapshot: { ...FA_USER_SETTINGS_DEFAULTS }
    },
    searchSettingsQuery
  })

  openDialog('ProgramSettings')

  expect(dialogModel.value).toBe(true)
  expect(documentName.value).toBe('ProgramSettings')
  expect(searchSettingsQuery.value).toBe('')
  expect(localSettings.value).not.toBe(null)
  expect(Object.keys(programSettingsTree.value).length).toBeGreaterThan(0)
})

/**
 * createDialogProgramSettingsDialogActions
 * saveAndCloseDialog skips store update when Pinia store cannot be resolved.
 */
test('saveAndCloseDialog closes dialog when fa user settings store is unavailable', async () => {
  vi.mocked(S_FaUserSettings).mockImplementation(() => {
    throw new Error('pinia unavailable')
  })

  const dialogModel = ref(true)
  const documentName = ref('')
  const localSettings = ref<I_faUserSettings | null>({ ...FA_USER_SETTINGS_DEFAULTS })
  const programSettingsTree = ref<T_programSettingsRenderTree>({})
  const searchSettingsQuery = ref<string | null>(null)

  const { saveAndCloseDialog } = createDialogProgramSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    programSettingsTree,
    props: {},
    searchSettingsQuery
  })

  await saveAndCloseDialog()

  expect(dialogModel.value).toBe(false)
})

/**
 * createDialogProgramSettingsDialogActions
 * saveAndCloseDialog persists via the fa user settings store when both store and snapshot exist.
 */
test('saveAndCloseDialog calls updateSettings when store and local snapshot exist', async () => {
  const updateSettings = vi.fn(async () => undefined)
  vi.mocked(S_FaUserSettings).mockReturnValue({
    updateSettings
  } as unknown as ReturnType<typeof S_FaUserSettings>)

  const dialogModel = ref(true)
  const documentName = ref('')
  const localSettings = ref<I_faUserSettings | null>({
    ...FA_USER_SETTINGS_DEFAULTS,
    darkMode: true
  })
  const programSettingsTree = ref<T_programSettingsRenderTree>({})
  const searchSettingsQuery = ref<string | null>(null)

  const { saveAndCloseDialog } = createDialogProgramSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    programSettingsTree,
    props: {},
    searchSettingsQuery
  })

  await saveAndCloseDialog()

  expect(updateSettings).toHaveBeenCalledTimes(1)
  expect(updateSettings).toHaveBeenCalledWith(
    expect.objectContaining({
      darkMode: true
    })
  )
  expect(dialogModel.value).toBe(false)
})

/**
 * createDialogProgramSettingsDialogActions
 * updateLocalSetting forwards to the shared render-tree updater when a snapshot exists.
 */
test('updateLocalSetting updates a toggle leaf when the tree contains the key', () => {
  vi.mocked(S_FaUserSettings).mockImplementation(() => {
    throw new Error('pinia unavailable')
  })

  const dialogModel = ref(false)
  const documentName = ref('')
  const localSettings = ref<I_faUserSettings | null>({
    ...FA_USER_SETTINGS_DEFAULTS
  })
  const programSettingsTree = ref<T_programSettingsRenderTree>({
    developerSettings: {
      subCategories: {
        documentBody: {
          settingsList: {
            showDocumentID: {
              description: '',
              tags: '',
              title: 'Show document ID',
              value: false
            }
          },
          title: 'Document body'
        }
      },
      title: 'Developer'
    }
  })
  const searchSettingsQuery = ref<string | null>(null)

  const { updateLocalSetting } = createDialogProgramSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    programSettingsTree,
    props: {},
    searchSettingsQuery
  })

  updateLocalSetting('showDocumentID', true)

  expect(localSettings.value?.showDocumentID).toBe(true)
  expect(
    programSettingsTree.value.developerSettings?.subCategories.documentBody?.settingsList
      .showDocumentID?.value
  ).toBe(true)
})
