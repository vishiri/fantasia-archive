import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import { FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB } from '../functions/dialogProjectSettingsDialogInput'
import { createDialogProjectSettingsDialogActions } from '../dialogProjectSettings_manager'

const { fetchFreshMock, fetchTemplatesMock, fetchWorldsMock, runFaActionAwaitMock } = vi.hoisted(() => ({
  fetchFreshMock: vi.fn(),
  fetchTemplatesMock: vi.fn(),
  fetchWorldsMock: vi.fn(),
  runFaActionAwaitMock: vi.fn(async () => true)
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
    colorPallete: '',
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
    colorPallete: '',
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
    dialogModel: ref(false),
    documentName: ref(''),
    localDocumentTemplates: ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([]),
    localSettings: ref<I_faProjectSettingsRoot | null>(null),
    localWorlds: ref<I_dialogProjectSettingsWorldDraft[] | null>(null),
    props: {},
    selectedCategoryTab: ref(FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB),
    ...overrides
  }
}

beforeEach(() => {
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
        colorPallete: '',
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
        colorPallete: '',
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
    updateWorldColorPallete,
    updateWorldDisplayNameTranslations
  } = createDialogProjectSettingsDialogActions(bindings)

  addWorld()
  expect(bindings.localWorlds.value).toHaveLength(3)

  updateWorldDisplayNameTranslations(worldAId, { 'en-US': 'Renamed' })
  updateWorldColor(worldAId, '#aabbcc')
  updateWorldColorPallete(worldAId, '#112233;#445566')
  expect(bindings.localWorlds.value?.[0]!?.displayNameTranslations).toEqual({ 'en-US': 'Renamed' })
  expect(bindings.localWorlds.value?.[0]!?.color).toBe('#aabbcc')
  expect(bindings.localWorlds.value?.[0]!?.colorPallete).toBe('#112233;#445566')

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
        colorPallete: '#112233;#445566',
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
        colorPallete: '#112233;#445566',
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
        colorPallete: '',
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
        colorPallete: '',
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
        colorPallete: '',
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
        colorPallete: '',
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
        colorPallete: '',
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
