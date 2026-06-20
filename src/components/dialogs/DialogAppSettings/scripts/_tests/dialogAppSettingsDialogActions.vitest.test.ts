import { ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import { APP_SETTINGS_OPTIONS } from 'app/src/components/dialogs/DialogAppSettings/_data/appSettingsOptions'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { updateLocalAppSettingsField } from 'app/src/components/dialogs/DialogAppSettings/scripts/functions/dialogAppSettingsUpdateLocalField'
import {
  createDialogAppSettingsDialogActions,
  syncLocalAppSettingsFromStore
} from 'app/src/components/dialogs/DialogAppSettings/scripts/dialogAppSettings_manager'
import type { T_appSettingsFaUserSettingsStoreForSync } from 'app/types/I_dialogAppSettings'
import type { T_appSettingsRenderTree } from 'app/types/I_dialogAppSettings'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

vi.mock('src/stores/S_FaUserSettings', () => ({
  S_FaUserSettings: vi.fn()
}))

const { runFaActionAwaitMock } = vi.hoisted(() => ({
  runFaActionAwaitMock: vi.fn(async () => true)
}))

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => ({
  runFaAction: vi.fn(),
  runFaActionAwait: runFaActionAwaitMock
}))

beforeEach(() => {
  vi.mocked(S_FaUserSettings).mockReset()
  runFaActionAwaitMock.mockReset()
  runFaActionAwaitMock.mockResolvedValue(true)
})

function createDialogAppSettingsDialogActionsParams (
  params: Omit<
    Parameters<typeof createDialogAppSettingsDialogActions>[0],
    'appSettingsClosedViaSave' | 'appSettingsLivePreviewSnapshot'
  >
): Parameters<typeof createDialogAppSettingsDialogActions>[0] {
  return {
    appSettingsClosedViaSave: ref(false),
    appSettingsLivePreviewSnapshot: ref(null),
    ...params
  }
}

/**
 * createDialogAppSettingsDialogActions
 * openDialog hydrates from directSettingsSnapshot without calling the user-settings store.
 */
test('openDialog builds tree from directSettingsSnapshot when provided', () => {
  vi.mocked(S_FaUserSettings).mockImplementation(() => {
    throw new Error('pinia unavailable')
  })

  const dialogModel = ref(false)
  const documentName = ref('')
  const localSettings = ref<I_faUserSettings | null>(null)
  const appSettingsTree = ref<T_appSettingsRenderTree>({})
  const searchSettingsQuery = ref<string | null>('x')

  const { openDialog } = createDialogAppSettingsDialogActions(
    createDialogAppSettingsDialogActionsParams({
      dialogModel,
      documentName,
      localSettings,
      appSettingsTree,
      props: {
        directSettingsSnapshot: { ...FA_USER_SETTINGS_DEFAULTS }
      },
      searchSettingsQuery
    })
  )

  openDialog('AppSettings')

  expect(dialogModel.value).toBe(true)
  expect(documentName.value).toBe('AppSettings')
  expect(searchSettingsQuery.value).toBe('')
  expect(localSettings.value).not.toBe(null)
  expect(Object.keys(appSettingsTree.value).length).toBeGreaterThan(0)
})

/**
 * createDialogAppSettingsDialogActions
 * saveAndCloseDialog still closes the dialog even when the local snapshot is null and no action is dispatched.
 */
test('saveAndCloseDialog closes dialog without dispatching when local settings are null', async () => {
  const dialogModel = ref(true)
  const documentName = ref('')
  const localSettings = ref<I_faUserSettings | null>(null)
  const appSettingsTree = ref<T_appSettingsRenderTree>({})
  const searchSettingsQuery = ref<string | null>(null)

  const { saveAndCloseDialog } = createDialogAppSettingsDialogActions(
    createDialogAppSettingsDialogActionsParams({
      dialogModel,
      documentName,
      localSettings,
      appSettingsTree,
      props: {},
      searchSettingsQuery
    })
  )

  await saveAndCloseDialog()

  expect(dialogModel.value).toBe(false)
  expect(runFaActionAwaitMock).not.toHaveBeenCalled()
})

/**
 * createDialogAppSettingsDialogActions
 * saveAndCloseDialog dispatches the saveAppSettings action with the local snapshot then closes the dialog.
 */
test('saveAndCloseDialog dispatches saveAppSettings action when local snapshot exists', async () => {
  const dialogModel = ref(true)
  const documentName = ref('')
  const localSettings = ref<I_faUserSettings | null>({
    ...FA_USER_SETTINGS_DEFAULTS,
    darkMode: true
  })
  const appSettingsTree = ref<T_appSettingsRenderTree>({})
  const searchSettingsQuery = ref<string | null>(null)

  const { saveAndCloseDialog } = createDialogAppSettingsDialogActions(
    createDialogAppSettingsDialogActionsParams({
      dialogModel,
      documentName,
      localSettings,
      appSettingsTree,
      props: {},
      searchSettingsQuery
    })
  )

  await saveAndCloseDialog()

  expect(runFaActionAwaitMock).toHaveBeenCalledTimes(1)
  expect(runFaActionAwaitMock).toHaveBeenCalledWith(
    'saveAppSettings',
    expect.objectContaining({
      settings: expect.objectContaining({ darkMode: true })
    })
  )
  expect(dialogModel.value).toBe(false)
})

/**
 * createDialogAppSettingsDialogActions
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
  const appSettingsTree = ref<T_appSettingsRenderTree>({
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
          title: 'Developer Settings'
        }
      },
      title: 'Developer'
    }
  })
  const searchSettingsQuery = ref<string | null>(null)

  const { updateLocalSetting } = createDialogAppSettingsDialogActions(
    createDialogAppSettingsDialogActionsParams({
      dialogModel,
      documentName,
      localSettings,
      appSettingsTree,
      props: {},
      searchSettingsQuery
    })
  )

  updateLocalSetting('showDocumentID', true)

  expect(localSettings.value?.showDocumentID).toBe(true)
  expect(
    appSettingsTree.value.developerSettings?.subCategories.documentBody?.settingsList
      .showDocumentID?.value
  ).toBe(true)
})

/**
 * createDialogAppSettingsDialogActions updateLocalSetting
 * No-ops when the local settings ref is still null.
 */
test('updateLocalSetting returns early when localSettings is null', () => {
  const localSettings = ref<I_faUserSettings | null>(null)
  const appSettingsTree = ref<T_appSettingsRenderTree>({})
  const actions = createDialogAppSettingsDialogActions(
    createDialogAppSettingsDialogActionsParams({
      dialogModel: ref(false),
      documentName: ref(''),
      localSettings,
      appSettingsTree,
      props: {},
      searchSettingsQuery: ref('')
    })
  )

  actions.updateLocalSetting('showDocumentID', true)

  expect(localSettings.value).toBe(null)
})

/**
 * createDialogAppSettingsDialogActions
 * updateLocalSetting mirrors boolean toggles into S_FaUserSettings for live preview on open surfaces.
 */
test('updateLocalSetting patches hideTooltipsProject on the user settings store', () => {
  const store: T_appSettingsFaUserSettingsStoreForSync = {
    settings: {
      ...FA_USER_SETTINGS_DEFAULTS,
      hideTooltipsProject: false
    },
    refreshSettings: vi.fn()
  }
  vi.mocked(S_FaUserSettings).mockReturnValue(
    store as unknown as ReturnType<typeof S_FaUserSettings>
  )

  const localSettings = ref<I_faUserSettings | null>({
    ...FA_USER_SETTINGS_DEFAULTS
  })
  const appSettingsTree = ref<T_appSettingsRenderTree>({})

  const { updateLocalSetting } = createDialogAppSettingsDialogActions(
    createDialogAppSettingsDialogActionsParams({
      dialogModel: ref(true),
      documentName: ref(''),
      localSettings,
      appSettingsTree,
      props: {},
      searchSettingsQuery: ref(null)
    })
  )

  updateLocalSetting('hideTooltipsProject', true)

  expect(store.settings?.hideTooltipsProject).toBe(true)
  expect(localSettings.value?.hideTooltipsProject).toBe(true)
})

/**
 * createDialogAppSettingsDialogActions
 * updateLocalSetting skips live preview when directSettingsSnapshot is provided.
 */
test('updateLocalSetting does not patch the user settings store for directSettingsSnapshot props', () => {
  const store: T_appSettingsFaUserSettingsStoreForSync = {
    settings: {
      ...FA_USER_SETTINGS_DEFAULTS,
      hideTooltipsProject: false
    },
    refreshSettings: vi.fn()
  }
  vi.mocked(S_FaUserSettings).mockReturnValue(
    store as unknown as ReturnType<typeof S_FaUserSettings>
  )

  const localSettings = ref<I_faUserSettings | null>({
    ...FA_USER_SETTINGS_DEFAULTS
  })
  const appSettingsTree = ref<T_appSettingsRenderTree>({})

  const { updateLocalSetting } = createDialogAppSettingsDialogActions(
    createDialogAppSettingsDialogActionsParams({
      dialogModel: ref(true),
      documentName: ref(''),
      localSettings,
      appSettingsTree,
      props: {
        directSettingsSnapshot: {
          ...FA_USER_SETTINGS_DEFAULTS
        }
      },
      searchSettingsQuery: ref(null)
    })
  )

  updateLocalSetting('hideTooltipsProject', true)

  expect(store.settings?.hideTooltipsProject).toBe(false)
  expect(localSettings.value?.hideTooltipsProject).toBe(true)
})

/**
 * updateLocalAppSettingsField
 * Skips keys that are not part of the app settings dialog (such as languageCode).
 */
test('updateLocalAppSettingsField returns early when settingKey is languageCode', () => {
  const localSettings = ref<I_faUserSettings | null>({
    ...FA_USER_SETTINGS_DEFAULTS,
    languageCode: 'fr'
  })
  const appSettingsTree = ref<T_appSettingsRenderTree>({})

  updateLocalAppSettingsField(
    localSettings.value as I_faUserSettings,
    appSettingsTree.value,
    APP_SETTINGS_OPTIONS,
    'languageCode',
    false
  )

  expect(localSettings.value?.languageCode).toBe('fr')
})

/**
 * updateLocalAppSettingsField
 * Updates both the flat settings snapshot and the matching render-tree toggle for a known key.
 */
test('updateLocalAppSettingsField writes localSettings and appSettingsTree for showDocumentID', () => {
  const localSettings = ref<I_faUserSettings | null>({
    ...FA_USER_SETTINGS_DEFAULTS
  })
  const appSettingsTree = ref<T_appSettingsRenderTree>({
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
          title: 'Developer Settings'
        }
      },
      title: 'Developer'
    }
  })

  updateLocalAppSettingsField(
    localSettings.value as I_faUserSettings,
    appSettingsTree.value,
    APP_SETTINGS_OPTIONS,
    'showDocumentID',
    true
  )

  expect(localSettings.value?.showDocumentID).toBe(true)
  expect(
    appSettingsTree.value.developerSettings?.subCategories.documentBody?.settingsList
      .showDocumentID?.value
  ).toBe(true)
})

/**
 * updateLocalAppSettingsField
 * No-ops when the render tree is missing the category bucket for the setting key.
 */
test('updateLocalAppSettingsField returns early when appSettingsTree lacks the category', () => {
  const localSettings = ref<I_faUserSettings | null>({
    ...FA_USER_SETTINGS_DEFAULTS
  })
  const appSettingsTree = ref<T_appSettingsRenderTree>({})

  updateLocalAppSettingsField(
    localSettings.value as I_faUserSettings,
    appSettingsTree.value,
    APP_SETTINGS_OPTIONS,
    'showDocumentID',
    true
  )

  expect(localSettings.value?.showDocumentID).toBe(true)
  expect(Object.keys(appSettingsTree.value)).toHaveLength(0)
})

/**
 * updateLocalAppSettingsField
 * No-ops when the subcategory or setting leaf is missing from the tree.
 */
test('updateLocalAppSettingsField returns early when appSettingsTree lacks the subcategory or setting', () => {
  const localSettings = ref<I_faUserSettings | null>({
    ...FA_USER_SETTINGS_DEFAULTS
  })
  const appSettingsTree = ref<T_appSettingsRenderTree>({
    developerSettings: {
      subCategories: {},
      title: 'Developer'
    }
  })

  updateLocalAppSettingsField(
    localSettings.value as I_faUserSettings,
    appSettingsTree.value,
    APP_SETTINGS_OPTIONS,
    'showDocumentID',
    true
  )

  expect(localSettings.value?.showDocumentID).toBe(true)
  expect(
    appSettingsTree.value.developerSettings?.subCategories.documentBody
  ).toBeUndefined()
})

/**
 * syncLocalAppSettingsFromStore
 * Returns immediately when Pinia has no active instance (S_FaUserSettings throws).
 */
test('syncLocalAppSettingsFromStore returns when S_FaUserSettings cannot be resolved', async () => {
  vi.mocked(S_FaUserSettings).mockImplementation(() => {
    throw new Error('no active pinia')
  })

  const localSettings = ref<I_faUserSettings | null>(null)
  const appSettingsTree = ref<T_appSettingsRenderTree>({})

  await syncLocalAppSettingsFromStore(localSettings, appSettingsTree)

  expect(localSettings.value).toBe(null)
  expect(Object.keys(appSettingsTree.value)).toHaveLength(0)
})

/**
 * syncLocalAppSettingsFromStore
 * Calls refreshSettings when the store has not loaded settings yet, then hydrates refs.
 */
test('syncLocalAppSettingsFromStore refreshes then hydrates when store settings are null', async () => {
  const store: T_appSettingsFaUserSettingsStoreForSync = {
    settings: null,
    refreshSettings: async () => {
      store.settings = { ...FA_USER_SETTINGS_DEFAULTS }
    }
  }
  vi.mocked(S_FaUserSettings).mockReturnValue(
    store as unknown as ReturnType<typeof S_FaUserSettings>
  )

  const localSettings = ref<I_faUserSettings | null>(null)
  const appSettingsTree = ref<T_appSettingsRenderTree>({})

  await syncLocalAppSettingsFromStore(localSettings, appSettingsTree)

  expect(localSettings.value).toEqual(FA_USER_SETTINGS_DEFAULTS)
  expect(Object.keys(appSettingsTree.value).length).toBeGreaterThan(0)
})

/**
 * syncLocalAppSettingsFromStore
 * Skips refresh when the store already holds settings.
 */
test('syncLocalAppSettingsFromStore does not call refreshSettings when settings are already present', async () => {
  const refreshSettings = vi.fn()
  const store: T_appSettingsFaUserSettingsStoreForSync = {
    settings: { ...FA_USER_SETTINGS_DEFAULTS },
    refreshSettings
  }
  vi.mocked(S_FaUserSettings).mockReturnValue(
    store as unknown as ReturnType<typeof S_FaUserSettings>
  )

  const localSettings = ref<I_faUserSettings | null>(null)
  const appSettingsTree = ref<T_appSettingsRenderTree>({})

  await syncLocalAppSettingsFromStore(localSettings, appSettingsTree)

  expect(refreshSettings).not.toHaveBeenCalled()
  expect(localSettings.value).toEqual(FA_USER_SETTINGS_DEFAULTS)
})

/**
 * syncLocalAppSettingsFromStore
 * When refreshSettings runs but the store still exposes null settings, refs stay untouched.
 */
test('syncLocalAppSettingsFromStore leaves refs unchanged when settings stay null after refresh', async () => {
  const store: T_appSettingsFaUserSettingsStoreForSync = {
    settings: null,
    refreshSettings: async () => {
      /* store.settings intentionally remains null */
    }
  }
  vi.mocked(S_FaUserSettings).mockReturnValue(
    store as unknown as ReturnType<typeof S_FaUserSettings>
  )

  const localSettings = ref<I_faUserSettings | null>(null)
  const appSettingsTree = ref<T_appSettingsRenderTree>({})

  await syncLocalAppSettingsFromStore(localSettings, appSettingsTree)

  expect(localSettings.value).toBe(null)
  expect(Object.keys(appSettingsTree.value)).toHaveLength(0)
})
