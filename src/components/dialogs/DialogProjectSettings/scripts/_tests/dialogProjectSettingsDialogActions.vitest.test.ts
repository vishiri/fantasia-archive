import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import { FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB } from '../functions/dialogProjectSettingsDialogInput'
import { createDialogProjectSettingsDialogActions } from '../dialogProjectSettings_manager'

const { fetchFreshMock, fetchWorldsMock, runFaActionAwaitMock } = vi.hoisted(() => ({
  fetchFreshMock: vi.fn(),
  fetchWorldsMock: vi.fn(),
  runFaActionAwaitMock: vi.fn(async () => true)
}))

vi.mock('app/src/stores/scripts/sFaProjectSettingsBridge', () => ({
  faProjectSettingsFetchFreshForDialog: fetchFreshMock
}))

vi.mock('app/src/stores/scripts/sFaProjectWorldsBridge', () => ({
  faProjectWorldsFetchFreshForDialog: fetchWorldsMock
}))

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => ({
  runFaActionAwait: runFaActionAwaitMock
}))

const directSnapshot: I_faProjectSettingsRoot = {
  projectName: 'Direct',
  schemaVersion: 1
}

const directWorlds: I_dialogProjectSettingsWorldDraft[] = [
  {
    color: '',
    colorPallete: '',
    displayName: 'Direct world',
    documentCount: 0,
    id: '550e8400-e29b-41d4-a716-446655440000'
  }
]

const hydratedWorlds: I_dialogProjectSettingsWorldDraft[] = [
  {
    color: '#808080',
    colorPallete: '',
    displayName: 'From Db',
    documentCount: 0,
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  }
]

const worldAId = '550e8400-e29b-41d4-a716-446655440000'
const worldBId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

beforeEach(() => {
  fetchFreshMock.mockReset()
  fetchFreshMock.mockResolvedValue({
    projectName: 'From Db',
    schemaVersion: 1
  })
  fetchWorldsMock.mockReset()
  fetchWorldsMock.mockResolvedValue(hydratedWorlds)
  runFaActionAwaitMock.mockReset()
  runFaActionAwaitMock.mockResolvedValue(true)
})

/**
 * createDialogProjectSettingsDialogActions
 * openDialog uses directSettingsSnapshot without calling the bridge fetch helper.
 */
test('Test that openDialog hydrates from directSettingsSnapshot when provided', async () => {
  const dialogModel = ref(false)
  const documentName = ref('')
  const localSettings = ref<I_faProjectSettingsRoot | null>(null)
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>(null)
  const selectedCategoryTab = ref('other')

  const { openDialog } = createDialogProjectSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    localWorlds,
    props: {
      directSettingsSnapshot: directSnapshot,
      directWorldsSnapshot: directWorlds
    },
    selectedCategoryTab
  })

  openDialog('ProjectSettings')
  await flushPromises()

  expect(dialogModel.value).toBe(true)
  expect(documentName.value).toBe('ProjectSettings')
  expect(selectedCategoryTab.value).toBe(FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB)
  expect(localSettings.value).toEqual(directSnapshot)
  expect(localWorlds.value).toEqual(directWorlds)
  expect(fetchFreshMock).not.toHaveBeenCalled()
  expect(fetchWorldsMock).not.toHaveBeenCalled()
})

/**
 * createDialogProjectSettingsDialogActions
 * openDialog fetches fresh settings from SQLite when no direct snapshot is passed.
 */
test('Test that openDialog fetches fresh settings from the bridge when needed', async () => {
  const dialogModel = ref(false)
  const documentName = ref('')
  const localSettings = ref<I_faProjectSettingsRoot | null>(null)
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>(null)
  const selectedCategoryTab = ref('other')

  const { openDialog } = createDialogProjectSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    localWorlds,
    props: {},
    selectedCategoryTab
  })

  openDialog('ProjectSettings')
  await flushPromises()

  expect(fetchFreshMock).toHaveBeenCalledOnce()
  expect(fetchWorldsMock).toHaveBeenCalledOnce()
  expect(localSettings.value).toEqual({
    projectName: 'From Db',
    schemaVersion: 1
  })
  expect(localWorlds.value).toEqual(hydratedWorlds)
})

/**
 * createDialogProjectSettingsDialogActions
 * addWorld, removeWorld, and field updaters mutate the local worlds draft.
 */
test('Test that createDialogProjectSettingsDialogActions mutates local world drafts', () => {
  const dialogModel = ref(false)
  const documentName = ref('')
  const localSettings = ref<I_faProjectSettingsRoot | null>({
    projectName: 'Realm',
    schemaVersion: 1
  })
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>([
    {
      color: '',
      colorPallete: '',
      displayName: 'Alpha',
      documentCount: 0,
      id: worldAId
    },
    {
      color: '',
      colorPallete: '',
      displayName: 'Beta',
      documentCount: 0,
      id: worldBId
    }
  ])
  const selectedCategoryTab = ref(FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB)

  const {
    addWorld,
    removeWorld,
    updateWorldColor,
    updateWorldColorPallete,
    updateWorldDisplayName
  } = createDialogProjectSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    localWorlds,
    props: {},
    selectedCategoryTab
  })

  addWorld()
  expect(localWorlds.value).toHaveLength(3)

  updateWorldDisplayName(worldAId, 'Renamed')
  updateWorldColor(worldAId, '#aabbcc')
  updateWorldColorPallete(worldAId, '#112233;#445566')
  expect(localWorlds.value?.[0]?.displayName).toBe('Renamed')
  expect(localWorlds.value?.[0]?.color).toBe('#aabbcc')
  expect(localWorlds.value?.[0]?.colorPallete).toBe('#112233;#445566')

  removeWorld(worldBId)
  expect(localWorlds.value?.some((world) => world.id === worldBId)).toBe(false)
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
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>([
    {
      color: '#aabbcc',
      colorPallete: '#112233;#445566',
      displayName: 'Realm',
      documentCount: 0,
      id: '550e8400-e29b-41d4-a716-446655440000'
    }
  ])
  const selectedCategoryTab = ref(FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB)

  const { saveAndCloseDialog } = createDialogProjectSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    localWorlds,
    props: {},
    selectedCategoryTab
  })

  await saveAndCloseDialog()

  expect(runFaActionAwaitMock).toHaveBeenCalledWith('saveProjectSettings', {
    settings: {
      projectName: 'Trimmed'
    },
    worlds: [
      {
        color: '#aabbcc',
        colorPallete: '#112233;#445566',
        displayName: 'Realm',
        id: '550e8400-e29b-41d4-a716-446655440000'
      }
    ]
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
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>([
    {
      color: '',
      colorPallete: '',
      displayName: 'Realm',
      documentCount: 0,
      id: '550e8400-e29b-41d4-a716-446655440000'
    }
  ])
  const selectedCategoryTab = ref(FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB)

  const { saveAndCloseDialog } = createDialogProjectSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    localWorlds,
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

/**
 * createDialogProjectSettingsDialogActions
 * Keeps the dialog open when saveProjectSettings returns false.
 */
test('Test that saveAndCloseDialog keeps the dialog open when save fails', async () => {
  const dialogModel = ref(true)
  const documentName = ref('ProjectSettings')
  const localSettings = ref<I_faProjectSettingsRoot | null>({
    projectName: 'Realm',
    schemaVersion: 1
  })
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>([
    {
      color: '',
      colorPallete: '',
      displayName: 'Alpha',
      documentCount: 0,
      id: worldAId
    }
  ])
  const selectedCategoryTab = ref(FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB)
  runFaActionAwaitMock.mockResolvedValueOnce(false)

  const { saveAndCloseDialog } = createDialogProjectSettingsDialogActions({
    dialogModel,
    documentName,
    localSettings,
    localWorlds,
    props: {},
    selectedCategoryTab
  })

  await saveAndCloseDialog()

  expect(runFaActionAwaitMock).toHaveBeenCalledOnce()
  expect(dialogModel.value).toBe(true)
})
