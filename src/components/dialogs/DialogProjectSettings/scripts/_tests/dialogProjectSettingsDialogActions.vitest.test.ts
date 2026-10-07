import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import { FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB } from '../functions/dialogProjectSettingsDialogInput'
import { createDialogProjectSettingsDialogActions } from '../dialogProjectSettings_manager'

const {
  fetchFreshMock,
  fetchTemplatesMock,
  fetchWorldsMock,
  notifyCreateMock,
  runFaActionAwaitMock,
  consumeInitialTabMock,
  patchSettingsSilentlyMock
} = vi.hoisted(() => ({
  fetchFreshMock: vi.fn(),
  fetchTemplatesMock: vi.fn(),
  fetchWorldsMock: vi.fn(),
  notifyCreateMock: vi.fn(),
  runFaActionAwaitMock: vi.fn(async () => true),
  consumeInitialTabMock: vi.fn((): string | null => null),
  patchSettingsSilentlyMock: vi.fn(async () => undefined)
}))

vi.mock('quasar', async (importOriginal) => {
  const actual = await importOriginal<typeof import('quasar')>()
  return {
    ...actual,
    Notify: {
      ...actual.Notify,
      create: notifyCreateMock
    }
  }
})

vi.mock('app/src/stores/S_Dialog', () => ({
  S_DialogComponent: () => ({
    consumeProjectSettingsInitialTab: consumeInitialTabMock
  })
}))

vi.mock('app/src/stores/S_FaUserSettings', () => ({
  S_FaUserSettings: () => ({
    patchSettingsSilently: patchSettingsSilentlyMock,
    settings: { languageCode: 'en-US' }
  })
}))

vi.mock('app/src/stores/scripts/sFaProjectSettingsBridge', () => ({
  faProjectSettingsFetchFreshForDialog: fetchFreshMock
}))

vi.mock('app/src/stores/scripts/sFaProjectWorldsBridge', () => ({
  faProjectWorldsFetchFreshForDialog: fetchWorldsMock
}))

vi.mock('app/src/stores/scripts/sFaProjectDocumentTemplatesBridge', () => ({
  faProjectDocumentTemplatesFetchFreshForDialog: fetchTemplatesMock
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
    colorPalette: '',
    displayNameTranslations: { 'en-US': 'Direct world' },
    documentCount: 0,
    templateLayout: {
      groups: [],
      placements: []
    },
    id: '550e8400-e29b-41d4-a716-446655440000'
  }
]

const directTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] = [
  {
    documentCount: 0,
    icon: 'mdi-file',
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    titlePluralTranslations: { 'en-US': 'Direct template' },
    titleSingularTranslations: {},
    worldAppendixTranslations: { 'en-US': 'Appendix' }
  }
]

const hydratedWorlds: I_dialogProjectSettingsWorldDraft[] = [
  {
    color: '#808080',
    colorPalette: '',
    displayNameTranslations: { 'en-US': 'From Db' },
    documentCount: 0,
    templateLayout: {
      groups: [],
      placements: []
    },
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  }
]

const hydratedTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] = []

const worldAId = '550e8400-e29b-41d4-a716-446655440000'
const worldBId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
const templateAId = '7c9e6679-7425-40de-944b-e07fc1f90ae7'

function buildActionBindings (
  overrides?: Partial<Parameters<typeof createDialogProjectSettingsDialogActions>[0]>
): Parameters<typeof createDialogProjectSettingsDialogActions>[0] {
  return {
    baselineDocumentTemplates: ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null),
    baselineSettings: ref<I_faProjectSettingsRoot | null>(null),
    baselineWorlds: ref<I_dialogProjectSettingsWorldDraft[] | null>(null),
    dialogModel: ref(false),
    documentName: ref(''),
    hadWorldTemplatePlacementsAtDialogOpen: ref(false),
    localDocumentTemplates: ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([]),
    localSettings: ref<I_faProjectSettingsRoot | null>(null),
    localWorlds: ref<I_dialogProjectSettingsWorldDraft[] | null>(null),
    props: {},
    selectedCategoryTab: ref(FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB),
    ...overrides
  }
}

beforeEach(() => {
  notifyCreateMock.mockReset()
  fetchFreshMock.mockReset()
  fetchFreshMock.mockResolvedValue({
    projectName: 'From Db',
    schemaVersion: 1
  })
  fetchWorldsMock.mockReset()
  fetchWorldsMock.mockResolvedValue(hydratedWorlds)
  fetchTemplatesMock.mockReset()
  fetchTemplatesMock.mockResolvedValue(hydratedTemplates)
  runFaActionAwaitMock.mockReset()
  runFaActionAwaitMock.mockResolvedValue(true)
  consumeInitialTabMock.mockReset()
  consumeInitialTabMock.mockReturnValue(null)
  patchSettingsSilentlyMock.mockReset()
  patchSettingsSilentlyMock.mockResolvedValue(undefined)
})

/**
 * createDialogProjectSettingsDialogActions
 * openDialog uses direct snapshots without calling bridge fetch helpers.
 */
test('Test that openDialog hydrates from direct snapshots when provided', async () => {
  const bindings = buildActionBindings({
    selectedCategoryTab: ref('other'),
    props: {
      directDocumentTemplatesSnapshot: directTemplates,
      directSettingsSnapshot: directSnapshot,
      directWorldsSnapshot: directWorlds
    }
  })

  const { openDialog } = createDialogProjectSettingsDialogActions(bindings)

  openDialog('ProjectSettings')
  await flushPromises()

  expect(bindings.dialogModel.value).toBe(true)
  expect(bindings.documentName.value).toBe('ProjectSettings')
  expect(bindings.selectedCategoryTab.value).toBe(FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB)
  expect(bindings.localSettings.value).toEqual(directSnapshot)
  expect(bindings.localWorlds.value).toEqual(directWorlds)
  expect(bindings.localDocumentTemplates.value).toEqual(directTemplates)
  expect(fetchFreshMock).not.toHaveBeenCalled()
  expect(fetchWorldsMock).not.toHaveBeenCalled()
  expect(fetchTemplatesMock).not.toHaveBeenCalled()
})

/**
 * createDialogProjectSettingsDialogActions
 * openDialog applies a consumed projectSettingsInitialTab when present.
 */
test('Test that openDialog applies consumed projectSettingsInitialTab', async () => {
  consumeInitialTabMock.mockReturnValue('documentTemplatesSettings')
  const bindings = buildActionBindings()

  const { openDialog } = createDialogProjectSettingsDialogActions(bindings)
  openDialog('ProjectSettings')
  await flushPromises()

  expect(bindings.selectedCategoryTab.value).toBe('documentTemplatesSettings')
})

/**
 * createDialogProjectSettingsDialogActions
 * openDialog fetches fresh settings from SQLite when no direct snapshot is passed.
 */
test('Test that openDialog fetches fresh settings from the bridge when needed', async () => {
  const bindings = buildActionBindings({
    selectedCategoryTab: ref('other')
  })

  const { openDialog } = createDialogProjectSettingsDialogActions(bindings)

  openDialog('ProjectSettings')
  await flushPromises()

  expect(fetchFreshMock).toHaveBeenCalledOnce()
  expect(fetchWorldsMock).toHaveBeenCalledOnce()
  expect(fetchTemplatesMock).toHaveBeenCalledOnce()
  expect(bindings.localSettings.value).toEqual({
    projectName: 'From Db',
    schemaVersion: 1
  })
  expect(bindings.localWorlds.value).toEqual(hydratedWorlds)
  expect(bindings.localDocumentTemplates.value).toEqual(hydratedTemplates)
})

test('Test that a later Project Settings open ignores an older hydrate', async () => {
  let releaseFirstSettings: ((value: I_faProjectSettingsRoot) => void) | undefined
  fetchFreshMock.mockImplementationOnce(() => {
    return new Promise<I_faProjectSettingsRoot>((resolve) => {
      releaseFirstSettings = resolve
    })
  })
  fetchFreshMock.mockResolvedValue({
    projectName: 'Second',
    schemaVersion: 1
  })
  const bindings = buildActionBindings()
  const { openDialog } = createDialogProjectSettingsDialogActions(bindings)

  openDialog('ProjectSettings')
  await vi.waitUntil(() => fetchFreshMock.mock.calls.length === 1)
  openDialog('ProjectSettings')
  await flushPromises()
  const finishFirstSettings = releaseFirstSettings
  if (finishFirstSettings === undefined) {
    throw new Error('missing settings resolver')
  }
  finishFirstSettings({
    projectName: 'First',
    schemaVersion: 1
  })
  await flushPromises()

  expect(bindings.localSettings.value).toEqual({
    projectName: 'Second',
    schemaVersion: 1
  })
})

test('Test that a stale Project Settings load failure does not clear the newer open', async () => {
  let rejectFirst: ((error: Error) => void) | undefined
  fetchFreshMock.mockImplementationOnce(() => {
    return new Promise((_resolve, reject) => {
      rejectFirst = reject
    })
  })
  const bindings = buildActionBindings()
  const { openDialog } = createDialogProjectSettingsDialogActions(bindings)

  openDialog('ProjectSettings')
  openDialog('ProjectSettings')
  const reject = rejectFirst
  if (reject === undefined) {
    throw new Error('missing settings load reject')
  }
  reject(new Error('stale settings'))
  await flushPromises()

  expect(notifyCreateMock).not.toHaveBeenCalled()
  expect(bindings.localSettings.value).not.toBeNull()
})

test('Test that openDialog toasts when project settings fail to load', async () => {
  fetchFreshMock.mockRejectedValueOnce(new Error('settings unavailable'))
  const bindings = buildActionBindings()
  const { openDialog } = createDialogProjectSettingsDialogActions(bindings)

  openDialog('ProjectSettings')
  await flushPromises()

  expect(bindings.dialogModel.value).toBe(true)
  expect(bindings.localSettings.value).toBe(null)
  expect(notifyCreateMock).toHaveBeenCalledWith(expect.objectContaining({
    message: 'dialogs.projectSettings.loadError',
    type: 'negative'
  }))
})

test('Test that a failed Project Settings load drops the previous drafts', async () => {
  fetchWorldsMock.mockRejectedValueOnce(new Error('worlds unavailable'))
  const bindings = buildActionBindings({
    baselineSettings: ref({
      projectName: 'Old',
      schemaVersion: 1
    }),
    localDocumentTemplates: ref([]),
    localSettings: ref({
      projectName: 'Old',
      schemaVersion: 1
    }),
    localWorlds: ref([])
  })
  const { openDialog } = createDialogProjectSettingsDialogActions(bindings)

  openDialog('ProjectSettings')
  await flushPromises()

  expect(bindings.dialogModel.value).toBe(true)
  expect(bindings.localSettings.value).toBe(null)
  expect(bindings.localWorlds.value).toBe(null)
  expect(bindings.localDocumentTemplates.value).toBe(null)
  expect(bindings.baselineSettings.value).toBe(null)
  expect(bindings.baselineWorlds.value).toBe(null)
  expect(bindings.baselineDocumentTemplates.value).toBe(null)
  expect(bindings.hadWorldTemplatePlacementsAtDialogOpen.value).toBe(false)
})

/**
 * createDialogProjectSettingsDialogActions
 * addWorld, removeWorld, and field updaters mutate the local worlds draft.
 */
test('Test that createDialogProjectSettingsDialogActions mutates local world drafts', () => {
  const bindings = buildActionBindings({
    localSettings: ref<I_faProjectSettingsRoot | null>({
      projectName: 'Realm',
      schemaVersion: 1
    }),
    localWorlds: ref<I_dialogProjectSettingsWorldDraft[] | null>([
      {
        color: '',
        colorPalette: '',
        displayNameTranslations: { 'en-US': 'Alpha' },
        documentCount: 0,
        templateLayout: {
          groups: [],
          placements: []
        },
        id: worldAId
      },
      {
        color: '',
        colorPalette: '',
        displayNameTranslations: { 'en-US': 'Beta' },
        documentCount: 0,
        templateLayout: {
          groups: [],
          placements: []
        },
        id: worldBId
      }
    ])
  })

  const {
    addWorld,
    removeWorld,
    updateWorldColor,
    updateWorldColorPalette,
    updateWorldDisplayNameTranslations
  } = createDialogProjectSettingsDialogActions(bindings)

  addWorld()
  expect(bindings.localWorlds.value).toHaveLength(3)

  updateWorldDisplayNameTranslations(worldAId, { 'en-US': 'Renamed' })
  updateWorldColor(worldAId, '#aabbcc')
  updateWorldColorPalette(worldAId, '#112233;#445566')
  expect(bindings.localWorlds.value?.[0]!?.displayNameTranslations).toEqual({ 'en-US': 'Renamed' })
  expect(bindings.localWorlds.value?.[0]!?.color).toBe('#AABBCC')
  expect(bindings.localWorlds.value?.[0]!?.colorPalette).toBe('#112233;#445566')

  removeWorld(worldBId)
  expect(bindings.localWorlds.value?.some((world) => world.id === worldBId)).toBe(false)
})

/**
 * createDialogProjectSettingsDialogActions
 * addDocumentTemplate and field updaters mutate the local templates draft.
 */
test('Test that createDialogProjectSettingsDialogActions mutates local document template drafts', () => {
  const bindings = buildActionBindings({
    localDocumentTemplates: ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([
      {
        documentCount: 0,
        icon: '',
        id: templateAId,
        titlePluralTranslations: { 'en-US': 'Alpha' },
        titleSingularTranslations: {},
        worldAppendixTranslations: {}
      }
    ])
  })

  const {
    addDocumentTemplate,
    removeDocumentTemplate,
    updateDocumentTemplateTitleTranslations,
    updateDocumentTemplateIcon,
    updateDocumentTemplateWorldAppendixTranslations
  } = createDialogProjectSettingsDialogActions(bindings)

  addDocumentTemplate()
  expect(bindings.localDocumentTemplates.value).toHaveLength(2)

  updateDocumentTemplateTitleTranslations(templateAId, {
    plural: { 'en-US': 'Renamed' },
    singular: {}
  })
  updateDocumentTemplateIcon(templateAId, 'mdi-star')
  updateDocumentTemplateWorldAppendixTranslations(templateAId, { 'en-US': 'Notes' })
  expect(bindings.localDocumentTemplates.value?.[0]!?.titlePluralTranslations).toEqual({ 'en-US': 'Renamed' })
  expect(bindings.localDocumentTemplates.value?.[0]!?.icon).toBe('mdi-star')
  expect(bindings.localDocumentTemplates.value?.[0]!?.worldAppendixTranslations).toEqual({ 'en-US': 'Notes' })

  const secondId = bindings.localDocumentTemplates.value?.[1]!?.id
  if (secondId !== undefined) {
    removeDocumentTemplate(secondId)
  }
  expect(bindings.localDocumentTemplates.value).toHaveLength(1)
})

/**
 * createDialogProjectSettingsDialogActions
 * saveAndCloseDialog dispatches saveProjectSettings with trimmed project name.
 */
test('Test that saveAndCloseDialog dispatches saveProjectSettings with trimmed name', async () => {
  const bindings = buildActionBindings({
    dialogModel: ref(true),
    documentName: ref('ProjectSettings'),
    localSettings: ref<I_faProjectSettingsRoot | null>({
      projectName: '  Trimmed  ',
      schemaVersion: 1
    }),
    localWorlds: ref<I_dialogProjectSettingsWorldDraft[] | null>([
      {
        color: '#aabbcc',
        colorPalette: '#112233;#445566',
        displayNameTranslations: { 'en-US': 'Realm' },
        documentCount: 0,
        templateLayout: {
          groups: [],
          placements: []
        },
        id: worldAId
      }
    ]),
    localDocumentTemplates: ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([
      {
        documentCount: 0,
        icon: 'mdi-account',
        id: templateAId,
        titlePluralTranslations: { 'en-US': 'Character' },
        titleSingularTranslations: {},
        worldAppendixTranslations: { 'en-US': 'World notes' }
      }
    ])
  })

  const { saveAndCloseDialog } = createDialogProjectSettingsDialogActions(bindings)

  await saveAndCloseDialog()

  expect(runFaActionAwaitMock).toHaveBeenCalledWith('saveProjectSettings', {
    documentTemplates: [
      {
        icon: 'mdi-account',
        id: templateAId,
        titlePluralTranslations: { 'en-US': 'Character' },
        titleSingularTranslations: {},
        worldAppendixTranslations: { 'en-US': 'World notes' }
      }
    ],
    settings: {
      projectName: 'Trimmed'
    },
    worlds: [
      {
        color: '#aabbcc',
        colorPalette: '#112233;#445566',
        displayNameTranslations: { 'en-US': 'Realm' },
        id: worldAId,
        templateLayout: {
          groups: [],
          placements: []
        }
      }
    ]
  })
  expect(bindings.dialogModel.value).toBe(false)
  expect(patchSettingsSilentlyMock).toHaveBeenCalledWith({ hideHierarchyTree: true })
})

/**
 * createDialogProjectSettingsDialogActions
 * saveAndCloseDialog skips dispatch when local settings are null or name is blank.
 */
test('Test that saveAndCloseDialog no-ops without local settings or blank name', async () => {
  const bindings = buildActionBindings({
    dialogModel: ref(true),
    localSettings: ref<I_faProjectSettingsRoot | null>(null),
    localWorlds: ref<I_dialogProjectSettingsWorldDraft[] | null>([
      {
        color: '',
        colorPalette: '',
        displayNameTranslations: { 'en-US': 'Realm' },
        documentCount: 0,
        templateLayout: {
          groups: [],
          placements: []
        },
        id: worldAId
      }
    ])
  })

  const { saveAndCloseDialog } = createDialogProjectSettingsDialogActions(bindings)

  await saveAndCloseDialog()
  expect(runFaActionAwaitMock).not.toHaveBeenCalled()

  bindings.localSettings.value = {
    projectName: '   ',
    schemaVersion: 1
  }
  await saveAndCloseDialog()
  expect(runFaActionAwaitMock).not.toHaveBeenCalled()
  expect(bindings.dialogModel.value).toBe(true)
})

/**
 * createDialogProjectSettingsDialogActions
 * Keeps the dialog open when saveProjectSettings returns false.
 */
test('Test that saveAndCloseDialog keeps the dialog open when save fails', async () => {
  const bindings = buildActionBindings({
    dialogModel: ref(true),
    documentName: ref('ProjectSettings'),
    localSettings: ref<I_faProjectSettingsRoot | null>({
      projectName: 'Realm',
      schemaVersion: 1
    }),
    localWorlds: ref<I_dialogProjectSettingsWorldDraft[] | null>([
      {
        color: '',
        colorPalette: '',
        displayNameTranslations: { 'en-US': 'Alpha' },
        documentCount: 0,
        templateLayout: {
          groups: [],
          placements: []
        },
        id: worldAId
      }
    ])
  })
  runFaActionAwaitMock.mockResolvedValueOnce(false)

  const { saveAndCloseDialog } = createDialogProjectSettingsDialogActions(bindings)

  await saveAndCloseDialog()

  expect(runFaActionAwaitMock).toHaveBeenCalledOnce()
  expect(bindings.dialogModel.value).toBe(true)
})

/**
 * createDialogProjectSettingsDialogActions
 * A name edited while save is in flight stays on screen.
 */
test('Test that saveAndCloseDialog stays open when the draft changes during save', async () => {
  const bindings = buildActionBindings({
    dialogModel: ref(true),
    documentName: ref('ProjectSettings'),
    localSettings: ref<I_faProjectSettingsRoot | null>({
      projectName: 'Realm',
      schemaVersion: 1
    }),
    localWorlds: ref<I_dialogProjectSettingsWorldDraft[] | null>([
      {
        color: '',
        colorPalette: '',
        displayNameTranslations: { 'en-US': 'Alpha' },
        documentCount: 0,
        templateLayout: {
          groups: [],
          placements: []
        },
        id: worldAId
      }
    ]),
    localDocumentTemplates: ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([
      {
        documentCount: 0,
        icon: 'mdi-account',
        id: templateAId,
        titlePluralTranslations: { 'en-US': 'Character' },
        titleSingularTranslations: {},
        worldAppendixTranslations: {}
      }
    ])
  })
  let releaseSave: (() => void) | undefined
  const saveGate = new Promise<boolean>((resolve) => {
    releaseSave = () => {
      resolve(true)
    }
  })
  runFaActionAwaitMock.mockImplementationOnce(() => saveGate)

  const { saveAndCloseDialog } = createDialogProjectSettingsDialogActions(bindings)
  const pendingSave = saveAndCloseDialog()
  const settings = bindings.localSettings.value
  if (settings === null) {
    throw new Error('missing settings')
  }
  settings.projectName = 'Realm renamed'
  const finishSave = releaseSave
  if (finishSave === undefined) {
    throw new Error('missing save resolver')
  }
  finishSave()
  await pendingSave

  expect(bindings.dialogModel.value).toBe(true)
  expect(bindings.localSettings.value?.projectName).toBe('Realm renamed')
})

/**
 * createDialogProjectSettingsDialogActions
 * A second save waits, then writes the name typed during the first save.
 */
test('Test that a second project settings save waits for the in-flight save', async () => {
  const bindings = buildActionBindings({
    dialogModel: ref(true),
    documentName: ref('ProjectSettings'),
    localSettings: ref<I_faProjectSettingsRoot | null>({
      projectName: 'Realm',
      schemaVersion: 1
    }),
    localWorlds: ref<I_dialogProjectSettingsWorldDraft[] | null>([
      {
        color: '',
        colorPalette: '',
        displayNameTranslations: { 'en-US': 'Alpha' },
        documentCount: 0,
        templateLayout: {
          groups: [],
          placements: []
        },
        id: worldAId
      }
    ]),
    localDocumentTemplates: ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([
      {
        documentCount: 0,
        icon: 'mdi-account',
        id: templateAId,
        titlePluralTranslations: { 'en-US': 'Character' },
        titleSingularTranslations: {},
        worldAppendixTranslations: {}
      }
    ])
  })
  let releaseSave: (() => void) | undefined
  const saveGate = new Promise<boolean>((resolve) => {
    releaseSave = () => {
      resolve(true)
    }
  })
  runFaActionAwaitMock.mockImplementationOnce(() => saveGate)

  const { saveWithoutClosingDialog } = createDialogProjectSettingsDialogActions(bindings)
  const firstSave = saveWithoutClosingDialog()
  const settings = bindings.localSettings.value
  if (settings === null) {
    throw new Error('missing settings')
  }
  settings.projectName = 'Realm renamed'
  const secondSave = saveWithoutClosingDialog()
  await Promise.resolve()
  expect(runFaActionAwaitMock).toHaveBeenCalledTimes(1)
  expect(runFaActionAwaitMock).toHaveBeenNthCalledWith(1, 'saveProjectSettings', expect.objectContaining({
    settings: { projectName: 'Realm' }
  }))
  const finishSave = releaseSave
  if (finishSave === undefined) {
    throw new Error('missing save resolver')
  }
  finishSave()
  await firstSave
  await secondSave
  expect(runFaActionAwaitMock).toHaveBeenCalledTimes(2)
  expect(runFaActionAwaitMock).toHaveBeenNthCalledWith(2, 'saveProjectSettings', expect.objectContaining({
    settings: { projectName: 'Realm renamed' }
  }))
})

/**
 * createDialogProjectSettingsDialogActions
 * saveAndCloseDialog no-ops when local document templates are still null.
 */
test('Test that saveAndCloseDialog no-ops when local document templates are null', async () => {
  const bindings = buildActionBindings({
    dialogModel: ref(true),
    localDocumentTemplates: ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null),
    localSettings: ref<I_faProjectSettingsRoot | null>({
      projectName: 'Realm',
      schemaVersion: 1
    }),
    localWorlds: ref<I_dialogProjectSettingsWorldDraft[] | null>([
      {
        color: '',
        colorPalette: '',
        displayNameTranslations: { 'en-US': 'Realm' },
        documentCount: 0,
        templateLayout: {
          groups: [],
          placements: []
        },
        id: worldAId
      }
    ])
  })

  const { saveAndCloseDialog } = createDialogProjectSettingsDialogActions(bindings)

  await saveAndCloseDialog()
  expect(runFaActionAwaitMock).not.toHaveBeenCalled()
})

/**
 * createDialogProjectSettingsDialogActions
 * saveWithoutClosingDialog dispatches saveProjectSettings but keeps the dialog open.
 */
test('Test that saveWithoutClosingDialog persists without closing the dialog', async () => {
  const bindings = buildActionBindings({
    dialogModel: ref(true),
    documentName: ref('ProjectSettings'),
    localSettings: ref<I_faProjectSettingsRoot | null>({
      projectName: 'Realm',
      schemaVersion: 1
    }),
    localWorlds: ref<I_dialogProjectSettingsWorldDraft[] | null>([
      {
        color: '',
        colorPalette: '',
        displayNameTranslations: { 'en-US': 'Alpha' },
        documentCount: 0,
        templateLayout: {
          groups: [],
          placements: []
        },
        id: worldAId
      }
    ]),
    localDocumentTemplates: ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([])
  })

  const { saveWithoutClosingDialog } = createDialogProjectSettingsDialogActions(bindings)

  await saveWithoutClosingDialog()

  expect(runFaActionAwaitMock).toHaveBeenCalledOnce()
  expect(bindings.dialogModel.value).toBe(true)
})

/**
 * createDialogProjectSettingsDialogActions
 * saveWithoutClosingDialog dispatches saveProjectSettings but keeps the dialog open.
 */
test('Test that saveWithoutClosingDialog persists without closing the dialog', async () => {
  const bindings = buildActionBindings({
    dialogModel: ref(true),
    documentName: ref('ProjectSettings'),
    localSettings: ref<I_faProjectSettingsRoot | null>({
      projectName: 'Realm',
      schemaVersion: 1
    }),
    localWorlds: ref<I_dialogProjectSettingsWorldDraft[] | null>([
      {
        color: '',
        colorPalette: '',
        displayNameTranslations: { 'en-US': 'Alpha' },
        documentCount: 0,
        templateLayout: {
          groups: [],
          placements: []
        },
        id: worldAId
      }
    ]),
    localDocumentTemplates: ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([])
  })

  const { saveWithoutClosingDialog } = createDialogProjectSettingsDialogActions(bindings)

  await saveWithoutClosingDialog()

  expect(runFaActionAwaitMock).toHaveBeenCalledOnce()
  expect(bindings.dialogModel.value).toBe(true)
})
