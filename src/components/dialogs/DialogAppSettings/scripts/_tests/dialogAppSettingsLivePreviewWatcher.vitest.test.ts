import { createPinia, setActivePinia } from 'pinia'
import { nextTick, ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import type { T_appSettingsFaUserSettingsStoreForSync } from 'app/types/I_dialogAppSettings'
import type { T_appSettingsRenderTree } from 'app/types/I_dialogAppSettings'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

import {
  createDialogAppSettingsDialogActions,
  registerDialogAppSettingsLivePreviewWatcher
} from '../dialogAppSettings_manager'

vi.mock('src/stores/S_FaUserSettings', () => ({
  S_FaUserSettings: vi.fn()
}))

beforeEach(() => {
  vi.mocked(S_FaUserSettings).mockReset()
})

function wireDialogAppSettingsLivePreview (params: {
  props?: { directSettingsSnapshot?: I_faUserSettings }
}): {
    appSettingsClosedViaSave: ReturnType<typeof ref<boolean>>
    appSettingsLivePreviewSnapshot: ReturnType<typeof ref<I_faUserSettings | null>>
    dialogModel: ReturnType<typeof ref<boolean>>
    openDialog: (input: 'AppSettings') => void
  } {
  const dialogModel = ref(false)
  const documentName = ref('')
  const localSettings = ref<I_faUserSettings | null>(null)
  const appSettingsTree = ref<T_appSettingsRenderTree>({})
  const appSettingsLivePreviewSnapshot = ref<I_faUserSettings | null>(null)
  const appSettingsClosedViaSave = ref(false)
  const props = params.props ?? {}

  registerDialogAppSettingsLivePreviewWatcher({
    appSettingsClosedViaSave,
    appSettingsLivePreviewSnapshot,
    dialogModel,
    props
  })

  const { openDialog } = createDialogAppSettingsDialogActions({
    appSettingsClosedViaSave,
    appSettingsLivePreviewSnapshot,
    dialogModel,
    documentName,
    localSettings,
    appSettingsTree,
    props,
    searchSettingsQuery: ref('')
  })

  return {
    appSettingsClosedViaSave,
    appSettingsLivePreviewSnapshot,
    dialogModel,
    openDialog
  }
}

test('registerDialogAppSettingsLivePreviewWatcher restores store when closing without save', async () => {
  setActivePinia(createPinia())
  const store: T_appSettingsFaUserSettingsStoreForSync = {
    settings: {
      ...FA_USER_SETTINGS_DEFAULTS,
      hideTooltipsProject: false
    },
    refreshSettings: vi.fn(async () => undefined)
  }
  vi.mocked(S_FaUserSettings).mockReturnValue(
    store as unknown as ReturnType<typeof S_FaUserSettings>
  )

  const wired = wireDialogAppSettingsLivePreview({})
  wired.dialogModel.value = true
  wired.openDialog('AppSettings')
  await vi.waitFor(() => {
    expect(wired.appSettingsLivePreviewSnapshot.value).not.toBeNull()
  })

  if (store.settings !== null) {
    store.settings.hideTooltipsProject = true
  }

  wired.dialogModel.value = false
  await nextTick()

  expect(store.settings?.hideTooltipsProject).toBe(false)
  expect(wired.appSettingsLivePreviewSnapshot.value).toBeNull()
})

test('registerDialogAppSettingsLivePreviewWatcher skips restore when dialog closed via save', async () => {
  setActivePinia(createPinia())
  const store: T_appSettingsFaUserSettingsStoreForSync = {
    settings: {
      ...FA_USER_SETTINGS_DEFAULTS,
      hideTooltipsProject: false
    },
    refreshSettings: vi.fn(async () => undefined)
  }
  vi.mocked(S_FaUserSettings).mockReturnValue(
    store as unknown as ReturnType<typeof S_FaUserSettings>
  )

  const wired = wireDialogAppSettingsLivePreview({})
  wired.dialogModel.value = true
  wired.openDialog('AppSettings')
  await vi.waitFor(() => {
    expect(wired.appSettingsLivePreviewSnapshot.value).not.toBeNull()
  })

  if (store.settings !== null) {
    store.settings.hideTooltipsProject = true
  }

  wired.appSettingsClosedViaSave.value = true
  wired.dialogModel.value = false
  await nextTick()

  expect(store.settings?.hideTooltipsProject).toBe(true)
  expect(wired.appSettingsClosedViaSave.value).toBe(false)
})

test('registerDialogAppSettingsLivePreviewWatcher does not restore when props use directSettingsSnapshot', async () => {
  setActivePinia(createPinia())
  const store: T_appSettingsFaUserSettingsStoreForSync = {
    settings: {
      ...FA_USER_SETTINGS_DEFAULTS,
      hideTooltipsProject: false
    },
    refreshSettings: vi.fn(async () => undefined)
  }
  vi.mocked(S_FaUserSettings).mockReturnValue(
    store as unknown as ReturnType<typeof S_FaUserSettings>
  )

  const wired = wireDialogAppSettingsLivePreview({
    props: {
      directSettingsSnapshot: {
        ...FA_USER_SETTINGS_DEFAULTS
      }
    }
  })
  wired.dialogModel.value = true
  wired.openDialog('AppSettings')
  await nextTick()

  if (store.settings !== null) {
    store.settings.hideTooltipsProject = true
  }

  wired.dialogModel.value = false
  await nextTick()

  expect(store.settings?.hideTooltipsProject).toBe(true)
})

test('registerDialogAppSettingsLivePreviewWatcher skips restore on close when a stale snapshot exists with directSettingsSnapshot props', async () => {
  setActivePinia(createPinia())
  const store: T_appSettingsFaUserSettingsStoreForSync = {
    settings: {
      ...FA_USER_SETTINGS_DEFAULTS,
      hideTooltipsProject: false
    },
    refreshSettings: vi.fn(async () => undefined)
  }
  vi.mocked(S_FaUserSettings).mockReturnValue(
    store as unknown as ReturnType<typeof S_FaUserSettings>
  )

  const wired = wireDialogAppSettingsLivePreview({
    props: {
      directSettingsSnapshot: {
        ...FA_USER_SETTINGS_DEFAULTS
      }
    }
  })
  wired.dialogModel.value = true
  await nextTick()
  wired.appSettingsLivePreviewSnapshot.value = {
    ...FA_USER_SETTINGS_DEFAULTS,
    hideTooltipsProject: false
  }

  if (store.settings !== null) {
    store.settings.hideTooltipsProject = true
  }

  wired.dialogModel.value = false
  await nextTick()

  expect(store.settings?.hideTooltipsProject).toBe(true)
})

test('registerDialogAppSettingsLivePreviewWatcher clears snapshot when the user settings store is missing on close', async () => {
  setActivePinia(createPinia())
  const store: T_appSettingsFaUserSettingsStoreForSync = {
    settings: {
      ...FA_USER_SETTINGS_DEFAULTS,
      hideTooltipsProject: false
    },
    refreshSettings: vi.fn(async () => undefined)
  }
  vi.mocked(S_FaUserSettings).mockReturnValue(
    store as unknown as ReturnType<typeof S_FaUserSettings>
  )

  const wired = wireDialogAppSettingsLivePreview({})
  wired.dialogModel.value = true
  wired.openDialog('AppSettings')
  await vi.waitFor(() => {
    expect(wired.appSettingsLivePreviewSnapshot.value).not.toBeNull()
  })

  vi.mocked(S_FaUserSettings).mockReturnValue(
    null as unknown as ReturnType<typeof S_FaUserSettings>
  )
  wired.dialogModel.value = false
  await nextTick()

  expect(wired.appSettingsLivePreviewSnapshot.value).toBeNull()
})

test('registerDialogAppSettingsLivePreviewWatcher no-ops close when no snapshot was captured', async () => {
  setActivePinia(createPinia())
  const wired = wireDialogAppSettingsLivePreview({})
  wired.dialogModel.value = true
  await nextTick()
  wired.dialogModel.value = false
  await nextTick()
  expect(wired.appSettingsLivePreviewSnapshot.value).toBeNull()
})
