import { ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import type { T_programSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import {
  syncLocalProgramSettingsFromStore,
  updateLocalProgramSetting,
  type T_programSettingsFaUserSettingsStoreForSync
} from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsLocalSettingsManagement'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

vi.mock('src/stores/S_FaUserSettings', () => ({
  S_FaUserSettings: vi.fn()
}))

beforeEach(() => {
  vi.mocked(S_FaUserSettings).mockReset()
})

/**
 * updateLocalProgramSetting
 * No-ops when the local settings ref is still null.
 */
test('updateLocalProgramSetting returns early when localSettings is null', () => {
  const localSettings = ref<I_faUserSettings | null>(null)
  const programSettingsTree = ref<T_programSettingsRenderTree>({})

  updateLocalProgramSetting(localSettings, programSettingsTree, 'showDocumentID', true)

  expect(localSettings.value).toBe(null)
})

/**
 * updateLocalProgramSetting
 * Skips keys that are not part of the program settings dialog (such as languageCode).
 */
test('updateLocalProgramSetting returns early when settingKey is languageCode', () => {
  const localSettings = ref<I_faUserSettings | null>({
    ...FA_USER_SETTINGS_DEFAULTS,
    languageCode: 'fr'
  })
  const programSettingsTree = ref<T_programSettingsRenderTree>({})

  updateLocalProgramSetting(localSettings, programSettingsTree, 'languageCode', false)

  expect(localSettings.value?.languageCode).toBe('fr')
})

/**
 * updateLocalProgramSetting
 * Updates both the flat settings snapshot and the matching render-tree toggle for a known key.
 */
test('updateLocalProgramSetting writes localSettings and programSettingsTree for showDocumentID', () => {
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

  updateLocalProgramSetting(localSettings, programSettingsTree, 'showDocumentID', true)

  expect(localSettings.value?.showDocumentID).toBe(true)
  expect(
    programSettingsTree.value.developerSettings?.subCategories.documentBody?.settingsList
      .showDocumentID?.value
  ).toBe(true)
})

/**
 * updateLocalProgramSetting
 * No-ops when the render tree is missing the category bucket for the setting key.
 */
test('updateLocalProgramSetting returns early when programSettingsTree lacks the category', () => {
  const localSettings = ref<I_faUserSettings | null>({
    ...FA_USER_SETTINGS_DEFAULTS
  })
  const programSettingsTree = ref<T_programSettingsRenderTree>({})

  updateLocalProgramSetting(localSettings, programSettingsTree, 'showDocumentID', true)

  expect(localSettings.value?.showDocumentID).toBe(true)
  expect(Object.keys(programSettingsTree.value)).toHaveLength(0)
})

/**
 * updateLocalProgramSetting
 * No-ops when the subcategory or setting leaf is missing from the tree.
 */
test('updateLocalProgramSetting returns early when programSettingsTree lacks the subcategory or setting', () => {
  const localSettings = ref<I_faUserSettings | null>({
    ...FA_USER_SETTINGS_DEFAULTS
  })
  const programSettingsTree = ref<T_programSettingsRenderTree>({
    developerSettings: {
      subCategories: {},
      title: 'Developer'
    }
  })

  updateLocalProgramSetting(localSettings, programSettingsTree, 'showDocumentID', true)

  expect(localSettings.value?.showDocumentID).toBe(true)
  expect(
    programSettingsTree.value.developerSettings?.subCategories.documentBody
  ).toBeUndefined()
})

/**
 * syncLocalProgramSettingsFromStore
 * Returns immediately when Pinia has no active instance (S_FaUserSettings throws).
 */
test('syncLocalProgramSettingsFromStore returns when S_FaUserSettings cannot be resolved', async () => {
  vi.mocked(S_FaUserSettings).mockImplementation(() => {
    throw new Error('no active pinia')
  })

  const localSettings = ref<I_faUserSettings | null>(null)
  const programSettingsTree = ref<T_programSettingsRenderTree>({})

  await syncLocalProgramSettingsFromStore(localSettings, programSettingsTree)

  expect(localSettings.value).toBe(null)
  expect(Object.keys(programSettingsTree.value)).toHaveLength(0)
})

/**
 * syncLocalProgramSettingsFromStore
 * Calls refreshSettings when the store has not loaded settings yet, then hydrates refs.
 */
test('syncLocalProgramSettingsFromStore refreshes then hydrates when store settings are null', async () => {
  const store: T_programSettingsFaUserSettingsStoreForSync = {
    settings: null,
    refreshSettings: async () => {
      store.settings = { ...FA_USER_SETTINGS_DEFAULTS }
    }
  }
  vi.mocked(S_FaUserSettings).mockReturnValue(
    store as unknown as ReturnType<typeof S_FaUserSettings>
  )

  const localSettings = ref<I_faUserSettings | null>(null)
  const programSettingsTree = ref<T_programSettingsRenderTree>({})

  await syncLocalProgramSettingsFromStore(localSettings, programSettingsTree)

  expect(localSettings.value).toEqual(FA_USER_SETTINGS_DEFAULTS)
  expect(Object.keys(programSettingsTree.value).length).toBeGreaterThan(0)
})

/**
 * syncLocalProgramSettingsFromStore
 * Skips refresh when the store already holds settings.
 */
test('syncLocalProgramSettingsFromStore does not call refreshSettings when settings are already present', async () => {
  const refreshSettings = vi.fn()
  const store: T_programSettingsFaUserSettingsStoreForSync = {
    settings: { ...FA_USER_SETTINGS_DEFAULTS },
    refreshSettings
  }
  vi.mocked(S_FaUserSettings).mockReturnValue(
    store as unknown as ReturnType<typeof S_FaUserSettings>
  )

  const localSettings = ref<I_faUserSettings | null>(null)
  const programSettingsTree = ref<T_programSettingsRenderTree>({})

  await syncLocalProgramSettingsFromStore(localSettings, programSettingsTree)

  expect(refreshSettings).not.toHaveBeenCalled()
  expect(localSettings.value).toEqual(FA_USER_SETTINGS_DEFAULTS)
})

/**
 * syncLocalProgramSettingsFromStore
 * When refreshSettings runs but the store still exposes null settings, refs stay untouched.
 */
test('syncLocalProgramSettingsFromStore leaves refs unchanged when settings stay null after refresh', async () => {
  const store: T_programSettingsFaUserSettingsStoreForSync = {
    settings: null,
    refreshSettings: async () => {
      /* store.settings intentionally remains null */
    }
  }
  vi.mocked(S_FaUserSettings).mockReturnValue(
    store as unknown as ReturnType<typeof S_FaUserSettings>
  )

  const localSettings = ref<I_faUserSettings | null>(null)
  const programSettingsTree = ref<T_programSettingsRenderTree>({})

  await syncLocalProgramSettingsFromStore(localSettings, programSettingsTree)

  expect(localSettings.value).toBe(null)
  expect(Object.keys(programSettingsTree.value)).toHaveLength(0)
})
