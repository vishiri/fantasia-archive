/** @vitest-environment jsdom */
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT } from 'app/types/I_faOpenedDocumentsDomain'

const {
  navigateToOpenedDocumentRouteMock,
  navigateToWorkspaceHomeRouteMock
} = vi.hoisted(() => ({
  navigateToOpenedDocumentRouteMock: vi.fn(async () => undefined),
  navigateToWorkspaceHomeRouteMock: vi.fn(async () => undefined)
}))

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

const baseTab: I_faOpenedDocumentTab = {
  documentId: 'doc-1',
  tabLabel: 'Hero',
  templateIcon: 'mdi-account',
  displayNameDraft: 'Hero',
  savedDisplayName: 'Hero',
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
  getDocumentByIdMock.mockResolvedValue({
    displayName: 'Hero',
    id: 'doc-1'
  })
  updateDocumentMock.mockResolvedValue({
    displayName: 'Saved Hero',
    id: 'doc-1'
  })
  getOpenedDocumentsSnapshotMock.mockResolvedValue({
    ...FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT,
    activeDocumentId: 'doc-1',
    tabs: [baseTab]
  })
  window.faContentBridgeAPIs = {
    projectContent: {
      getDocumentById: getDocumentByIdMock,
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
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-1')
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

test('Test that S_FaOpenedDocuments openFromTree middle background keeps active tab', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Villain',
    id: 'doc-2'
  })
  await store.openFromTree('doc-2', 'middleBackground', treeMeta)
  expect(store.tabs).toHaveLength(2)
  expect(store.activeDocumentId).toBe('doc-1')
})

test('Test that S_FaOpenedDocuments saveDocumentDisplayName persists and queues tree refresh', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'Saved Hero')
  store.enterDocumentEditMode('doc-1')
  const saved = await store.saveDocumentDisplayName('doc-1', { keepEditMode: false })
  expect(saved).toBe(true)
  expect(store.findTabByDocumentId('doc-1')?.savedDisplayName).toBe('Saved Hero')
  expect(hierarchyStore.pendingDocumentRefreshIds).toEqual(['doc-1'])
})

test('Test that S_FaOpenedDocuments requestCloseTab defers dirty tabs', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  store.updateDisplayNameDraft('doc-1', 'Dirty Hero')
  store.requestCloseTab('doc-1')
  expect(store.pendingCloseDocumentId).toBe('doc-1')
})

test('Test that S_FaOpenedDocuments confirmDiscardAndClose navigates home when last tab closes', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  await store.confirmDiscardAndClose('doc-1')
  expect(store.tabs).toHaveLength(0)
  expect(navigateToWorkspaceHomeRouteMock).toHaveBeenCalled()
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
