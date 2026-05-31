import { ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import type { T_appSettingsFaUserSettingsStoreForSync } from 'app/types/I_dialogAppSettings'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

import { captureAppSettingsLivePreviewSnapshotIfNeeded } from '../dialogAppSettings_manager'

vi.mock('src/stores/S_FaUserSettings', () => ({
  S_FaUserSettings: vi.fn()
}))

beforeEach(() => {
  vi.mocked(S_FaUserSettings).mockReset()
})
import {
  applyAppSettingsLivePreviewPatch,
  cloneFaUserSettingsSnapshot,
  restoreAppSettingsLivePreviewSnapshot
} from '../functions/dialogAppSettingsLivePreview'

/**
 * captureAppSettingsLivePreviewSnapshotIfNeeded
 * Storybook and harness props skip capturing a revert snapshot.
 */
test('captureAppSettingsLivePreviewSnapshotIfNeeded clears snapshot for directSettingsSnapshot props', () => {
  const appSettingsLivePreviewSnapshot = ref<I_faUserSettings | null>({
    ...FA_USER_SETTINGS_DEFAULTS
  })

  captureAppSettingsLivePreviewSnapshotIfNeeded(
    {
      directSettingsSnapshot: {
        ...FA_USER_SETTINGS_DEFAULTS
      }
    },
    appSettingsLivePreviewSnapshot
  )

  expect(appSettingsLivePreviewSnapshot.value).toBeNull()
})

/**
 * captureAppSettingsLivePreviewSnapshotIfNeeded
 * Skips cloning when the user settings store has not hydrated settings yet.
 */
test('captureAppSettingsLivePreviewSnapshotIfNeeded leaves snapshot null when store settings are null', () => {
  const store: T_appSettingsFaUserSettingsStoreForSync = {
    settings: null,
    refreshSettings: async () => undefined
  }
  vi.mocked(S_FaUserSettings).mockReturnValue(
    store as unknown as ReturnType<typeof S_FaUserSettings>
  )

  const appSettingsLivePreviewSnapshot = ref<I_faUserSettings | null>(null)

  captureAppSettingsLivePreviewSnapshotIfNeeded({}, appSettingsLivePreviewSnapshot)

  expect(appSettingsLivePreviewSnapshot.value).toBeNull()
})

/**
 * captureAppSettingsLivePreviewSnapshotIfNeeded
 * Clones persisted settings when the store is hydrated.
 */
test('captureAppSettingsLivePreviewSnapshotIfNeeded clones store settings when hydrated', () => {
  const store: T_appSettingsFaUserSettingsStoreForSync = {
    settings: {
      ...FA_USER_SETTINGS_DEFAULTS,
      hideTooltipsProject: false
    },
    refreshSettings: async () => undefined
  }
  vi.mocked(S_FaUserSettings).mockReturnValue(
    store as unknown as ReturnType<typeof S_FaUserSettings>
  )

  const appSettingsLivePreviewSnapshot = ref<I_faUserSettings | null>(null)

  captureAppSettingsLivePreviewSnapshotIfNeeded({}, appSettingsLivePreviewSnapshot)

  expect(appSettingsLivePreviewSnapshot.value?.hideTooltipsProject).toBe(false)
})

/**
 * cloneFaUserSettingsSnapshot
 * Returns a shallow copy suitable for reverting draft App Settings toggles.
 */
test('cloneFaUserSettingsSnapshot copies boolean fields from the source snapshot', () => {
  const source = {
    ...FA_USER_SETTINGS_DEFAULTS,
    hideTooltipsProject: true
  }

  const cloned = cloneFaUserSettingsSnapshot(source)

  expect(cloned.hideTooltipsProject).toBe(true)
  expect(cloned).not.toBe(source)
})

/**
 * applyAppSettingsLivePreviewPatch
 * Writes one boolean field onto the Pinia settings object exposed by the store.
 */
test('applyAppSettingsLivePreviewPatch updates hideTooltipsProject on the store', () => {
  const store: T_appSettingsFaUserSettingsStoreForSync = {
    settings: {
      ...FA_USER_SETTINGS_DEFAULTS,
      hideTooltipsProject: false
    },
    refreshSettings: async () => undefined
  }

  applyAppSettingsLivePreviewPatch(store, 'hideTooltipsProject', true)

  expect(store.settings?.hideTooltipsProject).toBe(true)
})

/**
 * applyAppSettingsLivePreviewPatch
 * No-ops when the store has not hydrated settings yet.
 */
test('applyAppSettingsLivePreviewPatch returns early when store.settings is null', () => {
  const store: T_appSettingsFaUserSettingsStoreForSync = {
    settings: null,
    refreshSettings: async () => undefined
  }

  applyAppSettingsLivePreviewPatch(store, 'hideTooltipsProject', true)

  expect(store.settings).toBeNull()
})

/**
 * restoreAppSettingsLivePreviewSnapshot
 * Replaces the live store settings with a captured open-dialog snapshot.
 */
test('restoreAppSettingsLivePreviewSnapshot reverts hideTooltipsProject', () => {
  const store: T_appSettingsFaUserSettingsStoreForSync = {
    settings: {
      ...FA_USER_SETTINGS_DEFAULTS,
      hideTooltipsProject: true
    },
    refreshSettings: async () => undefined
  }
  const snapshot = cloneFaUserSettingsSnapshot({
    ...FA_USER_SETTINGS_DEFAULTS,
    hideTooltipsProject: false
  })

  restoreAppSettingsLivePreviewSnapshot(store, snapshot)

  expect(store.settings?.hideTooltipsProject).toBe(false)
})
