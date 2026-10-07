/** @vitest-environment jsdom */
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import { FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT } from 'app/types/I_faOpenedDocumentsDomain'

const {
  navigateToOpenedDocumentRouteMock,
  navigateToWorkspaceHomeRouteMock,
  deleteDocumentMock,
  notifyCreateMock
} = vi.hoisted(() => ({
  navigateToOpenedDocumentRouteMock: vi.fn(async () => undefined),
  navigateToWorkspaceHomeRouteMock: vi.fn(async () => undefined),
  deleteDocumentMock: vi.fn(async () => undefined),
  notifyCreateMock: vi.fn()
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

vi.mock('app/src/scripts/appInternals/faAppRouterSession_manager', async (importOriginal) => {
  const actual = await importOriginal<typeof import('app/src/scripts/appInternals/faAppRouterSession_manager')>()
  return {
    ...actual,
    navigateToOpenedDocumentRoute: navigateToOpenedDocumentRouteMock,
    navigateToWorkspaceHomeRoute: navigateToWorkspaceHomeRouteMock
  }
})

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

const getOpenedDocumentsSnapshotMock = vi.fn()
const saveOpenedDocumentsSnapshotMock = vi.fn(async () => true)
const getDocumentByIdMock = vi.fn()
const updateDocumentMock = vi.fn()
const getWorldByIdMock = vi.fn()
const getDocumentTemplateByIdMock = vi.fn()
const createDocumentMock = vi.fn()
const recordDocumentLastOpenedMock = vi.fn(async () => undefined)
const moveDocumentInHierarchyMock = vi.fn()
const listPlacementDocumentChildrenMock = vi.fn()
const listDocumentsMock = vi.fn()

const listDocumentTagsMock = vi.fn(async (): Promise<{
  items: Array<{ id: string, name: string }>
}> => ({ items: [] }))
const setDocumentTagsMock = vi.fn(async (): Promise<{
  items: Array<{ id: string, name: string }>
}> => ({ items: [] }))

const baseTab: I_faOpenedDocumentTab = {
  documentId: 'doc-1',
  persistenceState: 'persisted',
  tabLabel: 'Hero',
  templateIcon: 'mdi-account',
  displayNameDraft: 'Hero',
  savedDisplayName: 'Hero',
  documentTextColorDraft: '',
  savedDocumentTextColor: '',
  documentBackgroundColorDraft: '',
  savedDocumentBackgroundColor: '',
  isCategoryDraft: false,
  savedIsCategory: false,
  isFinishedDraft: false,
  isMinorDraft: false,
  isDeadDraft: false,
  savedIsFinished: false,
  savedIsMinor: false,
  savedIsDead: false,
  parentDocumentIdDraft: '',
  savedParentDocumentId: '',
  treeOrderNumberDraft: '',
  savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
  extraClassesDraft: '',
  savedExtraClasses: '',
  hasUnsavedChanges: false,
  editState: false
}

const treeMeta = {
  tabLabel: 'Hero',
  templateIcon: 'mdi-account'
}

beforeEach(() => {
  vi.useFakeTimers()
  setActivePinia(createPinia())
  navigateToOpenedDocumentRouteMock.mockClear()
  navigateToWorkspaceHomeRouteMock.mockClear()
  getOpenedDocumentsSnapshotMock.mockReset()
  saveOpenedDocumentsSnapshotMock.mockClear()
  getDocumentByIdMock.mockReset()
  updateDocumentMock.mockReset()
  getWorldByIdMock.mockReset()
  getDocumentTemplateByIdMock.mockReset()
  createDocumentMock.mockReset()
  recordDocumentLastOpenedMock.mockReset()
  recordDocumentLastOpenedMock.mockResolvedValue(undefined)
  moveDocumentInHierarchyMock.mockReset()
  listPlacementDocumentChildrenMock.mockReset()
  listDocumentsMock.mockReset()
  listDocumentsMock.mockResolvedValue({
    items: [{
      createdAtMs: 1,
      displayName: 'Sibling',
      documentBackgroundColor: null,
      documentTextColor: null,
      extraClasses: '',
      id: 'sibling-1',
      isCategory: false,
      isDead: false,
      isFinished: false,
      isMinor: false,
      parentDocumentId: 'parent-2',
      placementId: 'placement-1',
      sortOrder: 0,
      templateId: 'tpl-1',
      treeOrderNumber: 1,
      updatedAtMs: 1,
      worldId: 'world-1'
    }]
  })
  listDocumentTagsMock.mockReset()
  listDocumentTagsMock.mockResolvedValue({ items: [] })
  setDocumentTagsMock.mockReset()
  setDocumentTagsMock.mockResolvedValue({ items: [] })
  deleteDocumentMock.mockReset()
  notifyCreateMock.mockClear()
  getDocumentByIdMock.mockResolvedValue({
    displayName: 'Hero',
    id: 'doc-1',
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  getWorldByIdMock.mockResolvedValue({ id: 'world-1' })
  getDocumentTemplateByIdMock.mockResolvedValue({
    icon: 'mdi-account',
    id: 'tpl-1',
    titlePluralTranslations: { 'en-US': 'Characters' },
    titleSingularTranslations: { 'en-US': 'Character' }
  })
  createDocumentMock.mockImplementation(async (input: { id?: string, displayName: string }) => ({
    displayName: input.displayName,
    id: input.id ?? 'saved-doc'
  }))
  updateDocumentMock.mockResolvedValue({
    displayName: 'Saved Hero',
    id: 'doc-1',
    parentDocumentId: null
  })
  moveDocumentInHierarchyMock.mockResolvedValue({
    displayName: 'Saved Hero',
    id: 'doc-1',
    parentDocumentId: 'parent-2',
    placementId: 'placement-1',
    sortOrder: 1,
    hasChildren: false
  })
  listPlacementDocumentChildrenMock.mockResolvedValue({
    items: [
      {
        displayName: 'Sibling',
        hasChildren: false,
        id: 'sibling-1',
        parentDocumentId: 'parent-2',
        placementId: 'placement-1',
        sortOrder: 0
      }
    ]
  })
  getOpenedDocumentsSnapshotMock.mockResolvedValue({
    ...FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT,
    activeDocumentId: 'doc-1',
    tabs: [baseTab]
  })
  window.faContentBridgeAPIs = {
    projectContent: {
      createDocument: createDocumentMock,
      deleteDocument: deleteDocumentMock,
      getDocumentById: getDocumentByIdMock,
      getDocumentTemplateById: getDocumentTemplateByIdMock,
      getWorldById: getWorldByIdMock,
      listDocuments: listDocumentsMock,
      listPlacementDocumentChildren: listPlacementDocumentChildrenMock,
      moveDocumentInHierarchy: moveDocumentInHierarchyMock,
      recordDocumentLastOpened: recordDocumentLastOpenedMock,
      updateDocument: updateDocumentMock
    },
    projectManagement: {
      getOpenedDocumentsSnapshot: getOpenedDocumentsSnapshotMock,
      saveOpenedDocumentsSnapshot: saveOpenedDocumentsSnapshotMock
    }
  } as never
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
})

afterEach(() => {
  vi.useRealTimers()
})

test('Test that S_FaOpenedDocuments hydrates tabs from project database snapshot', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  expect(store.tabs).toHaveLength(1)
  expect(store.activeDocumentId).toBe('doc-1')
  expect(store.hydrationComplete).toBe(true)
  expect(navigateToWorkspaceHomeRouteMock).toHaveBeenCalled()
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments hydrate reloads tags missing from the snapshot', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  Object.assign(window.faContentBridgeAPIs.projectContent, {
    listDocumentTags: listDocumentTagsMock
  })
  listDocumentTagsMock.mockResolvedValue({
    items: [{
      id: 'tag-1',
      name: 'Heroes'
    }]
  })
  await store.hydrateFromProjectDatabase()
  expect(store.tabs[0]?.savedTags).toEqual([{
    id: 'tag-1',
    name: 'Heroes'
  }])
  expect(store.tabs[0]?.tagsDraft).toEqual([{
    id: 'tag-1',
    name: 'Heroes'
  }])
  expect(store.tabs[0]?.hasUnsavedChanges).toBe(false)
})

test('Test that S_FaOpenedDocuments hydrate navigates to active document when autoOpenLastDocument is on', async () => {
  const { S_FaUserSettings } = await import('../S_FaUserSettings')
  const { FA_USER_SETTINGS_DEFAULTS } = await import(
    'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
  )
  const userSettings = S_FaUserSettings()
  userSettings.settings = {
    ...FA_USER_SETTINGS_DEFAULTS,
    autoOpenLastDocument: true
  }

  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  expect(store.activeDocumentId).toBe('doc-1')
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-1')
  expect(navigateToWorkspaceHomeRouteMock).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments hydrate waits to finish until the auto-open route resolves', async () => {
  let resolveNavigate: ((value: undefined) => void) | undefined
  navigateToOpenedDocumentRouteMock.mockImplementationOnce(() => {
    return new Promise<undefined>((resolve) => {
      resolveNavigate = resolve
    })
  })
  const { S_FaUserSettings } = await import('../S_FaUserSettings')
  const { FA_USER_SETTINGS_DEFAULTS } = await import(
    'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
  )
  const userSettings = S_FaUserSettings()
  userSettings.settings = {
    ...FA_USER_SETTINGS_DEFAULTS,
    autoOpenLastDocument: true
  }
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  const pending = store.hydrateFromProjectDatabase()
  await vi.waitUntil(() => navigateToOpenedDocumentRouteMock.mock.calls.length === 1)
  expect(store.hydrationComplete).toBe(false)
  const finishNavigate = resolveNavigate
  if (finishNavigate === undefined) {
    throw new Error('missing navigate resolver')
  }
  finishNavigate(undefined)
  await pending
  expect(store.hydrationComplete).toBe(true)
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-1')
})

test('Test that S_FaOpenedDocuments hydrate keeps a name typed during the document read', async () => {
  let resolveDocument: ((value: { displayName: string, id: string, parentDocumentId: null }) => void) | undefined
  getDocumentByIdMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveDocument = resolve
    })
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  const pending = store.hydrateFromProjectDatabase()
  await vi.waitUntil(() => getDocumentByIdMock.mock.calls.length === 1)
  store.updateDisplayNameDraft('doc-1', 'Hero revised')
  const finishDocument = resolveDocument
  if (finishDocument === undefined) {
    throw new Error('missing document resolver')
  }
  finishDocument({
    displayName: 'Hero from database',
    id: 'doc-1',
    parentDocumentId: null
  })
  await pending
  expect(store.tabs[0]?.displayNameDraft).toBe('Hero revised')
  expect(store.tabs[0]?.savedDisplayName).toBe('Hero from database')
  expect(store.tabs[0]?.hasUnsavedChanges).toBe(true)
})

test('Test that S_FaOpenedDocuments hydrate does not restore a tab closed during the document read', async () => {
  let resolveDocument: ((value: { displayName: string, id: string, parentDocumentId: null }) => void) | undefined
  getDocumentByIdMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveDocument = resolve
    })
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  const pending = store.hydrateFromProjectDatabase()
  await vi.waitUntil(() => getDocumentByIdMock.mock.calls.length === 1)
  store.requestCloseTab('doc-1')
  await vi.waitUntil(() => store.tabs.length === 0)
  const finishDocument = resolveDocument
  if (finishDocument === undefined) {
    throw new Error('missing document resolver')
  }
  finishDocument({
    displayName: 'Hero',
    id: 'doc-1',
    parentDocumentId: null
  })
  await pending
  expect(store.tabs).toHaveLength(0)
  expect(store.activeDocumentId).toBeNull()
})

test('Test that openFromTree does not add a tab after the project changes', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const tabCount = store.tabs.length
  navigateToOpenedDocumentRouteMock.mockClear()
  recordDocumentLastOpenedMock.mockClear()
  let resolveDocument: ((value: { displayName: string, id: string }) => void) | undefined
  getDocumentByIdMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveDocument = resolve
    })
  })
  const pending = store.openFromTree('doc-2', 'leftNavigate', treeMeta)
  await Promise.resolve()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  resolveDocument?.({
    displayName: 'Villain',
    id: 'doc-2'
  })
  await pending
  expect(store.tabs).toHaveLength(tabCount)
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalledWith('doc-2')
  expect(recordDocumentLastOpenedMock).not.toHaveBeenCalled()
})

test('Test that openFromTree does not bump last opened after the project changes during the MRU write', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  const bumpDocumentLastOpenedRefreshGeneration = vi.fn()
  hierarchyStore.bumpDocumentLastOpenedRefreshGeneration = bumpDocumentLastOpenedRefreshGeneration
  await store.hydrateFromProjectDatabase()
  let resolveRecord: ((value: undefined) => void) | undefined
  recordDocumentLastOpenedMock.mockImplementationOnce(() => {
    return new Promise<undefined>((resolve) => {
      resolveRecord = resolve
    })
  })
  const pending = store.openFromTree('doc-1', 'leftNavigate', treeMeta)
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (recordDocumentLastOpenedMock.mock.calls.length === 1) {
      break
    }
    await Promise.resolve()
  }
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  const finishRecord = resolveRecord
  if (finishRecord === undefined) {
    throw new Error('missing last-opened resolver')
  }
  finishRecord(undefined)
  await pending
  expect(bumpDocumentLastOpenedRefreshGeneration).not.toHaveBeenCalled()
})

test('Test that a temporary document is not opened after the project changes', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const tabCount = store.tabs.length
  let resolveWorld: ((value: { id: string }) => void) | undefined
  getWorldByIdMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveWorld = resolve
    })
  })
  const pending = store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  await Promise.resolve()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  resolveWorld?.({ id: 'world-1' })
  await pending
  expect(store.tabs).toHaveLength(tabCount)
})

test('Test that a temporary document does not steal focus when another tab is focused during create', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  navigateToOpenedDocumentRouteMock.mockClear()
  let resolveWorld: ((value: { id: string }) => void) | undefined
  getWorldByIdMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveWorld = resolve
    })
  })
  const pending = store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  await Promise.resolve()
  await store.focusTab('doc-1')
  resolveWorld?.({ id: 'world-1' })
  const documentId = await pending
  expect(store.activeDocumentId).toBe('doc-1')
  expect(store.findTabByDocumentId(documentId)?.displayNameDraft).toBe('Aria')
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalledWith(documentId)
})

test('Test that S_FaOpenedDocuments openFromTree fills a blank tree label and icon from the document', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Villain',
    id: 'doc-2',
    templateId: 'tpl-2'
  })
  getDocumentTemplateByIdMock.mockResolvedValueOnce({
    icon: ' mdi-skull ',
    id: 'tpl-2'
  })
  await store.openFromTree('doc-2', 'leftNavigate', {
    tabLabel: '   ',
    templateIcon: ''
  })
  const opened = store.tabs.find((tab) => tab.documentId === 'doc-2')
  expect(opened?.tabLabel).toBe('Villain')
  expect(opened?.templateIcon).toBe('mdi-skull')
  expect(opened?.displayNameDraft).toBe('Villain')
})

test('Test that S_FaOpenedDocuments openFromTree still opens when the template icon read fails', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Villain',
    id: 'doc-2',
    templateId: 'tpl-2'
  })
  getDocumentTemplateByIdMock.mockRejectedValueOnce(new Error('template missing'))
  await store.openFromTree('doc-2', 'leftNavigate', {
    tabLabel: '',
    templateIcon: ''
  })
  const opened = store.tabs.find((tab) => tab.documentId === 'doc-2')
  expect(opened?.tabLabel).toBe('Villain')
  expect(opened?.templateIcon).toBe('')
})

test('Test that S_FaOpenedDocuments openFromTree appends a new tab on left navigate', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Villain',
    id: 'doc-2'
  })
  await store.openFromTree('doc-2', 'leftNavigate', {
    tabLabel: 'Villain',
    templateIcon: 'mdi-skull'
  })
  expect(store.tabs).toHaveLength(2)
  expect(store.activeDocumentId).toBe('doc-2')
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-2')
})

test('Test that S_FaOpenedDocuments openFromTree middle background appends without focusing', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  await store.hydrateFromProjectDatabase()
  const previousActive = store.activeDocumentId
  const lastOpenedGenBefore = hierarchyStore.documentLastOpenedRefreshGeneration
  const censusBefore = hierarchyStore.documentCensusRefreshGeneration
  navigateToOpenedDocumentRouteMock.mockClear()
  recordDocumentLastOpenedMock.mockClear()
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Villain',
    id: 'doc-2'
  })
  await store.openFromTree('doc-2', 'middleBackground', treeMeta)
  expect(store.tabs).toHaveLength(2)
  expect(store.activeDocumentId).toBe(previousActive)
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalled()
  expect(recordDocumentLastOpenedMock).toHaveBeenCalledWith({ documentId: 'doc-2' })
  expect(hierarchyStore.documentLastOpenedRefreshGeneration).toBe(lastOpenedGenBefore + 1)
  expect(hierarchyStore.documentCensusRefreshGeneration).toBe(censusBefore)
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName persists and queues tree refresh', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'Saved Hero')
  store.enterDocumentEditMode('doc-1')
  await store.saveDocumentDisplayName('doc-1', { keepEditMode: false })
  expect(store.findTabByDocumentId('doc-1')?.savedDisplayName).toBe('Saved Hero')
  expect(hierarchyStore.pendingDocumentRefreshIds).toEqual(['doc-1'])
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName keeps a name typed during the write', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'First')
  let resolveUpdate: ((value: {
    displayName: string
    id: string
    parentDocumentId: null
  }) => void) | undefined
  updateDocumentMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveUpdate = resolve
    })
  })
  const pending = store.saveDocumentDisplayName('doc-1', { keepEditMode: true })
  await Promise.resolve()
  store.updateDisplayNameDraft('doc-1', 'Second')
  resolveUpdate?.({
    displayName: 'First',
    id: 'doc-1',
    parentDocumentId: null
  })
  await pending
  expect(store.findTabByDocumentId('doc-1')?.displayNameDraft).toBe('Second')
  expect(store.findTabByDocumentId('doc-1')?.savedDisplayName).toBe('First')
  expect(store.findTabByDocumentId('doc-1')?.hasUnsavedChanges).toBe(true)
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName keeps a temporary name typed during create', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'First',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  store.updateDisplayNameDraft(documentId, 'First')
  const pending = store.saveDocumentDisplayName(documentId, { keepEditMode: true })
  store.updateDisplayNameDraft(documentId, 'Second')
  await pending
  expect(store.findTabByDocumentId(documentId)?.persistenceState).toBe('persisted')
  expect(store.findTabByDocumentId(documentId)?.displayNameDraft).toBe('Second')
  expect(store.findTabByDocumentId(documentId)?.savedDisplayName).toBe('First')
  expect(store.findTabByDocumentId(documentId)?.hasUnsavedChanges).toBe(true)
})

test('Test that a second temporary save waits and does not create twice', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  let releaseCreate: (() => void) | undefined
  const createGate = new Promise<void>((resolve) => {
    releaseCreate = resolve
  })
  createDocumentMock.mockImplementation(async (input: { id?: string, displayName: string }) => {
    await createGate
    return {
      displayName: input.displayName,
      id: input.id ?? documentId
    }
  })
  updateDocumentMock.mockResolvedValue({
    displayName: 'Aria',
    id: documentId,
    parentDocumentId: null
  })
  const firstSave = store.saveDocumentDisplayName(documentId, { keepEditMode: true })
  const secondSave = store.saveDocumentDisplayName(documentId, { keepEditMode: true })
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (createDocumentMock.mock.calls.length === 1) {
      break
    }
    await Promise.resolve()
  }
  expect(createDocumentMock).toHaveBeenCalledTimes(1)
  const finishCreate = releaseCreate
  if (finishCreate === undefined) {
    throw new Error('missing create resolver')
  }
  finishCreate()
  await firstSave
  await secondSave
  expect(createDocumentMock).toHaveBeenCalledTimes(1)
  expect(updateDocumentMock).toHaveBeenCalled()
  expect(store.findTabByDocumentId(documentId)?.persistenceState).toBe('persisted')
})

test('Test that deleteOpenedDocument waits for an in-flight temporary save before removing the row', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  let releaseCreate: (() => void) | undefined
  const createGate = new Promise<void>((resolve) => {
    releaseCreate = resolve
  })
  createDocumentMock.mockImplementation(async (input: { id?: string, displayName: string }) => {
    await createGate
    return {
      displayName: input.displayName,
      id: input.id ?? documentId
    }
  })
  deleteDocumentMock.mockResolvedValue(undefined)
  const pendingSave = store.saveDocumentDisplayName(documentId, { keepEditMode: true })
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (createDocumentMock.mock.calls.length === 1) {
      break
    }
    await Promise.resolve()
  }
  expect(createDocumentMock).toHaveBeenCalledTimes(1)
  const pendingDelete = store.deleteOpenedDocument(documentId)
  await Promise.resolve()
  expect(deleteDocumentMock).not.toHaveBeenCalled()
  const finishCreate = releaseCreate
  if (finishCreate === undefined) {
    throw new Error('missing create resolver')
  }
  finishCreate()
  await pendingSave
  await pendingDelete
  expect(deleteDocumentMock).toHaveBeenCalledWith(documentId)
  expect(store.findTabByDocumentId(documentId)).toBeNull()
})

test('Test that a temporary document save does not record last opened after the project changes during layout refresh', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'First',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  const bumpDocumentCensusRefreshGeneration = vi.fn()
  hierarchyStore.bumpDocumentCensusRefreshGeneration = bumpDocumentCensusRefreshGeneration
  let resolveRefresh: ((value: undefined) => void) | undefined
  const refreshLayout = vi.fn(() => {
    return new Promise<undefined>((resolve) => {
      resolveRefresh = resolve
    })
  })
  hierarchyStore.refreshLayout = refreshLayout
  recordDocumentLastOpenedMock.mockClear()
  const pending = store.saveDocumentDisplayName(documentId, { keepEditMode: true })
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (refreshLayout.mock.calls.length === 1) {
      break
    }
    await Promise.resolve()
  }
  recordDocumentLastOpenedMock.mockClear()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  const finishRefresh = resolveRefresh
  if (finishRefresh === undefined) {
    throw new Error('missing layout refresh resolver')
  }
  finishRefresh(undefined)
  await pending
  expect(recordDocumentLastOpenedMock).not.toHaveBeenCalled()
  expect(bumpDocumentCensusRefreshGeneration).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName keeps a name typed during the tag write', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'First')
  store.updateTagsDraft('doc-1', [{
    id: 'tag-1',
    isNew: false,
    name: 'Heroes'
  }])
  let resolveTags: ((value: { items: Array<{ id: string, name: string }> }) => void) | undefined
  setDocumentTagsMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveTags = resolve
    })
  })
  Object.assign(window.faContentBridgeAPIs.projectContent, {
    setDocumentTags: setDocumentTagsMock
  })
  const pending = store.saveDocumentDisplayName('doc-1', { keepEditMode: true })
  await vi.waitUntil(() => setDocumentTagsMock.mock.calls.length === 1)
  store.updateDisplayNameDraft('doc-1', 'Second')
  resolveTags?.({
    items: [{
      id: 'tag-1',
      name: 'Heroes'
    }]
  })
  await pending
  expect(store.findTabByDocumentId('doc-1')?.displayNameDraft).toBe('Second')
  expect(store.findTabByDocumentId('doc-1')?.savedDisplayName).toBe('Saved Hero')
  expect(store.findTabByDocumentId('doc-1')?.hasUnsavedChanges).toBe(true)
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName keeps a preview toggle during the tag write', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.enterDocumentEditMode('doc-1')
  store.updateTagsDraft('doc-1', [{
    id: 'tag-1',
    isNew: false,
    name: 'Heroes'
  }])
  let resolveTags: ((value: { items: Array<{ id: string, name: string }> }) => void) | undefined
  setDocumentTagsMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveTags = resolve
    })
  })
  Object.assign(window.faContentBridgeAPIs.projectContent, {
    setDocumentTags: setDocumentTagsMock
  })
  const pending = store.saveDocumentDisplayName('doc-1', { keepEditMode: true })
  await vi.waitUntil(() => setDocumentTagsMock.mock.calls.length === 1)
  store.setDocumentEditState('doc-1', false)
  resolveTags?.({
    items: [{
      id: 'tag-1',
      name: 'Heroes'
    }]
  })
  await pending
  expect(store.findTabByDocumentId('doc-1')?.editState).toBe(false)
})

test('Test that a persisted document save does not refresh the tree after the project changes during layout refresh', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  await store.hydrateFromProjectDatabase()
  store.updateTagsDraft('doc-1', [{
    id: 'tag-1',
    isNew: false,
    name: 'Heroes'
  }])
  const refreshDocumentsInTree = vi.fn()
  hierarchyStore.refreshDocumentsInTree = refreshDocumentsInTree
  let resolveRefresh: ((value: undefined) => void) | undefined
  const refreshLayout = vi.fn(() => {
    return new Promise<undefined>((resolve) => {
      resolveRefresh = resolve
    })
  })
  hierarchyStore.refreshLayout = refreshLayout
  const pending = store.saveDocumentDisplayName('doc-1', { keepEditMode: true })
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (refreshLayout.mock.calls.length === 1) {
      break
    }
    await Promise.resolve()
  }
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  const finishRefresh = resolveRefresh
  if (finishRefresh === undefined) {
    throw new Error('missing layout refresh resolver')
  }
  finishRefresh(undefined)
  await pending
  expect(refreshDocumentsInTree).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName follows a tab reorder during the write', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const otherTab: I_faOpenedDocumentTab = {
    ...baseTab,
    documentId: 'doc-2',
    displayNameDraft: 'Other',
    savedDisplayName: 'Other',
    tabLabel: 'Other'
  }
  store.replaceOpenedDocumentTabs([store.tabs[0]!, otherTab])
  store.updateDisplayNameDraft('doc-1', 'Saved Hero')
  let resolveUpdate: ((value: {
    displayName: string
    id: string
    parentDocumentId: null
  }) => void) | undefined
  updateDocumentMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveUpdate = resolve
    })
  })
  const pending = store.saveDocumentDisplayName('doc-1', { keepEditMode: false })
  await Promise.resolve()
  store.reorderDocumentTabs(0, 1)
  resolveUpdate?.({
    displayName: 'Saved Hero',
    id: 'doc-1',
    parentDocumentId: null
  })
  await pending
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-2', 'doc-1'])
  expect(store.findTabByDocumentId('doc-1')?.savedDisplayName).toBe('Saved Hero')
  expect(store.findTabByDocumentId('doc-2')?.savedDisplayName).toBe('Other')
})

test('Test that a document save does not rewrite tabs after the project changes', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'Saved Hero')
  let resolveUpdate: ((value: {
    displayName: string
    id: string
    parentDocumentId: null
  }) => void) | undefined
  updateDocumentMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveUpdate = resolve
    })
  })
  const pending = store.saveDocumentDisplayName('doc-1', { keepEditMode: false })
  await Promise.resolve()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  store.replaceOpenedDocumentTabs([])
  resolveUpdate?.({
    displayName: 'Saved Hero',
    id: 'doc-1',
    parentDocumentId: null
  })
  await pending
  expect(store.tabs).toEqual([])
})

test('Test that a temporary document save does not create after the project changes', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  let resolveTemplate: ((value: {
    id: string
    titleSingularTranslations: { 'en-US': string }
  }) => void) | undefined
  getDocumentTemplateByIdMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveTemplate = resolve
    })
  })
  const pending = store.saveDocumentDisplayName(documentId, { keepEditMode: false })
  await Promise.resolve()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  resolveTemplate?.({
    id: 'tpl-1',
    titleSingularTranslations: { 'en-US': 'Character' }
  })
  await pending
  expect(createDocumentMock).not.toHaveBeenCalled()
})

test('Test that a temporary document save does not create while a project open is in flight', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  let resolveTemplate: ((value: {
    id: string
    titleSingularTranslations: { 'en-US': string }
  }) => void) | undefined
  getDocumentTemplateByIdMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveTemplate = resolve
    })
  })
  const pending = store.saveDocumentDisplayName(documentId, { keepEditMode: false })
  await Promise.resolve()
  vi.spyOn(S_FaActiveProject(), 'isProjectReplacementInFlight').mockReturnValue(true)
  resolveTemplate?.({
    id: 'tpl-1',
    titleSingularTranslations: { 'en-US': 'Character' }
  })
  await pending
  expect(createDocumentMock).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName moves parent before updateDocument', async () => {
  const refreshHierarchyTreeNodesMock = vi.fn()
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Hero',
    id: 'doc-1',
    parentDocumentId: null,
    placementId: 'placement-1',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshHierarchyTreeNodes = refreshHierarchyTreeNodesMock
  hierarchyStore.treeData = [
    {
      children: [
        {
          children: [
            {
              children: [],
              childrenLoaded: true,
              documentId: 'parent-2',
              groupId: null,
              hasChildren: false,
              icon: 'mdi-account',
              id: 'parent-2',
              label: 'Parent 2',
              nodeKind: 'document',
              placementId: 'placement-1',
              worldColor: '#ff0000',
              worldId: 'world-1'
            }
          ],
          childrenLoaded: true,
          documentId: null,
          documentTemplateId: 'tpl-1',
          groupId: null,
          hasChildren: true,
          icon: 'mdi-home',
          id: 'placement-1',
          label: 'Characters',
          nodeKind: 'templatePlacement',
          placementId: 'placement-1',
          worldColor: '#ff0000',
          worldId: 'world-1'
        }
      ],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: 'mdi-earth',
      id: 'world-1',
      label: 'World',
      nodeKind: 'world',
      placementId: null,
      worldColor: '#ff0000',
      worldId: 'world-1'
    }
  ]
  await store.hydrateFromProjectDatabase()
  store.updateParentDocumentIdDraft('doc-1', 'parent-2')
  store.enterDocumentEditMode('doc-1')
  await store.saveDocumentDisplayName('doc-1', { keepEditMode: true })
  await vi.runAllTimersAsync()
  expect(moveDocumentInHierarchyMock).toHaveBeenCalledWith({
    documentId: 'doc-1',
    targetParentDocumentId: 'parent-2',
    targetSortOrder: 1
  })
  expect(store.findTabByDocumentId('doc-1')?.savedParentDocumentId).toBe('parent-2')
  expect(refreshHierarchyTreeNodesMock).toHaveBeenCalledWith(['parent-2'])
  expect(hierarchyStore.treeData[0]?.children[0]?.children[0]?.hasChildren).toBe(true)
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName rejects an inexact order number before creating a temporary document', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [{
      ...baseTab,
      persistenceState: 'temporary',
      worldId: 'world-1',
      templateId: 'tpl-1',
      treeOrderNumberDraft: '1e20'
    }]
  })
  store.enterDocumentEditMode('doc-1')
  await expect(store.saveDocumentDisplayName('doc-1', { keepEditMode: true }))
    .rejects.toThrow('Could not save the document.')
  expect(createDocumentMock).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName rejects an inexact order number before moving the parent', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [{
      ...baseTab,
      parentDocumentIdDraft: 'parent-2',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '1e20'
    }]
  })
  store.enterDocumentEditMode('doc-1')
  await expect(store.saveDocumentDisplayName('doc-1', { keepEditMode: true }))
    .rejects.toThrow('Could not save the document.')
  expect(moveDocumentInHierarchyMock).not.toHaveBeenCalled()
  expect(updateDocumentMock).not.toHaveBeenCalled()
  expect(store.findTabByDocumentId('doc-1')?.savedParentDocumentId).toBe('')
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName rejects extra classes over 512 before creating a temporary document', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [{
      ...baseTab,
      persistenceState: 'temporary',
      worldId: 'world-1',
      templateId: 'tpl-1',
      extraClassesDraft: 'a'.repeat(513)
    }]
  })
  store.enterDocumentEditMode('doc-1')
  await expect(store.saveDocumentDisplayName('doc-1', { keepEditMode: true }))
    .rejects.toThrow('Could not save the document.')
  expect(createDocumentMock).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName rejects extra classes over 512 before moving the parent', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [{
      ...baseTab,
      parentDocumentIdDraft: 'parent-2',
      savedParentDocumentId: '',
      extraClassesDraft: 'a'.repeat(513),
      savedExtraClasses: ''
    }]
  })
  store.enterDocumentEditMode('doc-1')
  await expect(store.saveDocumentDisplayName('doc-1', { keepEditMode: true }))
    .rejects.toThrow('Could not save the document.')
  expect(moveDocumentInHierarchyMock).not.toHaveBeenCalled()
  expect(updateDocumentMock).not.toHaveBeenCalled()
  expect(store.findTabByDocumentId('doc-1')?.savedParentDocumentId).toBe('')
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName skips a parent move already stored', async () => {
  const documentRow = {
    displayName: 'Hero',
    id: 'doc-1',
    parentDocumentId: null as string | null,
    placementId: 'placement-1',
    templateId: 'tpl-1',
    worldId: 'world-1'
  }
  getDocumentByIdMock
    .mockResolvedValueOnce(documentRow)
    .mockResolvedValueOnce(documentRow)
    .mockResolvedValue({
      ...documentRow,
      parentDocumentId: 'parent-2'
    })
  updateDocumentMock.mockRejectedValueOnce(new Error('write failed'))
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateParentDocumentIdDraft('doc-1', 'parent-2')
  store.enterDocumentEditMode('doc-1')
  await expect(store.saveDocumentDisplayName('doc-1', { keepEditMode: true }))
    .rejects.toThrow('write failed')
  expect(moveDocumentInHierarchyMock).toHaveBeenCalledTimes(1)
  await store.saveDocumentDisplayName('doc-1', { keepEditMode: true })
  expect(moveDocumentInHierarchyMock).toHaveBeenCalledTimes(1)
  expect(store.findTabByDocumentId('doc-1')?.savedParentDocumentId).toBe('parent-2')
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName parent move to root queues placement refresh', async () => {
  const refreshHierarchyTreeNodesMock = vi.fn()
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshHierarchyTreeNodes = refreshHierarchyTreeNodesMock
  hierarchyStore.treeData = [
    {
      children: [
        {
          children: [],
          childrenLoaded: true,
          documentId: null,
          documentTemplateId: 'tpl-1',
          groupId: null,
          hasChildren: true,
          icon: 'mdi-home',
          id: 'placement-1',
          label: 'Characters',
          nodeKind: 'templatePlacement',
          placementId: 'placement-1',
          worldColor: '#ff0000',
          worldId: 'world-1'
        }
      ],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: 'mdi-earth',
      id: 'world-1',
      label: 'World',
      nodeKind: 'world',
      placementId: null,
      worldColor: '#ff0000',
      worldId: 'world-1'
    }
  ]
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [{
      ...baseTab,
      parentDocumentIdDraft: '',
      savedParentDocumentId: 'parent-2',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
    }]
  })
  getDocumentByIdMock.mockResolvedValue({
    displayName: 'Hero',
    id: 'doc-1',
    parentDocumentId: 'parent-2',
    placementId: 'placement-1',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  store.enterDocumentEditMode('doc-1')
  await store.saveDocumentDisplayName('doc-1', { keepEditMode: true })
  await vi.runAllTimersAsync()
  expect(moveDocumentInHierarchyMock).toHaveBeenCalledWith({
    documentId: 'doc-1',
    targetParentDocumentId: null,
    targetSortOrder: 0
  })
  expect(refreshHierarchyTreeNodesMock).toHaveBeenCalledWith(['placement-1'])
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName rejects parent move without placement', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateParentDocumentIdDraft('doc-1', 'parent-2')
  getDocumentByIdMock.mockResolvedValue({
    displayName: 'Hero',
    id: 'doc-1',
    parentDocumentId: null,
    placementId: null,
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  store.enterDocumentEditMode('doc-1')
  await expect(store.saveDocumentDisplayName('doc-1', { keepEditMode: true }))
    .rejects
    .toThrow('Could not save the document.')
})

test('Test that S_FaOpenedDocuments syncOpenedDocumentParentFromHierarchy overwrites draft without inventing dirty', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [{
      ...baseTab,
      displayNameDraft: 'Dirty name',
      hasUnsavedChanges: true,
      parentDocumentIdDraft: 'typed-parent',
      savedParentDocumentId: 'saved-parent',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
    }]
  })
  store.syncOpenedDocumentParentFromHierarchy('doc-1', 'tree-parent')
  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.parentDocumentIdDraft).toBe('tree-parent')
  expect(tab?.savedParentDocumentId).toBe('tree-parent')
  expect(tab?.hasUnsavedChanges).toBe(true)
})

test('Test that S_FaOpenedDocuments moveActiveDocumentTab swaps the active tab and no-ops at boundaries', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-2',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      },
      {
        ...baseTab,
        documentId: 'doc-3',
        persistenceState: 'persisted',
        tabLabel: 'Place'
      }
    ]
  })

  store.moveActiveDocumentTab('left')
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-2', 'doc-1', 'doc-3'])
  expect(store.activeDocumentId).toBe('doc-2')

  store.moveActiveDocumentTab('right')
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-1', 'doc-2', 'doc-3'])

  store.moveActiveDocumentTab('left')
  store.moveActiveDocumentTab('left')
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-2', 'doc-1', 'doc-3'])

  store.moveActiveDocumentTab('left')
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-2', 'doc-1', 'doc-3'])
})

test('Test that S_FaOpenedDocuments moveDocumentTab moves the requested tab without changing activeDocumentId', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      },
      {
        ...baseTab,
        documentId: 'doc-3',
        persistenceState: 'persisted',
        tabLabel: 'Place'
      }
    ]
  })

  store.moveDocumentTab('doc-3', 'left')
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-1', 'doc-3', 'doc-2'])
  expect(store.activeDocumentId).toBe('doc-1')
})

test('Test that S_FaOpenedDocuments reorderDocumentTabs moves by index without changing activeDocumentId', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      },
      {
        ...baseTab,
        documentId: 'doc-3',
        persistenceState: 'persisted',
        tabLabel: 'Place'
      }
    ]
  })

  store.reorderDocumentTabs(0, 2)
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-2', 'doc-3', 'doc-1'])
  expect(store.activeDocumentId).toBe('doc-1')
})

test('Test that S_FaOpenedDocuments reorderDocumentTabs no-ops for invalid indexes', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      }
    ]
  })

  store.reorderDocumentTabs(0, 0)
  store.reorderDocumentTabs(0, 5)
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-1', 'doc-2'])
  expect(store.activeDocumentId).toBe('doc-1')
})

test('Test that S_FaOpenedDocuments requestCloseTab defers dirty tabs', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'Dirty Hero')
  store.requestCloseTab('doc-1')
  expect(store.pendingCloseDocumentId).toBe('doc-1')
})

test('Test that S_FaOpenedDocuments requestDeleteDocument opens pending delete for an open tab', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [baseTab]
  })

  store.requestDeleteDocument('doc-1')

  expect(store.pendingDeleteDocumentId).toBe('doc-1')
})

test('Test that S_FaOpenedDocuments dismissPendingDelete clears pending delete', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [baseTab]
  })
  store.requestDeleteDocument('doc-1')

  store.dismissPendingDelete()

  expect(store.pendingDeleteDocumentId).toBeNull()
})

test('Test that S_FaOpenedDocuments confirmDiscardAndClose navigates home when last tab closes', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  await store.confirmDiscardAndClose('doc-1')
  expect(store.tabs).toHaveLength(0)
  expect(navigateToWorkspaceHomeRouteMock).toHaveBeenCalled()
})

test('Test that confirmDiscardAndClose does not snapshot after the project changes during navigate', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  let resolveNavigate: ((value: undefined) => void) | undefined
  navigateToWorkspaceHomeRouteMock.mockImplementationOnce(() => {
    return new Promise<undefined>((resolve) => {
      resolveNavigate = resolve
    })
  })
  const pending = store.confirmDiscardAndClose('doc-1')
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (navigateToWorkspaceHomeRouteMock.mock.calls.length === 1) {
      break
    }
    await Promise.resolve()
  }
  saveOpenedDocumentsSnapshotMock.mockClear()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  resolveNavigate?.(undefined)
  await pending
  expect(saveOpenedDocumentsSnapshotMock).not.toHaveBeenCalled()
  navigateToWorkspaceHomeRouteMock.mockReset()
  navigateToWorkspaceHomeRouteMock.mockImplementation(async () => undefined)
})

test('Test that S_FaOpenedDocuments confirmDeleteOpenedDocument deletes tab and refreshes hierarchy tree', async () => {
  const refreshDocumentsInTreeMock = vi.fn()
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshDocumentsInTree = refreshDocumentsInTreeMock
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      }
    ]
  })

  await store.confirmDeleteOpenedDocument('doc-1')

  expect(deleteDocumentMock).toHaveBeenCalledWith('doc-1')
  expect(notifyCreateMock).toHaveBeenCalledWith({
    group: false,
    message: 'Document successfully deleted.',
    type: 'positive'
  })
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-2'])
  expect(store.activeDocumentId).toBe('doc-2')
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-2')
  expect(refreshDocumentsInTreeMock).not.toHaveBeenCalled()
  expect(store.pendingDeleteDocumentId).toBeNull()
})

test('Test that S_FaOpenedDocuments confirmDeleteOpenedDocument keeps the pending delete when delete fails', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [baseTab]
  })
  store.requestDeleteDocument('doc-1')
  deleteDocumentMock.mockRejectedValueOnce(new Error('delete failed'))
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await store.confirmDeleteOpenedDocument('doc-1')

  expect(store.pendingDeleteDocumentId).toBe('doc-1')
  expect(store.findTabByDocumentId('doc-1')).not.toBeNull()
  expect(notifyCreateMock).toHaveBeenCalledWith({
    faSkipNotifyConsoleLog: true,
    group: false,
    message: 'Could not delete the document.',
    type: 'negative'
  })
  expect(consoleErrorSpy).toHaveBeenCalled()
  consoleErrorSpy.mockRestore()
})

test('Test that S_FaOpenedDocuments syncActiveDocumentIdFromWorkspaceRoute ignores routes before hydration completes', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.syncActiveDocumentIdFromWorkspaceRoute('/home/document/doc-1')
  expect(store.activeDocumentId).toBeNull()
})

test('Test that S_FaOpenedDocuments syncActiveDocumentIdFromWorkspaceRoute clears active on home route', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.syncActiveDocumentIdFromWorkspaceRoute('/home')
  expect(store.activeDocumentId).toBeNull()
})

test('Test that S_FaOpenedDocuments clearSession resets tabs', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  await store.clearSession()
  expect(store.tabs).toEqual([])
  expect(store.hydrationComplete).toBe(false)
})

test('Test that S_FaOpenedDocuments closeTabsWithoutChangesExcept keeps dirty tabs and the except tab', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        displayNameDraft: 'Dirty',
        hasUnsavedChanges: true,
        savedDisplayName: 'Saved'
      },
      {
        ...baseTab,
        documentId: 'doc-3',
        persistenceState: 'persisted',
        tabLabel: 'Place'
      }
    ]
  })

  await store.closeTabsWithoutChangesExcept('doc-1')

  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-1', 'doc-2'])
  expect(store.activeDocumentId).toBe('doc-1')
})

test('Test that S_FaOpenedDocuments closeAllTabsWithoutChanges keeps only dirty tabs', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        displayNameDraft: 'Dirty',
        hasUnsavedChanges: true,
        savedDisplayName: 'Saved'
      },
      {
        ...baseTab,
        documentId: 'doc-3',
        persistenceState: 'persisted',
        tabLabel: 'Place'
      }
    ]
  })

  await store.closeAllTabsWithoutChanges()

  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-2'])
  expect(store.activeDocumentId).toBe('doc-2')
})

test('Test that S_FaOpenedDocuments forceCloseAllTabsExcept keeps only the except tab', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        displayNameDraft: 'Dirty',
        hasUnsavedChanges: true,
        savedDisplayName: 'Saved'
      },
      {
        ...baseTab,
        documentId: 'doc-3',
        persistenceState: 'persisted',
        tabLabel: 'Place'
      }
    ]
  })

  await store.forceCloseAllTabsExcept('doc-2')

  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-2'])
  expect(store.activeDocumentId).toBe('doc-2')
})

test('Test that S_FaOpenedDocuments forceCloseAllTabs clears every tab and navigates home', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        displayNameDraft: 'Dirty',
        hasUnsavedChanges: true,
        savedDisplayName: 'Saved'
      }
    ]
  })

  await store.forceCloseAllTabs()

  expect(store.tabs).toEqual([])
  expect(store.activeDocumentId).toBeNull()
  expect(navigateToWorkspaceHomeRouteMock).toHaveBeenCalled()
})

test('Test that forceCloseAllTabs does not snapshot after the project changes during navigate', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  let resolveNavigate: ((value: undefined) => void) | undefined
  navigateToWorkspaceHomeRouteMock.mockImplementationOnce(() => {
    return new Promise<undefined>((resolve) => {
      resolveNavigate = resolve
    })
  })
  const pending = store.forceCloseAllTabs()
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (navigateToWorkspaceHomeRouteMock.mock.calls.length === 1) {
      break
    }
    await Promise.resolve()
  }
  saveOpenedDocumentsSnapshotMock.mockClear()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  resolveNavigate?.(undefined)
  await pending
  expect(saveOpenedDocumentsSnapshotMock).not.toHaveBeenCalled()
  navigateToWorkspaceHomeRouteMock.mockReset()
  navigateToWorkspaceHomeRouteMock.mockImplementation(async () => undefined)
})

test('Test that a document delete does not close tabs after the project changes', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  let resolveDelete: ((value: undefined) => void) | undefined
  deleteDocumentMock.mockImplementationOnce(() => {
    return new Promise<undefined>((resolve) => {
      resolveDelete = resolve
    })
  })
  const pending = store.deleteOpenedDocument('doc-1')
  await Promise.resolve()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  resolveDelete?.(undefined)
  await pending
  expect(store.findTabByDocumentId('doc-1')).not.toBeNull()
})

test('Test that a document delete does not toast or snapshot after the project changes during navigate', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshLayout = vi.fn(async () => undefined)
  await store.hydrateFromProjectDatabase()
  let resolveNavigate: ((value: undefined) => void) | undefined
  navigateToWorkspaceHomeRouteMock.mockImplementationOnce(() => {
    return new Promise<undefined>((resolve) => {
      resolveNavigate = resolve
    })
  })
  const pending = store.deleteOpenedDocument('doc-1')
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (navigateToWorkspaceHomeRouteMock.mock.calls.length === 1) {
      break
    }
    await Promise.resolve()
  }
  saveOpenedDocumentsSnapshotMock.mockClear()
  notifyCreateMock.mockClear()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  resolveNavigate?.(undefined)
  await pending
  expect(saveOpenedDocumentsSnapshotMock).not.toHaveBeenCalled()
  expect(notifyCreateMock).not.toHaveBeenCalled()
  navigateToWorkspaceHomeRouteMock.mockReset()
  navigateToWorkspaceHomeRouteMock.mockImplementation(async () => undefined)
})

test('Test that a document delete does not bump census after the project changes during layout refresh', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  const bumpDocumentCensusRefreshGeneration = vi.fn()
  hierarchyStore.bumpDocumentCensusRefreshGeneration = bumpDocumentCensusRefreshGeneration
  let resolveRefresh: ((value: undefined) => void) | undefined
  const refreshLayout = vi.fn(() => {
    return new Promise<undefined>((resolve) => {
      resolveRefresh = resolve
    })
  })
  hierarchyStore.refreshLayout = refreshLayout
  await store.hydrateFromProjectDatabase()
  const pending = store.deleteOpenedDocument('doc-1')
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (refreshLayout.mock.calls.length === 1) {
      break
    }
    await Promise.resolve()
  }
  expect(store.findTabByDocumentId('doc-1')).toBeNull()
  saveOpenedDocumentsSnapshotMock.mockClear()
  notifyCreateMock.mockClear()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  const finishRefresh = resolveRefresh
  if (finishRefresh === undefined) {
    throw new Error('missing layout refresh resolver')
  }
  finishRefresh(undefined)
  await pending
  expect(bumpDocumentCensusRefreshGeneration).not.toHaveBeenCalled()
  expect(saveOpenedDocumentsSnapshotMock).not.toHaveBeenCalled()
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments deleteOpenedDocument removes tab and skips hierarchy refresh when tree has no loaded container', async () => {
  const refreshDocumentsInTreeMock = vi.fn()
  const refreshHierarchyTreeNodesMock = vi.fn()
  const refreshLayoutMock = vi.fn(async () => undefined)
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshDocumentsInTree = refreshDocumentsInTreeMock
  hierarchyStore.refreshHierarchyTreeNodes = refreshHierarchyTreeNodesMock
  hierarchyStore.refreshLayout = refreshLayoutMock
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      }
    ]
  })

  await store.deleteOpenedDocument('doc-1')

  expect(deleteDocumentMock).toHaveBeenCalledWith('doc-1')
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-2'])
  expect(store.activeDocumentId).toBe('doc-2')
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-2')
  expect(refreshDocumentsInTreeMock).not.toHaveBeenCalled()
  expect(refreshHierarchyTreeNodesMock).not.toHaveBeenCalled()
  expect(refreshLayoutMock).toHaveBeenCalledTimes(1)
  expect(hierarchyStore.documentCensusRefreshGeneration).toBe(1)
})

test('Test that S_FaOpenedDocuments deleteOpenedDocument queues hierarchy node refresh when document is in tree', async () => {
  const refreshHierarchyTreeNodesMock = vi.fn()
  const refreshDocumentsInTreeMock = vi.fn()
  const refreshLayoutMock = vi.fn(async () => undefined)
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshHierarchyTreeNodes = refreshHierarchyTreeNodesMock
  hierarchyStore.refreshDocumentsInTree = refreshDocumentsInTreeMock
  hierarchyStore.refreshLayout = refreshLayoutMock
  hierarchyStore.treeData = [
    {
      children: [
        {
          children: [],
          childrenLoaded: true,
          documentId: 'doc-1',
          groupId: null,
          hasChildren: false,
          icon: 'mdi-home',
          id: 'doc-1',
          label: 'Hero',
          nodeKind: 'document',
          placementId: 'placement-1',
          worldColor: '#ff0000',
          worldId: 'world-1'
        }
      ],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: 'mdi-home',
      id: 'placement-1',
      label: 'Buildings',
      nodeKind: 'templatePlacement',
      placementId: 'placement-1',
      worldColor: '#ff0000',
      worldId: 'world-1'
    }
  ]
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [baseTab]
  })

  await store.deleteOpenedDocument('doc-1')

  expect(refreshHierarchyTreeNodesMock).toHaveBeenCalledWith(['placement-1'])
  expect(refreshDocumentsInTreeMock).not.toHaveBeenCalled()
  expect(refreshLayoutMock).toHaveBeenCalledTimes(1)
  expect(hierarchyStore.treeData[0]?.children).toEqual([])
})

test('Test that S_FaOpenedDocuments createTemporaryDocument appends a temporary tab and navigates', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })

  expect(store.tabs).toHaveLength(2)
  const tempTab = store.tabs.find((tab) => tab.documentId === documentId)
  expect(tempTab?.persistenceState).toBe('temporary')
  expect(tempTab?.editState).toBe(true)
  expect(tempTab?.hasUnsavedChanges).toBe(false)
  expect(tempTab?.savedDisplayName).toBe('Aria')
  expect(store.activeDocumentId).toBe(documentId)
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith(documentId)
})

test('Test that S_FaOpenedDocuments createTemporaryDocumentCopyFromSource seeds a copied temporary tab', async () => {
  getDocumentByIdMock.mockImplementation(async (id: string) => {
    if (id === 'doc-1') {
      return {
        displayName: 'Hero',
        documentBackgroundColor: '#112233',
        documentTextColor: '#AABBCC',
        extraClasses: 'foo bar',
        id: 'doc-1',
        isCategory: true,
        isDead: false,
        isFinished: true,
        isMinor: true,
        parentDocumentId: 'doc-parent',
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    return {
      displayName: 'Hero',
      id,
      parentDocumentId: null
    }
  })

  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  const documentId = await store.createTemporaryDocumentCopyFromSource('doc-1')

  expect(documentId).not.toBeNull()
  const tempTab = store.tabs.find((tab) => tab.documentId === documentId)
  expect(tempTab?.persistenceState).toBe('temporary')
  expect(tempTab?.editState).toBe(true)
  expect(tempTab?.hasUnsavedChanges).toBe(false)
  expect(tempTab?.documentTextColorDraft).toBe('#AABBCC')
  expect(tempTab?.documentBackgroundColorDraft).toBe('#112233')
  expect(tempTab?.extraClassesDraft).toBe('foo bar')
  expect(tempTab?.savedExtraClasses).toBe('foo bar')
  expect(tempTab?.isCategoryDraft).toBe(true)
  expect(tempTab?.isFinishedDraft).toBe(true)
  expect(tempTab?.isMinorDraft).toBe(true)
  expect(tempTab?.isDeadDraft).toBe(false)
  expect(tempTab?.parentDocumentId).toBe('doc-parent')
  expect(tempTab?.temporaryParentResolveDocumentIds).toEqual(['doc-parent'])
  expect(store.activeDocumentId).toBe(documentId)
})

test('Test that S_FaOpenedDocuments createTemporaryDocumentCopyFromSource keeps a name saved during the read', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  let doc1Reads = 0
  getDocumentByIdMock.mockImplementation(async (id: string) => {
    if (id === 'doc-1') {
      doc1Reads += 1
      return {
        displayName: doc1Reads === 1 ? 'Hero' : 'Hero revised',
        id: 'doc-1',
        parentDocumentId: null,
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    return {
      displayName: 'Parent',
      id,
      parentDocumentId: null
    }
  })
  let resolveTemplate: ((value: {
    icon: string
    titlePluralTranslations: Record<string, string>
    titleSingularTranslations: Record<string, string>
  }) => void) | undefined
  getDocumentTemplateByIdMock.mockClear()
  getDocumentTemplateByIdMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveTemplate = resolve
    })
  })

  const pending = store.createTemporaryDocumentCopyFromSource('doc-1')
  await vi.waitUntil(() => resolveTemplate !== undefined)
  const finishTemplate = resolveTemplate
  if (finishTemplate === undefined) {
    throw new Error('missing template resolver')
  }
  finishTemplate({
    icon: 'fa-solid fa-file',
    titlePluralTranslations: { 'en-US': 'Notes' },
    titleSingularTranslations: { 'en-US': 'Note' }
  })
  const documentId = await pending

  expect(documentId).not.toBeNull()
  const tempTab = store.tabs.find((tab) => tab.documentId === documentId)
  expect(tempTab?.displayNameDraft).toContain('Hero revised')
})

test('Test that createTemporaryDocumentCopyFromSource returns null when the project changes during navigate', async () => {
  getDocumentByIdMock.mockImplementation(async (id: string) => {
    if (id === 'doc-1') {
      return {
        displayName: 'Hero',
        id: 'doc-1',
        parentDocumentId: null,
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    return {
      displayName: 'Hero',
      id,
      parentDocumentId: null
    }
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  navigateToOpenedDocumentRouteMock.mockClear()
  let resolveNavigate: ((value: undefined) => void) | undefined
  navigateToOpenedDocumentRouteMock.mockImplementationOnce(() => {
    return new Promise<undefined>((resolve) => {
      resolveNavigate = resolve
    })
  })
  const pending = store.createTemporaryDocumentCopyFromSource('doc-1')
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (navigateToOpenedDocumentRouteMock.mock.calls.length === 1) {
      break
    }
    await Promise.resolve()
  }
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  resolveNavigate?.(undefined)
  const documentId = await pending
  expect(documentId).toBeNull()
  navigateToOpenedDocumentRouteMock.mockReset()
  navigateToOpenedDocumentRouteMock.mockImplementation(async () => undefined)
})

test('Test that S_FaOpenedDocuments createTemporaryDocumentCopyFromSource returns null without template', async () => {
  getDocumentByIdMock.mockImplementation(async (id: string) => {
    if (id === 'doc-1') {
      return {
        displayName: 'Hero',
        id: 'doc-1',
        parentDocumentId: null,
        templateId: null,
        worldId: 'world-1'
      }
    }
    return {
      displayName: 'Hero',
      id
    }
  })

  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  const documentId = await store.createTemporaryDocumentCopyFromSource('doc-1')

  expect(documentId).toBeNull()
})

test('Test that S_FaOpenedDocuments createTemporaryDocumentCopyFromOpenedTab seeds from tab drafts', async () => {
  getDocumentByIdMock.mockImplementation(async (documentId: string) => {
    if (documentId === 'doc-1') {
      return {
        displayName: 'Hero',
        id: 'doc-1',
        parentDocumentId: 'doc-parent',
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    if (documentId === 'doc-parent') {
      return {
        displayName: 'Parent',
        id: 'doc-parent',
        parentDocumentId: null,
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    throw new Error('missing')
  })

  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [{
      ...baseTab,
      displayNameDraft: 'Ancient Hero',
      documentBackgroundColorDraft: '#112233',
      documentTextColorDraft: '#AABBCC',
      isCategoryDraft: true,
      isDeadDraft: true,
      isFinishedDraft: false,
      isMinorDraft: true,
      worldId: 'world-1'
    }]
  })

  const documentId = await store.createTemporaryDocumentCopyFromOpenedTab('doc-1')

  expect(documentId).not.toBeNull()
  const tempTab = store.tabs.find((tab) => tab.documentId === documentId)
  expect(tempTab?.displayNameDraft).toContain('Ancient Hero')
  expect(tempTab?.documentTextColorDraft).toBe('#AABBCC')
  expect(tempTab?.documentBackgroundColorDraft).toBe('#112233')
  expect(tempTab?.isCategoryDraft).toBe(true)
  expect(tempTab?.isFinishedDraft).toBe(false)
  expect(tempTab?.isMinorDraft).toBe(true)
  expect(tempTab?.isDeadDraft).toBe(true)
  expect(tempTab?.parentDocumentId).toBe('doc-parent')
  expect(tempTab?.temporaryParentResolveDocumentIds).toEqual(['doc-parent'])
  expect(tempTab?.hasUnsavedChanges).toBe(false)
  expect(store.activeDocumentId).toBe(documentId)
})

test('Test that createTemporaryDocumentCopyFromOpenedTab keeps an unsaved belongs-under edit', async () => {
  getDocumentByIdMock.mockImplementation(async (documentId: string) => {
    if (documentId === 'doc-1') {
      return {
        displayName: 'Hero',
        id: 'doc-1',
        parentDocumentId: 'doc-parent',
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    if (documentId === 'doc-parent' || documentId === 'typed-parent') {
      return {
        displayName: 'Parent',
        id: documentId,
        parentDocumentId: null,
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    throw new Error('missing')
  })

  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [{
      ...baseTab,
      parentDocumentIdDraft: 'typed-parent',
      savedParentDocumentId: 'doc-parent',
      worldId: 'world-1'
    }]
  })

  const documentId = await store.createTemporaryDocumentCopyFromOpenedTab('doc-1')
  const tempTab = store.tabs.find((tab) => tab.documentId === documentId)
  expect(tempTab?.parentDocumentId).toBe('typed-parent')
  expect(tempTab?.parentDocumentIdDraft).toBe('typed-parent')
  expect(tempTab?.temporaryParentResolveDocumentIds).toEqual(['typed-parent'])
})

test('Test that S_FaOpenedDocuments createTemporaryDocumentCopyFromOpenedTab keeps a name typed during the read', async () => {
  getDocumentByIdMock.mockImplementation(async (documentId: string) => {
    if (documentId === 'doc-1') {
      return {
        displayName: 'Hero',
        id: 'doc-1',
        parentDocumentId: null,
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    throw new Error('missing')
  })

  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [{
      ...baseTab,
      displayNameDraft: 'Hero',
      worldId: 'world-1'
    }]
  })
  let resolveWorld: ((value: { id: string }) => void) | undefined
  getWorldByIdMock.mockClear()
  getWorldByIdMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveWorld = resolve
    })
  })

  const pending = store.createTemporaryDocumentCopyFromOpenedTab('doc-1')
  await vi.waitUntil(() => getWorldByIdMock.mock.calls.length === 1)
  store.updateDisplayNameDraft('doc-1', 'Hero revised')
  const finishWorld = resolveWorld
  if (finishWorld === undefined) {
    throw new Error('missing world resolver')
  }
  finishWorld({ id: 'world-1' })
  const documentId = await pending

  expect(documentId).not.toBeNull()
  const tempTab = store.tabs.find((tab) => tab.documentId === documentId)
  expect(tempTab?.displayNameDraft).toContain('Hero revised')
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName on tab copy persists sibling parent from resolve chain', async () => {
  getDocumentByIdMock.mockImplementation(async (documentId: string) => {
    if (documentId === 'doc-1') {
      return {
        displayName: 'Hero',
        id: 'doc-1',
        parentDocumentId: 'doc-parent',
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    if (documentId === 'doc-parent') {
      return {
        displayName: 'Parent',
        id: 'doc-parent',
        parentDocumentId: null,
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    throw new Error('missing')
  })

  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [{
      ...baseTab,
      worldId: 'world-1'
    }]
  })

  const documentId = await store.createTemporaryDocumentCopyFromOpenedTab('doc-1')
  expect(documentId).not.toBeNull()

  await store.saveDocumentDisplayName(documentId as string, { keepEditMode: true })
  await vi.runAllTimersAsync()

  expect(createDocumentMock).toHaveBeenCalledWith(expect.objectContaining({
    parentDocumentId: 'doc-parent'
  }))
})

test('Test that S_FaOpenedDocuments createTemporaryDocumentCopyFromOpenedTab resolves template from database for persisted tabs', async () => {
  getDocumentByIdMock.mockImplementation(async (documentId: string) => {
    if (documentId === 'doc-1') {
      return {
        displayName: 'Hero',
        id: 'doc-1',
        parentDocumentId: 'doc-parent',
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    if (documentId === 'doc-parent') {
      return {
        displayName: 'Parent',
        id: 'doc-parent',
        parentDocumentId: null,
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    throw new Error('missing')
  })

  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [{
      ...baseTab,
      displayNameDraft: 'Ancient Hero',
      documentBackgroundColorDraft: '#112233',
      documentTextColorDraft: '#AABBCC',
      worldId: 'world-1'
    }]
  })

  const documentId = await store.createTemporaryDocumentCopyFromOpenedTab('doc-1')

  expect(documentId).not.toBeNull()
  expect(getDocumentByIdMock).toHaveBeenCalledWith('doc-1')
  const tempTab = store.tabs.find((tab) => tab.documentId === documentId)
  expect(tempTab?.displayNameDraft).toContain('Ancient Hero')
  expect(tempTab?.parentDocumentId).toBe('doc-parent')
})

test('Test that S_FaOpenedDocuments createTemporaryDocumentCopyFromOpenedTab returns null when database row has no template', async () => {
  getDocumentByIdMock.mockResolvedValue({
    displayName: 'Hero',
    id: 'doc-1',
    parentDocumentId: null,
    templateId: null,
    worldId: 'world-1'
  })

  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [baseTab]
  })

  const documentId = await store.createTemporaryDocumentCopyFromOpenedTab('doc-1')

  expect(documentId).toBeNull()
})

test('Test that S_FaOpenedDocuments createTemporaryDocumentUnderParentFromOpenedTab nests under temporary tab', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'temp-parent',
    tabs: [{
      displayNameDraft: 'Temp parent',
      documentBackgroundColorDraft: '',
      documentId: 'temp-parent',
      documentTextColorDraft: '',
      editState: true,
      hasUnsavedChanges: false,
      parentDocumentId: 'doc-root',
      persistenceState: 'temporary',
      savedDisplayName: 'Temp parent',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      savedDocumentTextColor: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account',
      templateId: 'tpl-1',
      temporaryParentResolveDocumentIds: ['doc-root'],
      worldId: 'world-1'
    }]
  })

  const documentId = await store.createTemporaryDocumentUnderParentFromOpenedTab('temp-parent')

  expect(documentId).not.toBeNull()
  const childTab = store.tabs.find((tab) => tab.documentId === documentId)
  expect(childTab?.parentDocumentId).toBe('temp-parent')
  expect(childTab?.temporaryParentResolveDocumentIds).toEqual(['temp-parent', 'doc-root'])
  expect(childTab?.displayNameDraft).toBe('New character')
  expect(store.activeDocumentId).toBe(documentId)
})

test('Test that S_FaOpenedDocuments createTemporaryDocument closes without discard when unchanged', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })

  store.requestCloseTab(documentId)
  await vi.runAllTimersAsync()

  expect(store.pendingCloseDocumentId).toBeNull()
  expect(store.tabs.some((tab) => tab.documentId === documentId)).toBe(false)
})

test('Test that S_FaOpenedDocuments createTemporaryDocument defers close after draft edits', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  store.updateDisplayNameDraft(documentId, 'Renamed Aria')

  store.requestCloseTab(documentId)

  expect(store.pendingCloseDocumentId).toBe(documentId)
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName promotes a temporary tab', async () => {
  const refreshHierarchyTreeNodesMock = vi.fn()
  const refreshDocumentsInTreeMock = vi.fn()
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshHierarchyTreeNodes = refreshHierarchyTreeNodesMock
  hierarchyStore.refreshDocumentsInTree = refreshDocumentsInTreeMock
  hierarchyStore.treeData = [
    {
      children: [
        {
          children: [],
          childrenLoaded: true,
          documentId: null,
          documentTemplateId: 'tpl-1',
          groupId: null,
          hasChildren: true,
          icon: 'mdi-home',
          id: 'placement-1',
          label: 'Characters',
          nodeKind: 'templatePlacement',
          placementId: 'placement-1',
          worldColor: '#ff0000',
          worldId: 'world-1'
        }
      ],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: 'mdi-earth',
      id: 'world-1',
      label: 'World',
      nodeKind: 'world',
      placementId: null,
      worldColor: '#ff0000',
      worldId: 'world-1'
    }
  ]
  await store.hydrateFromProjectDatabase()

  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  createDocumentMock.mockResolvedValueOnce({
    displayName: 'Aria',
    extraClasses: 'foo bar',
    id: documentId
  })
  store.updateExtraClassesDraft(documentId, 'foo bar')
  store.replaceOpenedDocumentTabs(store.tabs.map((tab) => {
    if (tab.documentId !== documentId) {
      return tab
    }
    return {
      ...tab,
      savedTags: [{
        id: 'tag-1',
        name: 'Quest'
      }]
    }
  }))

  await store.saveDocumentDisplayName(documentId, { keepEditMode: false })
  await vi.runAllTimersAsync()

  const savedTab = store.tabs.find((tab) => tab.documentId === documentId)
  expect(savedTab?.persistenceState).toBe('persisted')
  expect(createDocumentMock).toHaveBeenCalledWith({
    displayName: 'Aria',
    documentBackgroundColor: null,
    documentTextColor: null,
    id: documentId,
    isCategory: false,
    isDead: false,
    isFinished: false,
    isMinor: false,
    parentDocumentId: null,
    templateId: 'tpl-1',
    treeOrderNumber: Number.MIN_SAFE_INTEGER,
    extraClasses: 'foo bar',
    worldId: 'world-1'
  })
  expect(savedTab?.savedExtraClasses).toBe('foo bar')
  expect(savedTab?.extraClassesDraft).toBe('foo bar')
  expect(refreshHierarchyTreeNodesMock).toHaveBeenCalledWith(['placement-1'])
  expect(refreshDocumentsInTreeMock).not.toHaveBeenCalled()
  expect(recordDocumentLastOpenedMock).toHaveBeenCalledWith({ documentId })
  expect(hierarchyStore.documentCensusRefreshGeneration).toBe(1)
})

/**
 * saveDocumentDisplayName
 * Add-new on a placement must create in that placement, not an arbitrary template match.
 */
test('Test that S_FaOpenedDocuments saveDocumentDisplayName keeps the temporary placement', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    placementId: 'placement-2',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  createDocumentMock.mockResolvedValueOnce({
    displayName: 'Aria',
    id: documentId,
    placementId: 'placement-2'
  })

  await store.saveDocumentDisplayName(documentId, { keepEditMode: true })

  expect(createDocumentMock).toHaveBeenCalledWith(expect.objectContaining({
    parentDocumentId: null,
    placementId: 'placement-2'
  }))
})

/**
 * saveDocumentDisplayName
 * A child follows the parent's placement when that placement differs from the draft hint.
 */
test('Test that S_FaOpenedDocuments saveDocumentDisplayName uses the parent placement', async () => {
  getDocumentByIdMock.mockImplementation(async (id: string) => {
    if (id === 'doc-parent') {
      return {
        displayName: 'Parent',
        id: 'doc-parent',
        parentDocumentId: null,
        placementId: 'placement-b',
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    throw new Error(`Document not found: ${id}`)
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Child',
    parentDocumentId: 'doc-parent',
    placementId: 'placement-a',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  createDocumentMock.mockResolvedValueOnce({
    displayName: 'Child',
    id: documentId,
    placementId: 'placement-b'
  })

  await store.saveDocumentDisplayName(documentId, { keepEditMode: true })

  expect(createDocumentMock).toHaveBeenCalledWith(expect.objectContaining({
    parentDocumentId: 'doc-parent',
    placementId: 'placement-b'
  }))
})

/**
 * saveDocumentDisplayName
 * Temporary promote persists Tags draft via setDocumentTags after create.
 */
test('Test that S_FaOpenedDocuments saveDocumentDisplayName temporary promotes with tags draft', async () => {
  Object.assign(window.faContentBridgeAPIs.projectContent, {
    setDocumentTags: setDocumentTagsMock
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Tagged Temp',
    initialTagsDraft: [{
      id: 'tag-temp',
      isNew: true,
      name: 'TempTag'
    }],
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  createDocumentMock.mockResolvedValueOnce({
    displayName: 'Tagged Temp',
    id: documentId,
    isCategory: false,
    isDead: false,
    isFinished: false,
    isMinor: false,
    parentDocumentId: null,
    treeOrderNumber: Number.MIN_SAFE_INTEGER,
    documentBackgroundColor: null,
    documentTextColor: null,
    extraClasses: ''
  })
  setDocumentTagsMock.mockResolvedValueOnce({
    items: [{
      id: 'tag-saved',
      name: 'TempTag'
    }]
  })
  await store.saveDocumentDisplayName(documentId, { keepEditMode: true })
  await vi.runAllTimersAsync()
  expect(setDocumentTagsMock).toHaveBeenCalled()
  expect(store.findTabByDocumentId(documentId)?.savedTags).toEqual([{
    id: 'tag-saved',
    name: 'TempTag'
  }])
})

/**
 * saveDocumentDisplayName
 * First save of a new document reloads tag branches for the tags that were saved.
 */
test('Test that S_FaOpenedDocuments saveDocumentDisplayName refreshes tag branches for a new document', async () => {
  Object.assign(window.faContentBridgeAPIs.projectContent, {
    setDocumentTags: setDocumentTagsMock
  })
  const refreshHierarchyTreeNodesMock = vi.fn()
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshHierarchyTreeNodes = refreshHierarchyTreeNodesMock
  hierarchyStore.treeData = [{
    children: [],
    childrenLoaded: true,
    id: 'tag-node-saved',
    nodeKind: 'tag',
    tagId: 'tag-saved'
  } as unknown as I_faProjectHierarchyTreeHeTreeNode]
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Tagged Temp',
    initialTagsDraft: [{
      id: 'tag-temp',
      isNew: true,
      name: 'TempTag'
    }],
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  createDocumentMock.mockResolvedValueOnce({
    displayName: 'Tagged Temp',
    documentBackgroundColor: null,
    documentTextColor: null,
    extraClasses: '',
    id: documentId,
    isCategory: false,
    isDead: false,
    isFinished: false,
    isMinor: false,
    parentDocumentId: null,
    treeOrderNumber: Number.MIN_SAFE_INTEGER
  })
  setDocumentTagsMock.mockResolvedValueOnce({
    items: [{
      id: 'tag-saved',
      name: 'TempTag'
    }]
  })
  await store.saveDocumentDisplayName(documentId, { keepEditMode: true })
  await vi.runAllTimersAsync()
  expect(refreshHierarchyTreeNodesMock).toHaveBeenCalledWith(['tag-node-saved'])
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName reloads tag branches when the new document tab closes during create', async () => {
  Object.assign(window.faContentBridgeAPIs.projectContent, {
    setDocumentTags: setDocumentTagsMock
  })
  const refreshHierarchyTreeNodesMock = vi.fn()
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshHierarchyTreeNodes = refreshHierarchyTreeNodesMock
  hierarchyStore.treeData = [{
    children: [],
    childrenLoaded: true,
    id: 'tag-node-saved',
    nodeKind: 'tag',
    tagId: 'tag-saved'
  } as unknown as I_faProjectHierarchyTreeHeTreeNode]
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Tagged Temp',
    initialTagsDraft: [{
      id: 'tag-temp',
      isNew: true,
      name: 'TempTag'
    }],
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  let releaseCreate: (value: {
    displayName: string
    documentBackgroundColor: null
    documentTextColor: null
    extraClasses: string
    id: string
    isCategory: false
    isDead: false
    isFinished: false
    isMinor: false
    parentDocumentId: null
    treeOrderNumber: number
  }) => void = () => {}
  const createGate = new Promise<{
    displayName: string
    documentBackgroundColor: null
    documentTextColor: null
    extraClasses: string
    id: string
    isCategory: false
    isDead: false
    isFinished: false
    isMinor: false
    parentDocumentId: null
    treeOrderNumber: number
  }>((resolve) => {
    releaseCreate = resolve
  })
  createDocumentMock.mockImplementationOnce(() => createGate)
  setDocumentTagsMock.mockResolvedValueOnce({
    items: [{
      id: 'tag-saved',
      name: 'TempTag'
    }]
  })
  const savePromise = store.saveDocumentDisplayName(documentId, { keepEditMode: true })
  await vi.waitUntil(() => createDocumentMock.mock.calls.length === 1)
  await store.confirmDiscardAndClose(documentId)
  expect(store.tabs.some((tab) => tab.documentId === documentId)).toBe(false)
  releaseCreate({
    displayName: 'Tagged Temp',
    documentBackgroundColor: null,
    documentTextColor: null,
    extraClasses: '',
    id: documentId,
    isCategory: false,
    isDead: false,
    isFinished: false,
    isMinor: false,
    parentDocumentId: null,
    treeOrderNumber: Number.MIN_SAFE_INTEGER
  })
  await savePromise
  await vi.runAllTimersAsync()
  expect(setDocumentTagsMock).toHaveBeenCalled()
  expect(refreshHierarchyTreeNodesMock).toHaveBeenCalledWith(['tag-node-saved'])
  expect(store.tabs.some((tab) => tab.documentId === documentId)).toBe(false)
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName finishes when the tab closes during an update', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  let releaseUpdate: (value: {
    displayName: string
    id: string
    parentDocumentId: null
  }) => void = () => {}
  const updateGate = new Promise<{
    displayName: string
    id: string
    parentDocumentId: null
  }>((resolve) => {
    releaseUpdate = resolve
  })
  updateDocumentMock.mockImplementationOnce(() => updateGate)
  const savePromise = store.saveDocumentDisplayName('doc-1', { keepEditMode: true })
  await vi.waitUntil(() => updateDocumentMock.mock.calls.length === 1)
  await store.confirmDiscardAndClose('doc-1')
  expect(store.tabs.some((tab) => tab.documentId === 'doc-1')).toBe(false)
  releaseUpdate({
    displayName: 'Saved Hero',
    id: 'doc-1',
    parentDocumentId: null
  })
  await savePromise
  await vi.runAllTimersAsync()
  expect(store.tabs.some((tab) => tab.documentId === 'doc-1')).toBe(false)
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName remaps tab id when create substitutes', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    documentId: 'client-id',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  createDocumentMock.mockResolvedValueOnce({
    displayName: 'Aria',
    id: 'server-id'
  })

  await store.saveDocumentDisplayName(documentId, { keepEditMode: true })
  await vi.runAllTimersAsync()

  expect(store.tabs.some((tab) => tab.documentId === 'server-id')).toBe(true)
  expect(store.activeDocumentId).toBe('server-id')
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('server-id')
})

test('Test that a temporary document save does not snapshot after the project changes during id remap', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    documentId: 'client-id',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  createDocumentMock.mockResolvedValueOnce({
    displayName: 'Aria',
    id: 'server-id'
  })
  let resolveNavigate: ((value: undefined) => void) | undefined
  navigateToOpenedDocumentRouteMock.mockImplementationOnce(() => {
    return new Promise<undefined>((resolve) => {
      resolveNavigate = resolve
    })
  })
  const pending = store.saveDocumentDisplayName(documentId, { keepEditMode: true })
  const navigateCalls: unknown[][] = navigateToOpenedDocumentRouteMock.mock.calls
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (navigateCalls.some((call) => call[0] === 'server-id')) {
      break
    }
    await Promise.resolve()
  }
  saveOpenedDocumentsSnapshotMock.mockClear()
  setDocumentTagsMock.mockClear()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  resolveNavigate?.(undefined)
  await pending
  await vi.runAllTimersAsync()
  expect(saveOpenedDocumentsSnapshotMock).not.toHaveBeenCalled()
  expect(setDocumentTagsMock).not.toHaveBeenCalled()
  navigateToOpenedDocumentRouteMock.mockReset()
  navigateToOpenedDocumentRouteMock.mockImplementation(async () => undefined)
})

test('Test that S_FaOpenedDocuments hydrates temporary tabs from snapshot', async () => {
  getOpenedDocumentsSnapshotMock.mockResolvedValueOnce({
    activeDocumentId: 'temp-1',
    schemaVersion: 2,
    tabs: [{
      displayNameDraft: 'Aria',
      documentId: 'temp-1',
      editState: true,
      hasUnsavedChanges: true,
      parentDocumentId: null,
      persistenceState: 'temporary',
      savedDisplayName: '',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account',
      templateId: 'tpl-1',
      worldId: 'world-1'
    }]
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  expect(store.tabs).toHaveLength(1)
  expect(store.tabs[0]?.persistenceState).toBe('temporary')
})

test('Test that S_FaOpenedDocuments updateTemporaryDocumentParent updates parent metadata', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })

  await store.updateTemporaryDocumentParent(documentId, 'parent-1')
  await vi.runAllTimersAsync()

  const tab = store.tabs.find((entry) => entry.documentId === documentId)
  expect(tab?.parentDocumentId).toBe('parent-1')
})

test('Test that S_FaOpenedDocuments updateTemporaryDocumentParent follows a tab reorder during the lookup', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  let resolveParent: ((value: { id: string }) => void) | undefined
  getDocumentByIdMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveParent = resolve
    })
  })
  const pending = store.updateTemporaryDocumentParent(documentId, 'parent-1')
  await Promise.resolve()
  store.reorderDocumentTabs(1, 0)
  resolveParent?.({ id: 'parent-1' })
  await pending

  expect(store.tabs.map((tab) => tab.documentId)).toEqual([documentId, 'doc-1'])
  expect(store.findTabByDocumentId(documentId)?.parentDocumentId).toBe('parent-1')
  expect(store.findTabByDocumentId('doc-1')?.parentDocumentId).toBeUndefined()
})

test('Test that S_FaOpenedDocuments requestDeleteDocument opens pending delete for temporary tabs', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })

  store.requestDeleteDocument(documentId)

  expect(store.pendingDeleteDocumentId).toBe(documentId)
})

test('Test that S_FaOpenedDocuments createTemporaryDocument validates parent documents', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  const documentId = await store.createTemporaryDocument({
    displayName: 'Child',
    parentDocumentId: 'parent-1',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })

  expect(getDocumentByIdMock).toHaveBeenCalledWith('parent-1')
  expect(store.tabs.find((tab) => tab.documentId === documentId)?.parentDocumentId).toBe('parent-1')
})

test('Test that S_FaOpenedDocuments createTemporaryDocumentUnderParentDocument seeds nested temporary tab', async () => {
  getDocumentByIdMock.mockImplementation(async (documentId: string) => {
    if (documentId === 'doc-parent') {
      return {
        displayName: 'Parent',
        id: 'doc-parent',
        parentDocumentId: 'doc-grandparent',
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    if (documentId === 'doc-grandparent') {
      return {
        displayName: 'Grandparent',
        id: 'doc-grandparent',
        parentDocumentId: null,
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    throw new Error('missing')
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  const documentId = await store.createTemporaryDocumentUnderParentDocument('doc-parent')

  expect(documentId).not.toBeNull()
  const tab = store.tabs.find((row) => row.documentId === documentId)
  expect(tab?.parentDocumentId).toBe('doc-parent')
  expect(tab?.temporaryParentResolveDocumentIds).toEqual(['doc-parent', 'doc-grandparent'])
  expect(tab?.editState).toBe(true)
  expect(tab?.hasUnsavedChanges).toBe(false)
  expect(tab?.displayNameDraft).toBe('New character')
})

test('Test that createTemporaryDocumentUnderParentDocument returns null when the project changes before the tab opens', async () => {
  let templateCalls = 0
  let resolveSecondTemplate: ((value: {
    icon: string
    id: string
    titlePluralTranslations: { 'en-US': string }
    titleSingularTranslations: { 'en-US': string }
  }) => void) | undefined
  const template = {
    icon: 'mdi-account',
    id: 'tpl-1',
    titlePluralTranslations: { 'en-US': 'Characters' },
    titleSingularTranslations: { 'en-US': 'Character' }
  }
  getDocumentByIdMock.mockImplementation(async (documentId: string) => {
    if (documentId === 'doc-parent') {
      return {
        displayName: 'Parent',
        id: 'doc-parent',
        parentDocumentId: null,
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    throw new Error('missing')
  })
  getDocumentTemplateByIdMock.mockImplementation(() => {
    templateCalls += 1
    if (templateCalls >= 2) {
      return new Promise((resolve) => {
        resolveSecondTemplate = resolve
      })
    }
    return Promise.resolve(template)
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const tabCountBefore = store.tabs.length
  const pending = store.createTemporaryDocumentUnderParentDocument('doc-parent')
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (templateCalls >= 2) {
      break
    }
    await Promise.resolve()
  }
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  resolveSecondTemplate?.(template)
  const documentId = await pending
  expect(documentId).toBeNull()
  expect(store.tabs).toHaveLength(tabCountBefore)
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName under parent queues parent tree refresh', async () => {
  const refreshHierarchyTreeNodesMock = vi.fn()
  getDocumentByIdMock.mockImplementation(async (documentId: string) => {
    if (documentId === 'doc-parent') {
      return {
        displayName: 'Parent',
        id: 'doc-parent',
        parentDocumentId: null,
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    throw new Error('missing')
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshHierarchyTreeNodes = refreshHierarchyTreeNodesMock
  hierarchyStore.treeData = [
    {
      children: [
        {
          children: [
            {
              children: [],
              childrenLoaded: false,
              documentId: 'doc-parent',
              documentTemplateId: 'tpl-1',
              groupId: null,
              hasChildren: false,
              icon: 'mdi-account',
              id: 'doc-parent',
              label: 'Parent',
              nodeKind: 'document',
              placementId: 'placement-1',
              worldColor: '#ff0000',
              worldId: 'world-1'
            }
          ],
          childrenLoaded: true,
          documentId: null,
          documentTemplateId: 'tpl-1',
          groupId: null,
          hasChildren: true,
          icon: 'mdi-home',
          id: 'placement-1',
          label: 'Characters',
          nodeKind: 'templatePlacement',
          placementId: 'placement-1',
          worldColor: '#ff0000',
          worldId: 'world-1'
        }
      ],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: 'mdi-earth',
      id: 'world-1',
      label: 'World',
      nodeKind: 'world',
      placementId: null,
      worldColor: '#ff0000',
      worldId: 'world-1'
    }
  ]
  await store.hydrateFromProjectDatabase()

  const documentId = await store.createTemporaryDocumentUnderParentDocument('doc-parent')
  if (documentId === null) {
    throw new Error('expected temporary child')
  }

  await store.saveDocumentDisplayName(documentId, { keepEditMode: false })
  await vi.runAllTimersAsync()

  expect(refreshHierarchyTreeNodesMock).toHaveBeenCalledWith(['doc-parent'])
  expect(hierarchyStore.treeData[0]?.children[0]?.children[0]?.hasChildren).toBe(true)
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName resolves deleted parent to nearest ancestor', async () => {
  getDocumentByIdMock.mockImplementation(async (documentId: string) => {
    if (documentId === 'doc-parent') {
      return {
        displayName: 'Parent',
        id: 'doc-parent',
        parentDocumentId: 'doc-grandparent',
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    if (documentId === 'doc-grandparent') {
      return {
        displayName: 'Grandparent',
        id: 'doc-grandparent',
        parentDocumentId: null,
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    throw new Error('missing')
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  const documentId = await store.createTemporaryDocumentUnderParentDocument('doc-parent')
  if (documentId === null) {
    throw new Error('expected temporary child')
  }

  getDocumentByIdMock.mockImplementation(async (id: string) => {
    if (id === 'doc-parent') {
      throw new Error('Document not found: doc-parent')
    }
    if (id === 'doc-grandparent') {
      return {
        displayName: 'Grandparent',
        id: 'doc-grandparent',
        parentDocumentId: null,
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    throw new Error('missing')
  })

  await store.saveDocumentDisplayName(documentId, { keepEditMode: true })

  expect(createDocumentMock).toHaveBeenCalledWith(expect.objectContaining({
    parentDocumentId: 'doc-grandparent'
  }))
})

test('Test that S_FaOpenedDocuments createTemporaryDocument middle background appends without focusing', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const previousActive = store.activeDocumentId
  navigateToOpenedDocumentRouteMock.mockClear()

  const documentId = await store.createTemporaryDocument({
    displayName: 'Background',
    openMode: 'middleBackground',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })

  expect(store.findTabByDocumentId(documentId)).not.toBeNull()
  expect(store.activeDocumentId).toBe(previousActive)
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments createTemporaryDocument throws when project content APIs are missing', async () => {
  window.faContentBridgeAPIs = {
    projectContent: {
      getDocumentById: getDocumentByIdMock
    },
    projectManagement: {
      getOpenedDocumentsSnapshot: getOpenedDocumentsSnapshotMock,
      saveOpenedDocumentsSnapshot: saveOpenedDocumentsSnapshotMock
    }
  } as never
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  await expect(store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })).rejects.toThrow()
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName uses unnamed fallback for blank temporary drafts', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  store.updateDisplayNameDraft(documentId, '   ')

  await store.saveDocumentDisplayName(documentId, { keepEditMode: false })
  await vi.runAllTimersAsync()

  expect(createDocumentMock).toHaveBeenCalledWith(expect.objectContaining({
    displayName: 'Unnamed - Character'
  }))
})

test('Test that S_FaOpenedDocuments findTabByDocumentId returns null for missing tabs', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  expect(store.findTabByDocumentId('missing')).toBeNull()
})

test('Test that S_FaOpenedDocuments syncActiveDocumentIdFromWorkspaceRoute updates active tab from route', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.syncActiveDocumentIdFromWorkspaceRoute('/home/document/doc-1')

  expect(store.activeDocumentId).toBe('doc-1')
})

test('Test that syncActiveDocumentIdFromWorkspaceRoute bumps Last opened after a tab route change', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  const bumpDocumentLastOpenedRefreshGeneration = vi.fn()
  hierarchyStore.bumpDocumentLastOpenedRefreshGeneration = bumpDocumentLastOpenedRefreshGeneration
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        tabLabel: 'Villain'
      }
    ]
  })
  recordDocumentLastOpenedMock.mockClear()

  store.syncActiveDocumentIdFromWorkspaceRoute('/home/document/doc-2')
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (bumpDocumentLastOpenedRefreshGeneration.mock.calls.length === 1) {
      break
    }
    await Promise.resolve()
  }

  expect(store.activeDocumentId).toBe('doc-2')
  expect(recordDocumentLastOpenedMock).toHaveBeenCalledWith({ documentId: 'doc-2' })
  expect(bumpDocumentLastOpenedRefreshGeneration).toHaveBeenCalledTimes(1)
})

test('Test that S_FaOpenedDocuments updateTemporaryDocumentParent ignores persisted tabs', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  await store.updateTemporaryDocumentParent('doc-1', 'parent-1')

  expect(store.tabs[0]?.parentDocumentId).toBeUndefined()
})

test('Test that S_FaOpenedDocuments hydrate drops temporary tabs when world lookup fails', async () => {
  getOpenedDocumentsSnapshotMock.mockResolvedValueOnce({
    activeDocumentId: 'temp-1',
    schemaVersion: 2,
    tabs: [{
      displayNameDraft: 'Aria',
      documentId: 'temp-1',
      editState: true,
      hasUnsavedChanges: true,
      parentDocumentId: null,
      persistenceState: 'temporary',
      savedDisplayName: '',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account',
      templateId: 'tpl-1',
      worldId: 'world-1'
    }]
  })
  getWorldByIdMock.mockRejectedValueOnce(new Error('World not found: world-1'))
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  expect(store.tabs).toEqual([])
  expect(store.activeDocumentId).toBeNull()
})

test('Test that S_FaOpenedDocuments hydrateFromProjectDatabase ignores a snapshot from an older project', async () => {
  let resolveDocument: ((value: unknown) => void) | undefined
  getDocumentByIdMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveDocument = resolve
    })
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  const pendingOld = store.hydrateFromProjectDatabase()
  await vi.waitUntil(() => getDocumentByIdMock.mock.calls.length === 1)
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  getOpenedDocumentsSnapshotMock.mockResolvedValueOnce({
    ...FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT
  })
  await store.hydrateFromProjectDatabase()
  expect(store.tabs).toEqual([])
  expect(store.hydrationComplete).toBe(true)
  const finishDocument = resolveDocument
  if (finishDocument === undefined) {
    throw new Error('missing document resolver')
  }
  finishDocument({
    displayName: 'Stale Hero',
    id: 'doc-1'
  })
  await pendingOld
  expect(store.tabs).toEqual([])
  expect(store.hydrationComplete).toBe(true)
})

test('Test that hydrate keeps a document opened while the snapshot read is in flight', async () => {
  let releaseSnapshot: ((value: unknown) => void) | undefined
  getOpenedDocumentsSnapshotMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      releaseSnapshot = resolve
    })
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  const pending = store.hydrateFromProjectDatabase()
  await Promise.resolve()
  await Promise.resolve()
  await store.openFromTree('doc-2', 'leftNavigate', treeMeta)
  const finishSnapshot = releaseSnapshot
  if (finishSnapshot === undefined) {
    throw new Error('missing snapshot resolver')
  }
  finishSnapshot({
    ...FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT,
    activeDocumentId: 'doc-1',
    tabs: [baseTab]
  })
  await pending
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-1', 'doc-2'])
  expect(store.activeDocumentId).toBe('doc-2')
  expect(navigateToWorkspaceHomeRouteMock).not.toHaveBeenCalled()
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-2')
})

test('Test that hydrate does not go home when a document opens during the tab check', async () => {
  let releaseTabCheck: ((value: {
    displayName: string
    id: string
    parentDocumentId: null
    placementId: string
  }) => void) | undefined
  getDocumentByIdMock.mockImplementation((documentId: string) => {
    if (documentId === 'doc-1') {
      return new Promise((resolve) => {
        releaseTabCheck = resolve
      })
    }
    return Promise.resolve({
      displayName: 'Opened during check',
      id: documentId,
      parentDocumentId: null,
      placementId: 'placement-1'
    })
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  const pending = store.hydrateFromProjectDatabase()
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await Promise.resolve()
    if (releaseTabCheck !== undefined) {
      break
    }
  }
  const finishTabCheck = releaseTabCheck
  if (finishTabCheck === undefined) {
    throw new Error('missing tab-check resolver')
  }
  await store.openFromTree('doc-2', 'leftNavigate', treeMeta)
  finishTabCheck({
    displayName: 'Hero',
    id: 'doc-1',
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  await pending
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-1', 'doc-2'])
  expect(store.activeDocumentId).toBe('doc-2')
  expect(navigateToWorkspaceHomeRouteMock).not.toHaveBeenCalled()
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-2')
})

test('Test that S_FaOpenedDocuments hydrateFromProjectDatabase no-ops without an active project', async () => {
  S_FaActiveProject().clearActiveProject()
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  expect(store.tabs).toEqual([])
  expect(store.hydrationComplete).toBe(true)
  expect(getOpenedDocumentsSnapshotMock).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments flushPersistSnapshot returns false without an active project', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  S_FaActiveProject().clearActiveProject()
  await expect(store.flushPersistSnapshot()).resolves.toBe(false)
})

test('Test that S_FaOpenedDocuments requestCloseTab closes a clean tab immediately', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      }
    ]
  })

  store.requestCloseTab('doc-2')
  await vi.runAllTimersAsync()

  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-1'])
  expect(store.pendingCloseDocumentId).toBeNull()
})

test('Test that S_FaOpenedDocuments focusTab updates active tab and navigates', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      }
    ]
  })
  navigateToOpenedDocumentRouteMock.mockClear()

  await store.focusTab('doc-2')

  expect(store.activeDocumentId).toBe('doc-2')
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-2')
})

test('Test that focusTab bumps Last opened after the MRU write', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  const bumpDocumentLastOpenedRefreshGeneration = vi.fn()
  hierarchyStore.bumpDocumentLastOpenedRefreshGeneration = bumpDocumentLastOpenedRefreshGeneration
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      }
    ]
  })
  recordDocumentLastOpenedMock.mockClear()

  await store.focusTab('doc-2')

  expect(recordDocumentLastOpenedMock).toHaveBeenCalledWith({ documentId: 'doc-2' })
  expect(bumpDocumentLastOpenedRefreshGeneration).toHaveBeenCalledTimes(1)
})

test('Test that focusTab does not record last opened while a project open is in flight', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      }
    ]
  })
  navigateToOpenedDocumentRouteMock.mockClear()
  recordDocumentLastOpenedMock.mockClear()
  vi.spyOn(S_FaActiveProject(), 'isProjectReplacementInFlight').mockReturnValue(true)
  await store.focusTab('doc-2')
  expect(store.activeDocumentId).toBe('doc-1')
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalled()
  expect(recordDocumentLastOpenedMock).not.toHaveBeenCalled()
})

test('Test that focusTab does not record last opened after the project changes during navigate', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      }
    ]
  })
  recordDocumentLastOpenedMock.mockClear()
  let resolveNavigate: ((value: undefined) => void) | undefined
  navigateToOpenedDocumentRouteMock.mockImplementationOnce(() => {
    return new Promise<undefined>((resolve) => {
      resolveNavigate = resolve
    })
  })
  const pending = store.focusTab('doc-2')
  await Promise.resolve()
  vi.spyOn(S_FaActiveProject(), 'isProjectReplacementInFlight').mockReturnValue(true)
  resolveNavigate?.(undefined)
  await pending
  expect(recordDocumentLastOpenedMock).not.toHaveBeenCalled()
})

test('Test that focusTab does not record last opened after another tab is focused during navigate', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      }
    ]
  })
  recordDocumentLastOpenedMock.mockClear()
  let resolveDoc2: ((value: undefined) => void) | undefined
  navigateToOpenedDocumentRouteMock.mockImplementationOnce(() => {
    return new Promise<undefined>((resolve) => {
      resolveDoc2 = resolve
    })
  })
  const pending = store.focusTab('doc-2')
  await Promise.resolve()
  await store.focusTab('doc-1')
  resolveDoc2?.(undefined)
  await pending
  expect(store.activeDocumentId).toBe('doc-1')
  expect(recordDocumentLastOpenedMock).toHaveBeenCalledTimes(1)
  expect(recordDocumentLastOpenedMock).toHaveBeenCalledWith({ documentId: 'doc-1' })
})

test('Test that openFromTree does not steal focus when another tab is focused during load', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  recordDocumentLastOpenedMock.mockClear()
  navigateToOpenedDocumentRouteMock.mockClear()
  let releaseDocument: ((value: { displayName: string, id: string }) => void) | undefined
  getDocumentByIdMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      releaseDocument = resolve
    })
  })
  const pending = store.openFromTree('doc-2', 'leftNavigate', treeMeta)
  await Promise.resolve()
  await store.focusTab('doc-1')
  releaseDocument?.({
    displayName: 'Villain',
    id: 'doc-2'
  })
  await pending
  expect(store.activeDocumentId).toBe('doc-1')
  expect(store.tabs.map((tab) => tab.documentId)).toContain('doc-2')
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalledWith('doc-2')
  expect(recordDocumentLastOpenedMock).not.toHaveBeenCalledWith({ documentId: 'doc-2' })
})

test('Test that a later openFromTree keeps focus when an earlier open finishes first', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  navigateToOpenedDocumentRouteMock.mockClear()
  recordDocumentLastOpenedMock.mockClear()
  let releaseEarlier: ((value: { displayName: string, id: string }) => void) | undefined
  let releaseLater: ((value: { displayName: string, id: string }) => void) | undefined
  getDocumentByIdMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      releaseEarlier = resolve
    })
  })
  getDocumentByIdMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      releaseLater = resolve
    })
  })
  const earlierOpen = store.openFromTree('doc-2', 'leftNavigate', treeMeta)
  await Promise.resolve()
  await Promise.resolve()
  const laterOpen = store.openFromTree('doc-3', 'leftNavigate', {
    tabLabel: 'Later',
    templateIcon: 'mdi-account'
  })
  await Promise.resolve()
  await Promise.resolve()
  const finishEarlier = releaseEarlier
  const finishLater = releaseLater
  if (finishEarlier === undefined || finishLater === undefined) {
    throw new Error('missing document resolver')
  }
  finishEarlier({
    displayName: 'Earlier',
    id: 'doc-2'
  })
  await Promise.resolve()
  finishLater({
    displayName: 'Later',
    id: 'doc-3'
  })
  await earlierOpen
  await laterOpen
  expect(store.activeDocumentId).toBe('doc-3')
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-3')
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalledWith('doc-2')
  expect(recordDocumentLastOpenedMock).not.toHaveBeenCalledWith({ documentId: 'doc-2' })
  expect(recordDocumentLastOpenedMock).toHaveBeenCalledWith({ documentId: 'doc-3' })
})

test('Test that a tab close keeps focus when an earlier openFromTree finishes later', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  navigateToOpenedDocumentRouteMock.mockClear()
  navigateToWorkspaceHomeRouteMock.mockClear()
  let releaseOpen: ((value: { displayName: string, id: string }) => void) | undefined
  getDocumentByIdMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      releaseOpen = resolve
    })
  })
  const earlierOpen = store.openFromTree('doc-2', 'leftNavigate', treeMeta)
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await Promise.resolve()
    if (releaseOpen !== undefined) {
      break
    }
  }
  const finishOpen = releaseOpen
  if (finishOpen === undefined) {
    throw new Error('missing document resolver')
  }
  await store.confirmDiscardAndClose('doc-1')
  finishOpen({
    displayName: 'Earlier',
    id: 'doc-2'
  })
  await earlierOpen
  expect(store.activeDocumentId).toBeNull()
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-2'])
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalledWith('doc-2')
  expect(navigateToWorkspaceHomeRouteMock).toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments setDocumentEditState ignores unknown tabs and duplicate state', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.setDocumentEditState('missing', true)
  store.setDocumentEditState('doc-1', false)
  store.enterDocumentEditMode('doc-1')
  store.setDocumentEditState('doc-1', true)

  expect(store.tabs[0]?.editState).toBe(true)
})

test('Test that S_FaOpenedDocuments dismissPendingClose clears pending close state', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'Dirty Hero')
  store.requestCloseTab('doc-1')
  expect(store.pendingCloseDocumentId).toBe('doc-1')

  store.dismissPendingClose()

  expect(store.pendingCloseDocumentId).toBeNull()
})

test('Test that S_FaOpenedDocuments openFromTree ignores missing documents', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  getDocumentByIdMock.mockRejectedValueOnce(new Error('Document not found: doc-missing'))

  await store.openFromTree('doc-missing', 'leftNavigate', treeMeta)

  expect(store.tabs).toHaveLength(1)
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalledWith('doc-missing')
})

test('Test that S_FaOpenedDocuments openFromTree rejects when the document read fails', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  getDocumentByIdMock.mockRejectedValueOnce(new Error('database locked'))

  await expect(store.openFromTree('doc-locked', 'leftNavigate', treeMeta)).rejects.toThrow(
    'database locked'
  )
  expect(store.tabs).toHaveLength(1)
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalledWith('doc-locked')
})

test('Test that S_FaOpenedDocuments hydrate drops persisted tabs when document rows are missing', async () => {
  getOpenedDocumentsSnapshotMock.mockResolvedValueOnce({
    activeDocumentId: 'doc-missing',
    schemaVersion: 2,
    tabs: [{
      ...baseTab,
      documentId: 'doc-missing',
      persistenceState: 'persisted'
    }]
  })
  getDocumentByIdMock.mockRejectedValueOnce(new Error('Document not found: doc-missing'))
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  expect(store.tabs).toEqual([])
  expect(store.activeDocumentId).toBeNull()
})

test('Test that S_FaOpenedDocuments hydrate keeps persisted tabs when document read fails for another reason', async () => {
  getOpenedDocumentsSnapshotMock.mockResolvedValueOnce({
    activeDocumentId: 'doc-kept',
    schemaVersion: 2,
    tabs: [{
      ...baseTab,
      documentId: 'doc-kept',
      persistenceState: 'persisted'
    }]
  })
  getDocumentByIdMock.mockRejectedValueOnce(new Error('no active project database'))
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  expect(store.tabs).toHaveLength(1)
  expect(store.tabs[0]?.documentId).toBe('doc-kept')
  expect(store.activeDocumentId).toBe('doc-kept')
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName rejects empty persisted drafts', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', '   ')

  await expect(store.saveDocumentDisplayName('doc-1', { keepEditMode: false })).rejects.toThrow()
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName surfaces updateDocument failures', async () => {
  updateDocumentMock.mockRejectedValueOnce(new Error('write failed'))
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'Saved Hero')
  store.enterDocumentEditMode('doc-1')

  await expect(store.saveDocumentDisplayName('doc-1', { keepEditMode: false })).rejects.toThrow('write failed')
})

test('Test that S_FaOpenedDocuments moveActiveDocumentTab no-ops without an active tab', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: null,
    tabs: [baseTab]
  })

  store.moveActiveDocumentTab('left')

  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-1'])
})

test('Test that S_FaOpenedDocuments flushPersistSnapshotBeforeProjectReplacement waits for an in-flight snapshot write', async () => {
  let resolvePersist: ((value: boolean) => void) | undefined
  saveOpenedDocumentsSnapshotMock.mockImplementationOnce(() => new Promise<boolean>((resolve) => {
    resolvePersist = resolve
  }))
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'Dirty Hero')
  await vi.advanceTimersByTimeAsync(500)
  expect(saveOpenedDocumentsSnapshotMock).toHaveBeenCalledTimes(1)

  let replacementDone = false
  const replacement = store.flushPersistSnapshotBeforeProjectReplacement().then(() => {
    replacementDone = true
  })
  await Promise.resolve()
  expect(replacementDone).toBe(false)
  expect(saveOpenedDocumentsSnapshotMock).toHaveBeenCalledTimes(1)

  resolvePersist?.(true)
  await replacement

  expect(replacementDone).toBe(true)
  expect(saveOpenedDocumentsSnapshotMock).toHaveBeenCalledTimes(2)
})

test('Test that an opened-document snapshot does not write after the project changes', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  saveOpenedDocumentsSnapshotMock.mockClear()
  store.updateDisplayNameDraft('doc-1', 'Dirty Hero')
  const { nextTick } = await import('vue')
  await nextTick()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\b.faproject',
    id: 'project-b',
    name: 'B'
  })
  await vi.advanceTimersByTimeAsync(500)
  expect(saveOpenedDocumentsSnapshotMock).not.toHaveBeenCalled()
})

test('Test that an opened-document snapshot does not write during a project switch', async () => {
  await import('../S_FaProjectHierarchyTree')
  await import('../S_FaProjectSidebar')
  await import('app/src/scripts/floatingWindows/faProjectReplacementPersistHooksWiring')
  let releaseOpen: ((value: { outcome: 'canceled' }) => void) | undefined
  const projectManagement = window.faContentBridgeAPIs?.projectManagement
  if (projectManagement === undefined) {
    throw new Error('missing project management bridge')
  }
  Object.assign(projectManagement, {
    openProject: () => {
      return new Promise((resolve) => {
        releaseOpen = resolve
      })
    }
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  let openFailure: unknown = null
  const opening = S_FaActiveProject().openProjectFromKnownPath('C:\\b.faproject').then(
    () => undefined,
    (error: unknown) => {
      openFailure = error
    }
  )
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (releaseOpen !== undefined || openFailure !== null) {
      break
    }
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(0)
  }
  if (openFailure !== null) {
    throw openFailure
  }
  const finishOpen = releaseOpen
  if (finishOpen === undefined) {
    throw new Error('missing open resolver')
  }
  saveOpenedDocumentsSnapshotMock.mockClear()
  store.updateDisplayNameDraft('doc-1', 'Dirty Hero')
  await vi.advanceTimersByTimeAsync(500)
  expect(saveOpenedDocumentsSnapshotMock).not.toHaveBeenCalled()
  finishOpen({
    outcome: 'canceled'
  })
  await opening
})

test('Test that S_FaOpenedDocuments clearSession awaits an in-flight persist before reset', async () => {
  let resolvePersist: ((value: boolean) => void) | undefined
  saveOpenedDocumentsSnapshotMock.mockImplementationOnce(() => new Promise<boolean>((resolve) => {
    resolvePersist = resolve
  }))
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'Dirty Hero')
  await vi.advanceTimersByTimeAsync(500)
  const clearPromise = store.clearSession()
  resolvePersist?.(true)
  await clearPromise

  expect(store.tabs).toEqual([])
  expect(store.hydrationComplete).toBe(false)
})

test('Test that S_FaOpenedDocuments confirmDiscardAndClose navigates to the next tab when active tab closes', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      }
    ]
  })

  await store.confirmDiscardAndClose('doc-1')

  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-2'])
  expect(store.activeDocumentId).toBe('doc-2')
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-2')
})

test('Test that S_FaOpenedDocuments confirmDiscardAndClose keeps the active tab when a background tab closes', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      },
      {
        ...baseTab,
        documentId: 'doc-3',
        persistenceState: 'persisted',
        tabLabel: 'Place'
      }
    ]
  })
  navigateToOpenedDocumentRouteMock.mockClear()
  navigateToWorkspaceHomeRouteMock.mockClear()

  await store.confirmDiscardAndClose('doc-3')

  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-1', 'doc-2'])
  expect(store.activeDocumentId).toBe('doc-1')
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalled()
  expect(navigateToWorkspaceHomeRouteMock).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments confirmDiscardAndClose clears pending close when tab is missing', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'Dirty Hero')
  store.requestCloseTab('doc-1')
  expect(store.pendingCloseDocumentId).toBe('doc-1')

  await store.confirmDiscardAndClose('doc-missing')

  expect(store.pendingCloseDocumentId).toBeNull()
  expect(store.tabs).toHaveLength(1)
})

test('Test that S_FaOpenedDocuments deleteOpenedDocument discards temporary tabs without deleteDocument IPC', async () => {
  const refreshHierarchyTreeNodesMock = vi.fn()
  const refreshLayoutMock = vi.fn(async () => undefined)
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshHierarchyTreeNodes = refreshHierarchyTreeNodesMock
  hierarchyStore.refreshLayout = refreshLayoutMock
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  const temporaryTab = store.findTabByDocumentId(documentId)
  expect(temporaryTab).not.toBeNull()
  if (temporaryTab === null) {
    return
  }
  store.replaceSessionForComponentTesting({
    activeDocumentId: documentId,
    tabs: [temporaryTab]
  })
  deleteDocumentMock.mockClear()

  await store.deleteOpenedDocument(documentId)

  expect(deleteDocumentMock).not.toHaveBeenCalled()
  expect(refreshLayoutMock).not.toHaveBeenCalled()
  expect(notifyCreateMock).toHaveBeenCalledWith({
    group: false,
    message: 'Document successfully deleted.',
    type: 'positive'
  })
  expect(store.tabs).toHaveLength(0)
  expect(store.activeDocumentId).toBeNull()
  expect(navigateToWorkspaceHomeRouteMock).toHaveBeenCalled()
  expect(hierarchyStore.documentCensusRefreshGeneration).toBe(0)
})

test('Test that S_FaOpenedDocuments deleteOpenedDocument updates open child tabs to the promoted parent', async () => {
  getDocumentByIdMock.mockImplementation(async (id: string) => {
    if (id === 'doc-child' || id === 'doc-clean-child') {
      return {
        displayName: 'Child',
        id,
        parentDocumentId: 'doc-root'
      }
    }
    return {
      displayName: 'Hero',
      id,
      parentDocumentId: null
    }
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-child',
        hasUnsavedChanges: true,
        parentDocumentIdDraft: 'other-parent',
        savedParentDocumentId: 'doc-1',
        tabLabel: 'Edited child'
      },
      {
        ...baseTab,
        documentId: 'doc-clean-child',
        parentDocumentIdDraft: 'doc-1',
        savedParentDocumentId: 'doc-1',
        tabLabel: 'Clean child'
      }
    ]
  })

  await store.deleteOpenedDocument('doc-1')

  const edited = store.tabs.find((tab) => tab.documentId === 'doc-child')
  const clean = store.tabs.find((tab) => tab.documentId === 'doc-clean-child')
  expect(edited?.parentDocumentIdDraft).toBe('other-parent')
  expect(edited?.savedParentDocumentId).toBe('doc-root')
  expect(edited?.hasUnsavedChanges).toBe(true)
  expect(clean?.parentDocumentIdDraft).toBe('doc-root')
  expect(clean?.savedParentDocumentId).toBe('doc-root')
  expect(clean?.hasUnsavedChanges).toBe(false)
  expect(getDocumentByIdMock).toHaveBeenCalledWith('doc-child')
  expect(getDocumentByIdMock).toHaveBeenCalledWith('doc-clean-child')
})

test('Test that S_FaOpenedDocuments deleteOpenedDocument keeps drafts typed while child parents refresh', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-child',
        displayNameDraft: 'Child',
        hasUnsavedChanges: true,
        parentDocumentIdDraft: 'other-parent',
        savedDisplayName: 'Child',
        savedParentDocumentId: 'doc-1',
        tabLabel: 'Edited child'
      },
      {
        ...baseTab,
        documentId: 'doc-clean-child',
        parentDocumentIdDraft: 'doc-1',
        savedParentDocumentId: 'doc-1',
        tabLabel: 'Clean child'
      }
    ]
  })
  let releaseChildRead: (() => void) | undefined
  getDocumentByIdMock.mockImplementation((id: string) => {
    if (id === 'doc-child') {
      store.updateDisplayNameDraft('doc-child', 'Typed during delete')
      store.requestCloseTab('doc-clean-child')
      return new Promise((resolve) => {
        releaseChildRead = () => {
          resolve({
            displayName: 'Child',
            id,
            parentDocumentId: 'doc-root'
          })
        }
      })
    }
    return Promise.resolve({
      displayName: 'Child',
      id,
      parentDocumentId: 'doc-root'
    })
  })

  const pending = store.deleteOpenedDocument('doc-1')
  await vi.waitUntil(() => releaseChildRead !== undefined)
  releaseChildRead?.()
  await pending

  const edited = store.tabs.find((tab) => tab.documentId === 'doc-child')
  expect(edited?.displayNameDraft).toBe('Typed during delete')
  expect(edited?.parentDocumentIdDraft).toBe('other-parent')
  expect(edited?.savedParentDocumentId).toBe('doc-root')
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-child'])
})

test('Test that S_FaOpenedDocuments deleteOpenedDocument no-ops tab removal when document is not open', async () => {
  const refreshDocumentsInTreeMock = vi.fn()
  const refreshLayoutMock = vi.fn(async () => undefined)
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshDocumentsInTree = refreshDocumentsInTreeMock
  hierarchyStore.refreshLayout = refreshLayoutMock
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [baseTab]
  })

  await store.deleteOpenedDocument('doc-closed')

  expect(deleteDocumentMock).toHaveBeenCalledWith('doc-closed')
  expect(refreshLayoutMock).toHaveBeenCalledTimes(1)
  expect(notifyCreateMock).toHaveBeenCalledWith({
    group: false,
    message: 'Document successfully deleted.',
    type: 'positive'
  })
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-1'])
  expect(store.activeDocumentId).toBe('doc-1')
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalled()
  expect(hierarchyStore.documentCensusRefreshGeneration).toBe(1)
})

test('Test that S_FaOpenedDocuments closeAllTabsWithoutChanges no-ops when every tab has unsaved changes', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      {
        ...baseTab,
        hasUnsavedChanges: true
      },
      {
        ...baseTab,
        documentId: 'doc-2',
        hasUnsavedChanges: true,
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      }
    ]
  })

  await store.closeAllTabsWithoutChanges()

  expect(store.tabs).toHaveLength(2)
  expect(navigateToWorkspaceHomeRouteMock).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments hydrate skips validation when project content APIs are missing', async () => {
  window.faContentBridgeAPIs = {
    projectContent: {},
    projectManagement: {
      getOpenedDocumentsSnapshot: getOpenedDocumentsSnapshotMock,
      saveOpenedDocumentsSnapshot: saveOpenedDocumentsSnapshotMock
    }
  } as never
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  expect(store.tabs).toHaveLength(1)
})

test('Test that S_FaOpenedDocuments hydrate syncs clean tab display names from the database', async () => {
  getOpenedDocumentsSnapshotMock.mockResolvedValueOnce({
    activeDocumentId: 'doc-1',
    schemaVersion: 2,
    tabs: [{
      ...baseTab,
      displayNameDraft: 'Stale draft',
      hasUnsavedChanges: false,
      savedDisplayName: 'Stale draft'
    }]
  })
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Fresh Hero',
    id: 'doc-1'
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  expect(store.tabs[0]?.displayNameDraft).toBe('Fresh Hero')
  expect(store.tabs[0]?.savedDisplayName).toBe('Fresh Hero')
  expect(store.tabs[0]?.hasUnsavedChanges).toBe(false)
})

test('Test that S_FaOpenedDocuments hydrate falls back to the last tab when active document is missing', async () => {
  getOpenedDocumentsSnapshotMock.mockResolvedValueOnce({
    activeDocumentId: 'doc-missing',
    schemaVersion: 2,
    tabs: [
      baseTab,
      {
        ...baseTab,
        documentId: 'doc-2',
        persistenceState: 'persisted',
        tabLabel: 'Villain'
      }
    ]
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  expect(store.activeDocumentId).toBe('doc-2')
})

test('Test that S_FaOpenedDocuments openFromTree ignores missing project content APIs', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  window.faContentBridgeAPIs = {
    projectContent: {},
    projectManagement: {
      getOpenedDocumentsSnapshot: getOpenedDocumentsSnapshotMock,
      saveOpenedDocumentsSnapshot: saveOpenedDocumentsSnapshotMock
    }
  } as never

  await store.openFromTree('doc-2', 'leftNavigate', treeMeta)

  expect(store.tabs).toHaveLength(1)
})

test('Test that S_FaOpenedDocuments openFromTree middle background leaves an existing tab unfocused', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const previousActive = store.activeDocumentId
  navigateToOpenedDocumentRouteMock.mockClear()

  await store.openFromTree('doc-1', 'middleBackground', treeMeta)

  expect(store.tabs).toHaveLength(1)
  expect(store.activeDocumentId).toBe(previousActive)
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments updateTemporaryDocumentParent no-ops for unknown tabs', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  await store.updateTemporaryDocumentParent('missing', 'parent-1')

  expect(getDocumentByIdMock).not.toHaveBeenCalledWith('parent-1')
})

test('Test that S_FaOpenedDocuments updateTemporaryDocumentParent no-ops when project content APIs are missing', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  window.faContentBridgeAPIs = {
    projectContent: {},
    projectManagement: {
      getOpenedDocumentsSnapshot: getOpenedDocumentsSnapshotMock,
      saveOpenedDocumentsSnapshot: saveOpenedDocumentsSnapshotMock
    }
  } as never

  await store.updateTemporaryDocumentParent(documentId, 'parent-1')

  expect(store.tabs.find((tab) => tab.documentId === documentId)?.parentDocumentId).toBeNull()
})

test('Test that S_FaOpenedDocuments remapOpenedDocumentTabId no-ops for unknown tabs', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  await store.remapOpenedDocumentTabId('missing', 'doc-2')

  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalledWith('doc-2')
})

test('Test that S_FaOpenedDocuments remapOpenedDocumentTabId remaps active tab ids and navigates', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  navigateToOpenedDocumentRouteMock.mockClear()

  await store.remapOpenedDocumentTabId('doc-1', 'doc-remapped')

  expect(store.tabs[0]?.documentId).toBe('doc-remapped')
  expect(store.activeDocumentId).toBe('doc-remapped')
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-remapped')
})

test('Test that S_FaOpenedDocuments focusTab no-ops for unknown tabs', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  navigateToOpenedDocumentRouteMock.mockClear()

  await store.focusTab('missing')

  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments updateDisplayNameDraft no-ops for unknown tabs', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.updateDisplayNameDraft('missing', 'Renamed')

  expect(store.tabs[0]?.displayNameDraft).toBe('Hero')
})

test('Test that S_FaOpenedDocuments status flag draft updaters no-op for unknown tabs', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.updateIsFinishedDraft('missing', true)
  store.updateIsMinorDraft('missing', true)
  store.updateIsDeadDraft('missing', true)
  store.updateIsCategoryDraft('missing', true)

  expect(store.tabs[0]?.isFinishedDraft).toBe(false)
  expect(store.tabs[0]?.isMinorDraft).toBe(false)
  expect(store.tabs[0]?.isDeadDraft).toBe(false)
  expect(store.tabs[0]?.isCategoryDraft).toBe(false)
})

test('Test that S_FaOpenedDocuments hydrate keeps dirty status flag drafts', async () => {
  getOpenedDocumentsSnapshotMock.mockResolvedValueOnce({
    ...FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT,
    activeDocumentId: 'doc-1',
    tabs: [{
      ...baseTab,
      hasUnsavedChanges: true,
      isDeadDraft: true,
      isFinishedDraft: true,
      isMinorDraft: true,
      worldId: 'world-1'
    }]
  })
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Hero',
    documentBackgroundColor: null,
    documentTextColor: null,
    id: 'doc-1',
    isCategory: false,
    isDead: false,
    isFinished: false,
    isMinor: false,
    worldId: 'world-1'
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.isFinishedDraft).toBe(true)
  expect(tab?.isMinorDraft).toBe(true)
  expect(tab?.isDeadDraft).toBe(true)
  expect(tab?.hasUnsavedChanges).toBe(true)
})

test('Test that S_FaOpenedDocuments hydrate adopts saved status flags from the database', async () => {
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Hero',
    documentBackgroundColor: null,
    documentTextColor: null,
    id: 'doc-1',
    isCategory: false,
    isDead: true,
    isFinished: true,
    isMinor: true,
    worldId: 'world-1'
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.savedIsFinished).toBe(true)
  expect(tab?.savedIsMinor).toBe(true)
  expect(tab?.savedIsDead).toBe(true)
  expect(tab?.isFinishedDraft).toBe(true)
  expect(tab?.isMinorDraft).toBe(true)
  expect(tab?.isDeadDraft).toBe(true)
  expect(tab?.hasUnsavedChanges).toBe(false)
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName throws when the tab is missing', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  await expect(store.saveDocumentDisplayName('missing', { keepEditMode: false })).rejects.toThrow()
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName blurs the active element when exiting edit mode', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const input = document.createElement('input')
  document.body.append(input)
  input.focus()
  const blurSpy = vi.spyOn(input, 'blur')
  store.updateDisplayNameDraft('doc-1', 'Saved Hero')
  store.enterDocumentEditMode('doc-1')

  await store.saveDocumentDisplayName('doc-1', { keepEditMode: false })

  expect(blurSpy).toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName throws when temporary save APIs are missing', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  window.faContentBridgeAPIs = {
    projectContent: {
      getDocumentById: getDocumentByIdMock,
      getDocumentTemplateById: getDocumentTemplateByIdMock,
      getWorldById: getWorldByIdMock
    },
    projectManagement: {
      getOpenedDocumentsSnapshot: getOpenedDocumentsSnapshotMock,
      saveOpenedDocumentsSnapshot: saveOpenedDocumentsSnapshotMock
    }
  } as never

  await expect(store.saveDocumentDisplayName(documentId, { keepEditMode: false })).rejects.toThrow()
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName throws when persisted update APIs are missing', async () => {
  window.faContentBridgeAPIs = {
    projectContent: {
      getDocumentById: getDocumentByIdMock
    },
    projectManagement: {
      getOpenedDocumentsSnapshot: getOpenedDocumentsSnapshotMock,
      saveOpenedDocumentsSnapshot: saveOpenedDocumentsSnapshotMock
    }
  } as never
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'Saved Hero')

  await expect(store.saveDocumentDisplayName('doc-1', { keepEditMode: false })).rejects.toThrow()
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName surfaces non-Error temporary save failures', async () => {
  createDocumentMock.mockRejectedValueOnce('temporary failed')
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })

  await expect(store.saveDocumentDisplayName(documentId, { keepEditMode: false })).rejects.toThrow()
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName surfaces non-Error persisted save failures', async () => {
  updateDocumentMock.mockRejectedValueOnce('persisted failed')
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'Saved Hero')

  await expect(store.saveDocumentDisplayName('doc-1', { keepEditMode: false })).rejects.toThrow()
})

test('Test that S_FaOpenedDocuments requestCloseTab no-ops for unknown tabs', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.requestCloseTab('missing')

  expect(store.pendingCloseDocumentId).toBeNull()
})

test('Test that S_FaOpenedDocuments requestDeleteDocument opens pending delete for a closed persisted document', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.requestDeleteDocument('missing')

  expect(store.pendingDeleteDocumentId).toBe('missing')
})

test('Test that S_FaOpenedDocuments syncActiveDocumentIdFromWorkspaceRoute keeps active id when route document is not open', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.syncActiveDocumentIdFromWorkspaceRoute('/home/document/doc-missing')

  expect(store.activeDocumentId).toBe('doc-1')
})

test('Test that S_FaOpenedDocuments syncActiveDocumentIdFromWorkspaceRoute no-ops when active id already matches route', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  saveOpenedDocumentsSnapshotMock.mockClear()

  store.syncActiveDocumentIdFromWorkspaceRoute('/home/document/doc-1')
  await vi.advanceTimersByTimeAsync(500)

  expect(store.activeDocumentId).toBe('doc-1')
  expect(saveOpenedDocumentsSnapshotMock).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments updateDocumentTextColorDraft marks tabs dirty', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.updateDocumentTextColorDraft('doc-1', '#AABBCC')

  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.documentTextColorDraft).toBe('#AABBCC')
  expect(tab?.hasUnsavedChanges).toBe(true)
})

test('Test that S_FaOpenedDocuments updateDocumentBackgroundColorDraft marks tabs dirty', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.updateDocumentBackgroundColorDraft('doc-1', '#112233')

  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.documentBackgroundColorDraft).toBe('#112233')
  expect(tab?.hasUnsavedChanges).toBe(true)
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName persists appearance color drafts', async () => {
  updateDocumentMock.mockResolvedValueOnce({
    displayName: 'Saved Hero',
    documentBackgroundColor: '#112233',
    documentTextColor: '#AABBCC',
    id: 'doc-1'
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDocumentTextColorDraft('doc-1', '#aabbcc')
  store.updateDocumentBackgroundColorDraft('doc-1', ' #112233 ')

  await store.saveDocumentDisplayName('doc-1', { keepEditMode: false })
  await vi.runAllTimersAsync()

  expect(updateDocumentMock).toHaveBeenCalledWith('doc-1', {
    displayName: 'Hero',
    documentBackgroundColor: '#112233',
    documentTextColor: '#AABBCC',
    isCategory: false,
    isDead: false,
    isFinished: false,
    isMinor: false,
    treeOrderNumber: Number.MIN_SAFE_INTEGER,
    extraClasses: ''
  })
  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.savedDocumentTextColor).toBe('#AABBCC')
  expect(tab?.savedDocumentBackgroundColor).toBe('#112233')
  expect(tab?.hasUnsavedChanges).toBe(false)
})

test('Test that S_FaOpenedDocuments updateTreeOrderNumberDraft updates draft and schedules persist', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.updateTreeOrderNumberDraft('doc-1', '7')

  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.treeOrderNumberDraft).toBe('7')
  expect(tab?.hasUnsavedChanges).toBe(true)
  await vi.runAllTimersAsync()
  expect(saveOpenedDocumentsSnapshotMock).toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments updateExtraClassesDraft updates draft and schedules persist', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.updateExtraClassesDraft('doc-1', 'foo bar')

  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.extraClassesDraft).toBe('foo bar')
  expect(tab?.hasUnsavedChanges).toBe(true)
  await vi.runAllTimersAsync()
  expect(saveOpenedDocumentsSnapshotMock).toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments updateExtraClassesDraft ignores unknown document ids', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.updateExtraClassesDraft('missing-doc', 'foo bar')

  expect(store.findTabByDocumentId('missing-doc')).toBeNull()
  expect(saveOpenedDocumentsSnapshotMock).not.toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName persists extraClasses draft', async () => {
  updateDocumentMock.mockResolvedValueOnce({
    displayName: 'Hero',
    extraClasses: 'foo bar',
    id: 'doc-1'
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.updateExtraClassesDraft('doc-1', '  foo bar  ')

  await store.saveDocumentDisplayName('doc-1', { keepEditMode: false })
  await vi.runAllTimersAsync()

  expect(updateDocumentMock).toHaveBeenCalledWith('doc-1', expect.objectContaining({
    extraClasses: 'foo bar'
  }))
  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.savedExtraClasses).toBe('foo bar')
  expect(tab?.extraClassesDraft).toBe('foo bar')
  expect(tab?.hasUnsavedChanges).toBe(false)
})

test('Test that S_FaOpenedDocuments hydrate defaults missing tree order from database', async () => {
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Hero',
    id: 'doc-1'
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.savedTreeOrderNumber).toBe(Number.MIN_SAFE_INTEGER)
  expect(tab?.treeOrderNumberDraft).toBe('')
  expect(tab?.hasUnsavedChanges).toBe(false)
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName persists tree order drafts', async () => {
  updateDocumentMock.mockResolvedValueOnce({
    displayName: 'Hero',
    id: 'doc-1',
    treeOrderNumber: 7
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateTreeOrderNumberDraft('doc-1', '7')

  await store.saveDocumentDisplayName('doc-1', { keepEditMode: false })
  await vi.runAllTimersAsync()

  expect(updateDocumentMock).toHaveBeenCalledWith('doc-1', expect.objectContaining({
    treeOrderNumber: 7
  }))
  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.savedTreeOrderNumber).toBe(7)
  expect(tab?.treeOrderNumberDraft).toBe('7')
  expect(tab?.hasUnsavedChanges).toBe(false)
})

test('Test that S_FaOpenedDocuments hydrate reconciles appearance colors from project database', async () => {
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Hero',
    documentBackgroundColor: '#112233',
    documentTextColor: '#AABBCC',
    extraClasses: 'foo bar',
    id: 'doc-1',
    worldId: 'world-1'
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.savedDocumentTextColor).toBe('#AABBCC')
  expect(tab?.savedDocumentBackgroundColor).toBe('#112233')
  expect(tab?.documentTextColorDraft).toBe('#AABBCC')
  expect(tab?.documentBackgroundColorDraft).toBe('#112233')
  expect(tab?.savedExtraClasses).toBe('foo bar')
  expect(tab?.extraClassesDraft).toBe('foo bar')
})

test('Test that S_FaOpenedDocuments updateIsCategoryDraft marks tabs dirty', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.updateIsCategoryDraft('doc-1', true)

  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.isCategoryDraft).toBe(true)
  expect(tab?.hasUnsavedChanges).toBe(true)
})

test('Test that S_FaOpenedDocuments updateIsFinishedDraft marks tabs dirty', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.updateIsFinishedDraft('doc-1', true)

  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.isFinishedDraft).toBe(true)
  expect(tab?.hasUnsavedChanges).toBe(true)
})

test('Test that S_FaOpenedDocuments updateIsMinorDraft marks tabs dirty', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.updateIsMinorDraft('doc-1', true)

  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.isMinorDraft).toBe(true)
  expect(tab?.hasUnsavedChanges).toBe(true)
})

test('Test that S_FaOpenedDocuments updateIsDeadDraft marks tabs dirty', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  store.updateIsDeadDraft('doc-1', true)

  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.isDeadDraft).toBe(true)
  expect(tab?.hasUnsavedChanges).toBe(true)
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName persists status flag drafts', async () => {
  updateDocumentMock.mockResolvedValueOnce({
    displayName: 'Hero',
    documentBackgroundColor: null,
    documentTextColor: null,
    id: 'doc-1',
    isCategory: false,
    isDead: true,
    isFinished: true,
    isMinor: true
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateIsFinishedDraft('doc-1', true)
  store.updateIsMinorDraft('doc-1', true)
  store.updateIsDeadDraft('doc-1', true)

  await store.saveDocumentDisplayName('doc-1', { keepEditMode: false })
  await vi.runAllTimersAsync()

  expect(updateDocumentMock).toHaveBeenCalledWith('doc-1', expect.objectContaining({
    isDead: true,
    isFinished: true,
    isMinor: true
  }))
  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.savedIsFinished).toBe(true)
  expect(tab?.savedIsMinor).toBe(true)
  expect(tab?.savedIsDead).toBe(true)
  expect(tab?.hasUnsavedChanges).toBe(false)
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName refreshLayout when category changes', async () => {
  const refreshLayoutMock = vi.fn(async () => undefined)
  const refreshDocumentsInTreeMock = vi.fn()
  updateDocumentMock.mockResolvedValueOnce({
    displayName: 'Hero',
    documentBackgroundColor: null,
    documentTextColor: null,
    id: 'doc-1',
    isCategory: true
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshLayout = refreshLayoutMock
  hierarchyStore.refreshDocumentsInTree = refreshDocumentsInTreeMock
  await store.hydrateFromProjectDatabase()
  store.updateIsCategoryDraft('doc-1', true)

  await store.saveDocumentDisplayName('doc-1', { keepEditMode: false })
  await vi.runAllTimersAsync()

  expect(refreshLayoutMock).toHaveBeenCalled()
  expect(refreshDocumentsInTreeMock).toHaveBeenCalledWith(['doc-1'])
  expect(store.findTabByDocumentId('doc-1')?.savedIsCategory).toBe(true)
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName finishes when the temporary tab is missing after create', async () => {
  const tabDomain = await import('app/src/scripts/openedDocuments/functions/openedDocumentTabDomain')
  const originalFind = tabDomain.findOpenedDocumentTabIndexByDocumentId
  const findIndexSpy = vi.spyOn(tabDomain, 'findOpenedDocumentTabIndexByDocumentId')
  const refreshLayoutMock = vi.fn(async () => undefined)
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshLayout = refreshLayoutMock
  await store.hydrateFromProjectDatabase()
  const documentId = await store.createTemporaryDocument({
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })
  let lookupCount = 0
  findIndexSpy.mockImplementation((tabs, docId) => {
    if (docId === documentId) {
      lookupCount += 1
      if (lookupCount === 2) {
        return -1
      }
    }
    return originalFind(tabs, docId)
  })

  await store.saveDocumentDisplayName(documentId, { keepEditMode: false })

  expect(createDocumentMock).toHaveBeenCalled()
  expect(refreshLayoutMock).toHaveBeenCalled()
  findIndexSpy.mockRestore()
})

test('Test that S_FaOpenedDocuments requestCloseTab no-ops when indexed tab row is undefined', async () => {
  const tabDomain = await import('app/src/scripts/openedDocuments/functions/openedDocumentTabDomain')
  const findIndexSpy = vi.spyOn(tabDomain, 'findOpenedDocumentTabIndexByDocumentId')
    .mockReturnValue(0)
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: []
  })

  store.requestCloseTab('doc-1')

  expect(store.pendingCloseDocumentId).toBeNull()
  findIndexSpy.mockRestore()
})

test('Test that S_FaOpenedDocuments requestCloseTab no-ops when tab row is missing', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [undefined as unknown as I_faOpenedDocumentTab]
  })

  store.requestCloseTab('doc-1')

  expect(store.pendingCloseDocumentId).toBeNull()
})

test('Test that S_FaOpenedDocuments setDocumentEditState no-ops when tab row is missing', async () => {
  const tabDomain = await import('app/src/scripts/openedDocuments/functions/openedDocumentTabDomain')
  const findIndexSpy = vi.spyOn(tabDomain, 'findOpenedDocumentTabIndexByDocumentId')
    .mockReturnValue(0)
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: []
  })

  store.setDocumentEditState('doc-1', true)

  expect(store.tabs).toHaveLength(0)
  findIndexSpy.mockRestore()
})

test('Test that S_FaOpenedDocuments syncOpenedDocumentParentFromHierarchy no-ops when tab row is missing', async () => {
  const tabDomain = await import('app/src/scripts/openedDocuments/functions/openedDocumentTabDomain')
  const findIndexSpy = vi.spyOn(tabDomain, 'findOpenedDocumentTabIndexByDocumentId')
    .mockReturnValue(0)
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: []
  })

  store.syncOpenedDocumentParentFromHierarchy('doc-1', 'parent-2')

  expect(store.tabs).toHaveLength(0)
  findIndexSpy.mockRestore()
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName throws when parent move APIs are missing', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateParentDocumentIdDraft('doc-1', 'parent-2')
  window.faContentBridgeAPIs = {
    ...window.faContentBridgeAPIs,
    projectContent: {
      ...window.faContentBridgeAPIs?.projectContent,
      getDocumentById: getDocumentByIdMock,
      listPlacementDocumentChildren: listPlacementDocumentChildrenMock,
      moveDocumentInHierarchy: undefined,
      updateDocument: updateDocumentMock
    }
  } as never
  getDocumentByIdMock.mockResolvedValue({
    displayName: 'Hero',
    id: 'doc-1',
    parentDocumentId: null,
    placementId: 'placement-1',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })

  await expect(store.saveDocumentDisplayName('doc-1', { keepEditMode: true }))
    .rejects
    .toThrow('Could not save the document.')
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName rejects temporary tabs missing placement metadata', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'temp-1',
    tabs: [{
      ...baseTab,
      documentId: 'temp-1',
      persistenceState: 'temporary',
      templateId: undefined,
      worldId: undefined
    }]
  })

  await expect(store.saveDocumentDisplayName('temp-1', { keepEditMode: false })).rejects.toThrow()
})

/**
 * createTemporaryDocumentUnderParentDocument
 * Returns null when source document lookup rejects so ResultAsync error mapper runs.
 */
test('Test that S_FaOpenedDocuments createTemporaryDocumentUnderParentDocument returns null when source lookup fails', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  getDocumentByIdMock.mockRejectedValueOnce(new Error('Document not found: missing-source'))

  const documentId = await store.createTemporaryDocumentUnderParentDocument('missing-source')

  expect(documentId).toBeNull()
})

test('Test that S_FaOpenedDocuments createTemporaryDocumentUnderParentDocument rejects a document read failure', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  getDocumentByIdMock.mockRejectedValueOnce(new Error('database locked'))

  await expect(store.createTemporaryDocumentUnderParentDocument('missing-source')).rejects.toThrow(
    'database locked'
  )
})

/**
 * createTemporaryDocumentCopyFromSource
 * Returns null when source document lookup rejects so ResultAsync error mapper runs.
 */
test('Test that S_FaOpenedDocuments createTemporaryDocumentCopyFromSource returns null when source lookup fails', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  getDocumentByIdMock.mockRejectedValueOnce(new Error('Document not found: missing-source'))

  const documentId = await store.createTemporaryDocumentCopyFromSource('missing-source')

  expect(documentId).toBeNull()
})

test('Test that S_FaOpenedDocuments createTemporaryDocumentCopyFromSource rejects a document read failure', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  getDocumentByIdMock.mockRejectedValueOnce(new Error('database locked'))

  await expect(store.createTemporaryDocumentCopyFromSource('missing-source')).rejects.toThrow(
    'database locked'
  )
})

/**
 * updateTagsDraft
 * Updates tagsDraft and marks the tab dirty when draft differs from saved.
 */
test('Test that S_FaOpenedDocuments updateTagsDraft updates draft membership', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateTagsDraft('doc-1', [{
    id: 'tag-1',
    name: 'Heroes',
    isNew: true
  }])
  expect(store.findTabByDocumentId('doc-1')?.tagsDraft).toEqual([{
    id: 'tag-1',
    name: 'Heroes',
    isNew: true
  }])
  expect(store.findTabByDocumentId('doc-1')?.hasUnsavedChanges).toBe(true)
  store.updateTagsDraft('missing-doc', [])
})

/**
 * openFromTree
 * Seeds tagsDraft/savedTags from listDocumentTags when opening a new tab.
 */
test('Test that S_FaOpenedDocuments openFromTree seeds tags from listDocumentTags', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  Object.assign(window.faContentBridgeAPIs.projectContent, {
    listDocumentTags: listDocumentTagsMock
  })
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Tagged',
    id: 'doc-tagged',
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  listDocumentTagsMock.mockResolvedValueOnce({
    items: [{
      id: 'tag-1',
      name: 'Heroes'
    }]
  })
  await store.openFromTree('doc-tagged', 'leftNavigate', {
    tabLabel: 'Tagged',
    templateIcon: 'mdi-tag'
  })
  const tab = store.findTabByDocumentId('doc-tagged')
  expect(tab?.savedTags).toEqual([{
    id: 'tag-1',
    name: 'Heroes'
  }])
  expect(tab?.tagsDraft).toEqual([{
    id: 'tag-1',
    name: 'Heroes'
  }])
})

/**
 * openFromTree
 * Leaves tags unset when listDocumentTags rejects so a later save does not wipe them.
 */
test('Test that S_FaOpenedDocuments openFromTree tolerates listDocumentTags failures', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  Object.assign(window.faContentBridgeAPIs.projectContent, {
    listDocumentTags: listDocumentTagsMock
  })
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Tagged',
    id: 'doc-tagged-fail',
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  listDocumentTagsMock.mockRejectedValueOnce(new Error('tags failed'))
  await store.openFromTree('doc-tagged-fail', 'leftNavigate', {
    tabLabel: 'Tagged',
    templateIcon: 'mdi-tag'
  })
  const tab = store.findTabByDocumentId('doc-tagged-fail')
  expect(tab?.savedTags).toBeUndefined()
  expect(tab?.tagsDraft).toBeUndefined()
})

/**
 * saveDocumentDisplayName
 * Persists tags via setDocumentTags after a successful display-name save.
 */
test('Test that S_FaOpenedDocuments saveDocumentDisplayName refreshLayout when tags change', async () => {
  const refreshLayoutMock = vi.fn(async () => undefined)
  const refreshDocumentsInTreeMock = vi.fn()
  const refreshHierarchyTreeNodesMock = vi.fn()
  updateDocumentMock.mockResolvedValueOnce({
    displayName: 'Hero',
    documentBackgroundColor: null,
    documentTextColor: null,
    extraClasses: '',
    id: 'doc-1',
    isCategory: false,
    isDead: false,
    isFinished: false,
    isMinor: false,
    parentDocumentId: null,
    treeOrderNumber: Number.MIN_SAFE_INTEGER
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshLayout = refreshLayoutMock
  hierarchyStore.refreshDocumentsInTree = refreshDocumentsInTreeMock
  hierarchyStore.refreshHierarchyTreeNodes = refreshHierarchyTreeNodesMock
  await store.hydrateFromProjectDatabase()
  Object.assign(window.faContentBridgeAPIs.projectContent, {
    setDocumentTags: setDocumentTagsMock
  })
  store.updateTagsDraft('doc-1', [{
    id: 'tag-new',
    isNew: true,
    name: 'Places'
  }])
  setDocumentTagsMock.mockResolvedValueOnce({
    items: [{
      id: 'tag-saved',
      name: 'Places'
    }]
  })

  await store.saveDocumentDisplayName('doc-1', { keepEditMode: false })
  await vi.runAllTimersAsync()

  expect(refreshLayoutMock).toHaveBeenCalled()
  expect(refreshHierarchyTreeNodesMock).toHaveBeenCalled()
  expect(refreshDocumentsInTreeMock).toHaveBeenCalledWith(['doc-1'])
  expect(store.findTabByDocumentId('doc-1')?.savedTags).toEqual([{
    id: 'tag-saved',
    name: 'Places'
  }])
})

/**
 * saveDocumentDisplayName
 * A tag assigned while the document row is still saving still refreshes tag branches.
 */
test('Test that S_FaOpenedDocuments saveDocumentDisplayName refreshes tags assigned during the document write', async () => {
  let resolveUpdate: ((value: {
    displayName: string
    documentBackgroundColor: null
    documentTextColor: null
    extraClasses: string
    id: string
    isCategory: boolean
    isDead: boolean
    isFinished: boolean
    isMinor: boolean
    parentDocumentId: null
    treeOrderNumber: number
  }) => void) | undefined
  updateDocumentMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveUpdate = resolve
    })
  })
  const refreshLayoutMock = vi.fn(async () => undefined)
  const refreshHierarchyTreeNodesMock = vi.fn()
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshLayout = refreshLayoutMock
  hierarchyStore.refreshHierarchyTreeNodes = refreshHierarchyTreeNodesMock
  await store.hydrateFromProjectDatabase()
  Object.assign(window.faContentBridgeAPIs.projectContent, {
    setDocumentTags: setDocumentTagsMock
  })
  setDocumentTagsMock.mockResolvedValueOnce({
    items: [{
      id: 'tag-late',
      name: 'Late'
    }]
  })
  const pending = store.saveDocumentDisplayName('doc-1', { keepEditMode: true })
  await vi.waitUntil(() => updateDocumentMock.mock.calls.length === 1)
  store.updateTagsDraft('doc-1', [{
    id: 'tag-late',
    isNew: true,
    name: 'Late'
  }])
  const finishUpdate = resolveUpdate
  if (finishUpdate === undefined) {
    throw new Error('missing document update resolver')
  }
  finishUpdate({
    displayName: 'Hero',
    documentBackgroundColor: null,
    documentTextColor: null,
    extraClasses: '',
    id: 'doc-1',
    isCategory: false,
    isDead: false,
    isFinished: false,
    isMinor: false,
    parentDocumentId: null,
    treeOrderNumber: Number.MIN_SAFE_INTEGER
  })
  await pending
  await vi.runAllTimersAsync()
  expect(refreshLayoutMock).toHaveBeenCalled()
  expect(refreshHierarchyTreeNodesMock).toHaveBeenCalled()
  expect(store.findTabByDocumentId('doc-1')?.savedTags).toEqual([{
    id: 'tag-late',
    name: 'Late'
  }])
})

/**
 * saveDocumentDisplayName
 * Walks previousSavedTagIds when the tab already has saved tags.
 */
test('Test that S_FaOpenedDocuments saveDocumentDisplayName refreshes when clearing existing tags', async () => {
  const refreshLayoutMock = vi.fn(async () => undefined)
  const refreshHierarchyTreeNodesMock = vi.fn()
  updateDocumentMock.mockResolvedValueOnce({
    displayName: 'Hero',
    documentBackgroundColor: null,
    documentTextColor: null,
    extraClasses: '',
    id: 'doc-1',
    isCategory: false,
    isDead: false,
    isFinished: false,
    isMinor: false,
    parentDocumentId: null,
    treeOrderNumber: Number.MIN_SAFE_INTEGER
  })
  getOpenedDocumentsSnapshotMock.mockResolvedValueOnce({
    ...FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT,
    activeDocumentId: 'doc-1',
    tabs: [{
      ...baseTab,
      savedTags: [{
        id: 'tag-old',
        name: 'Old'
      }],
      tagsDraft: [{
        id: 'tag-old',
        name: 'Old'
      }]
    }]
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshLayout = refreshLayoutMock
  hierarchyStore.refreshHierarchyTreeNodes = refreshHierarchyTreeNodesMock
  await store.hydrateFromProjectDatabase()
  Object.assign(window.faContentBridgeAPIs.projectContent, {
    setDocumentTags: setDocumentTagsMock
  })
  store.updateTagsDraft('doc-1', [])
  setDocumentTagsMock.mockResolvedValueOnce({
    items: []
  })
  await store.saveDocumentDisplayName('doc-1', { keepEditMode: false })
  await vi.runAllTimersAsync()
  expect(refreshLayoutMock).toHaveBeenCalled()
  expect(store.findTabByDocumentId('doc-1')?.savedTags).toEqual([])
})

/**
 * replaceOpenedDocumentTabs
 * Replaces the session tab list without changing activeDocumentId.
 */
test('Test that S_FaOpenedDocuments replaceOpenedDocumentTabs replaces tabs array', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.replaceOpenedDocumentTabs([{
    ...baseTab,
    documentId: 'doc-replaced',
    displayNameDraft: 'Replaced',
    savedDisplayName: 'Replaced',
    tabLabel: 'Replaced'
  }])
  expect(store.tabs).toHaveLength(1)
  expect(store.tabs[0]?.documentId).toBe('doc-replaced')
})

test('Test that S_FaOpenedDocuments draft updates ignore a missing tab', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDocumentTextColorDraft('missing', '#112233')
  store.updateDocumentBackgroundColorDraft('missing', '#AABBCC')
  store.updateParentDocumentIdDraft('missing', 'parent-1')
  store.updateTreeOrderNumberDraft('missing', '4')
  store.syncOpenedDocumentParentFromHierarchy('missing', 'parent-1')
  expect(store.tabs[0]?.documentTextColorDraft).toBe('')
})

test('Test that S_FaOpenedDocuments draft updates ignore a stale tab index', async () => {
  const openedDocuments = await import('app/src/scripts/openedDocuments/openedDocuments_manager')
  const indexSpy = vi.spyOn(openedDocuments, 'findOpenedDocumentTabIndexByDocumentId')
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  indexSpy.mockReturnValue(0)
  store.replaceOpenedDocumentTabs([])
  store.updateDisplayNameDraft('doc-1', 'Renamed')
  store.updateDocumentTextColorDraft('doc-1', '#112233')
  store.updateDocumentBackgroundColorDraft('doc-1', '#AABBCC')
  store.updateIsCategoryDraft('doc-1', true)
  store.updateIsFinishedDraft('doc-1', true)
  store.updateIsMinorDraft('doc-1', true)
  store.updateIsDeadDraft('doc-1', true)
  store.updateParentDocumentIdDraft('doc-1', 'parent-1')
  store.updateTreeOrderNumberDraft('doc-1', '4')
  store.updateExtraClassesDraft('doc-1', 'fa-extra')
  store.updateTagsDraft('doc-1', [])
  store.syncOpenedDocumentParentFromHierarchy('doc-1', null)
  store.setDocumentEditState('doc-1', true)
  expect(store.tabs).toEqual([])
  indexSpy.mockRestore()
})

test('Test that createTemporaryDocumentCopyFromSource rejects a second document read failure', async () => {
  let reads = 0
  getDocumentByIdMock.mockImplementation(async () => {
    reads += 1
    if (reads === 1) {
      return {
        displayName: 'Hero',
        id: 'doc-1',
        parentDocumentId: null,
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    throw new Error('database locked')
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  reads = 0
  await expect(store.createTemporaryDocumentCopyFromSource('doc-1')).rejects.toThrow(
    'database locked'
  )
})

test('Test that createTemporaryDocumentCopyFromSource returns null when the live template is gone', async () => {
  let reads = 0
  getDocumentByIdMock.mockImplementation(async () => {
    reads += 1
    return {
      displayName: 'Hero',
      id: 'doc-1',
      parentDocumentId: null,
      templateId: reads === 1 ? 'tpl-1' : null,
      worldId: 'world-1'
    }
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  reads = 0
  await expect(store.createTemporaryDocumentCopyFromSource('doc-1')).resolves.toBeNull()
})

test('Test that createTemporaryDocumentCopyFromSource reloads a moved source template and parent', async () => {
  let reads = 0
  getDocumentByIdMock.mockImplementation(async (id: string) => {
    reads += 1
    if (reads === 1) {
      return {
        displayName: 'Hero',
        id: 'doc-1',
        parentDocumentId: null,
        templateId: 'tpl-1',
        worldId: 'world-1'
      }
    }
    return {
      displayName: 'Hero',
      id,
      parentDocumentId: 'doc-parent',
      templateId: 'tpl-2',
      worldId: 'world-2'
    }
  })
  getDocumentTemplateByIdMock.mockImplementation(async (id: string) => ({
    icon: 'mdi-account',
    id,
    titlePluralTranslations: { 'en-US': 'Places' },
    titleSingularTranslations: { 'en-US': 'Place' }
  }))
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  reads = 0
  const documentId = await store.createTemporaryDocumentCopyFromSource('doc-1')
  expect(documentId).not.toBeNull()
  const tempTab = store.tabs.find((tab) => tab.documentId === documentId)
  expect(tempTab?.parentDocumentId).toBe('doc-parent')
  expect(tempTab?.tabLabel).toBe('Places')
})

test('Test that saveDocumentDisplayName runs a queued save after the previous save rejects', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'Dirty Hero')
  let rejectUpdate: (error: Error) => void = () => undefined
  updateDocumentMock.mockImplementationOnce(() => {
    return new Promise((_resolve, reject) => {
      rejectUpdate = reject
    })
  })
  const firstSave = store.saveDocumentDisplayName('doc-1', { keepEditMode: true })
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (updateDocumentMock.mock.calls.length === 1) {
      break
    }
    await Promise.resolve()
  }
  const secondSave = store.saveDocumentDisplayName('doc-1', { keepEditMode: true })
  rejectUpdate(new Error('save-fail'))
  await expect(firstSave).rejects.toThrow('save-fail')
  await secondSave
  expect(updateDocumentMock).toHaveBeenCalledTimes(2)
})

test('Test that saveDocumentDisplayName rejects a temporary parent read that is not a missing row', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'temp-1',
    tabs: [{
      ...baseTab,
      displayNameDraft: 'Aria',
      documentId: 'temp-1',
      parentDocumentIdDraft: 'parent-1',
      persistenceState: 'temporary',
      placementId: 'placement-1',
      templateId: 'tpl-1',
      worldId: 'world-1'
    }]
  })
  let reads = 0
  getDocumentByIdMock.mockImplementation(async () => {
    reads += 1
    if (reads === 1) {
      return {
        id: 'parent-1',
        placementId: 'placement-1'
      }
    }
    throw new Error('database locked')
  })
  await expect(store.saveDocumentDisplayName('temp-1', { keepEditMode: true })).rejects.toThrow(
    'database locked'
  )
})

test('Test that S_FaOpenedDocuments hydrate ignores a snapshot after the project epoch moves', async () => {
  let resolveSnapshot: (value: unknown) => void = () => undefined
  getOpenedDocumentsSnapshotMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveSnapshot = resolve
    })
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  const pending = store.hydrateFromProjectDatabase()
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (getOpenedDocumentsSnapshotMock.mock.calls.length === 1) {
      break
    }
    await Promise.resolve()
  }
  S_FaActiveProject().clearActiveProject()
  resolveSnapshot({
    ...FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT,
    activeDocumentId: 'doc-1',
    tabs: [baseTab]
  })
  await pending
  expect(store.hydrationComplete).toBe(false)
})

test('Test that openFromTree skips a blank template icon when the document has no template', async () => {
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Hero',
    id: 'doc-blank',
    parentDocumentId: null,
    templateId: ''
  })
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  await store.openFromTree('doc-blank', 'leftNavigate', {
    tabLabel: 'Hero',
    templateIcon: '   '
  })
  expect(store.findTabByDocumentId('doc-blank')?.templateIcon).toBe('')
})

test('Test that saveDocumentDisplayName runs a queued save after the previous save settles', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'Dirty Hero')
  let resolveUpdate: (value: unknown) => void = () => undefined
  updateDocumentMock.mockImplementationOnce(() => {
    return new Promise((resolve) => {
      resolveUpdate = resolve
    })
  })
  const firstSave = store.saveDocumentDisplayName('doc-1', { keepEditMode: true })
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (updateDocumentMock.mock.calls.length === 1) {
      break
    }
    await Promise.resolve()
  }
  const secondSave = store.saveDocumentDisplayName('doc-1', { keepEditMode: true })
  resolveUpdate({
    displayName: 'Dirty Hero',
    id: 'doc-1',
    parentDocumentId: null
  })
  await firstSave
  await secondSave
  expect(updateDocumentMock.mock.calls.length).toBeGreaterThanOrEqual(2)
})
