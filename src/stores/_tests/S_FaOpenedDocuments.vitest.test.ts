/** @vitest-environment jsdom */
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT } from 'app/types/I_faOpenedDocumentsDomain'

const {
  navigateToOpenedDocumentRouteMock,
  navigateToWorkspaceHomeRouteMock,
  deleteDocumentMock
} = vi.hoisted(() => ({
  navigateToOpenedDocumentRouteMock: vi.fn(async () => undefined),
  navigateToWorkspaceHomeRouteMock: vi.fn(async () => undefined),
  deleteDocumentMock: vi.fn(async () => undefined)
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
  deleteDocumentMock.mockReset()
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
      deleteDocument: deleteDocumentMock,
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
  await store.saveDocumentDisplayName('doc-1', { keepEditMode: false })
  expect(store.findTabByDocumentId('doc-1')?.savedDisplayName).toBe('Saved Hero')
  expect(hierarchyStore.pendingDocumentRefreshIds).toEqual(['doc-1'])
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
        tabLabel: 'Villain'
      },
      {
        ...baseTab,
        documentId: 'doc-3',
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
        tabLabel: 'Villain'
      },
      {
        ...baseTab,
        documentId: 'doc-3',
        tabLabel: 'Place'
      }
    ]
  })

  store.moveDocumentTab('doc-3', 'left')
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-1', 'doc-3', 'doc-2'])
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
        tabLabel: 'Villain'
      }
    ]
  })

  await store.confirmDeleteOpenedDocument('doc-1')

  expect(deleteDocumentMock).toHaveBeenCalledWith('doc-1')
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-2'])
  expect(store.activeDocumentId).toBe('doc-2')
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-2')
  expect(refreshDocumentsInTreeMock).toHaveBeenCalledWith(['doc-1'])
  expect(store.pendingDeleteDocumentId).toBeNull()
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
        displayNameDraft: 'Dirty',
        hasUnsavedChanges: true,
        savedDisplayName: 'Saved'
      },
      {
        ...baseTab,
        documentId: 'doc-3',
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
        displayNameDraft: 'Dirty',
        hasUnsavedChanges: true,
        savedDisplayName: 'Saved'
      },
      {
        ...baseTab,
        documentId: 'doc-3',
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
        displayNameDraft: 'Dirty',
        hasUnsavedChanges: true,
        savedDisplayName: 'Saved'
      },
      {
        ...baseTab,
        documentId: 'doc-3',
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

test('Test that S_FaOpenedDocuments deleteOpenedDocument removes tab and refreshes hierarchy tree', async () => {
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
        tabLabel: 'Villain'
      }
    ]
  })

  await store.deleteOpenedDocument('doc-1')

  expect(deleteDocumentMock).toHaveBeenCalledWith('doc-1')
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-2'])
  expect(store.activeDocumentId).toBe('doc-2')
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-2')
  expect(refreshDocumentsInTreeMock).toHaveBeenCalledWith(['doc-1'])
})

test('Test that S_FaOpenedDocuments deleteOpenedDocument queues hierarchy node refresh when document is in tree', async () => {
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
})
