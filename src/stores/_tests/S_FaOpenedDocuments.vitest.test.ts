/** @vitest-environment jsdom */
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
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
const moveDocumentInHierarchyMock = vi.fn()
const listPlacementDocumentChildrenMock = vi.fn()

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
  moveDocumentInHierarchyMock.mockReset()
  listPlacementDocumentChildrenMock.mockReset()
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
      listPlacementDocumentChildren: listPlacementDocumentChildrenMock,
      moveDocumentInHierarchy: moveDocumentInHierarchyMock,
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

test('Test that S_FaOpenedDocuments openFromTree middle background focuses new tab', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Villain',
    id: 'doc-2'
  })
  await store.openFromTree('doc-2', 'middleBackground', treeMeta)
  expect(store.tabs).toHaveLength(2)
  expect(store.activeDocumentId).toBe('doc-2')
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-2')
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
      savedParentDocumentId: 'parent-2'
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
    targetSortOrder: 1
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
      savedParentDocumentId: 'saved-parent'
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

test('Test that S_FaOpenedDocuments deleteOpenedDocument removes tab and skips hierarchy refresh when tree has no loaded container', async () => {
  const refreshDocumentsInTreeMock = vi.fn()
  const refreshHierarchyTreeNodesMock = vi.fn()
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshDocumentsInTree = refreshDocumentsInTreeMock
  hierarchyStore.refreshHierarchyTreeNodes = refreshHierarchyTreeNodesMock
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
        id: 'doc-1',
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
  expect(tempTab?.parentDocumentId).toBe('doc-parent')
  expect(tempTab?.temporaryParentResolveDocumentIds).toEqual(['doc-parent'])
  expect(store.activeDocumentId).toBe(documentId)
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
      worldId: 'world-1'
    }]
  })

  const documentId = await store.createTemporaryDocumentCopyFromOpenedTab('doc-1')

  expect(documentId).not.toBeNull()
  const tempTab = store.tabs.find((tab) => tab.documentId === documentId)
  expect(tempTab?.displayNameDraft).toContain('Ancient Hero')
  expect(tempTab?.documentTextColorDraft).toBe('#AABBCC')
  expect(tempTab?.documentBackgroundColorDraft).toBe('#112233')
  expect(tempTab?.parentDocumentId).toBe('doc-parent')
  expect(tempTab?.temporaryParentResolveDocumentIds).toEqual(['doc-parent'])
  expect(tempTab?.hasUnsavedChanges).toBe(false)
  expect(store.activeDocumentId).toBe(documentId)
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
    worldId: 'world-1'
  })
  expect(refreshHierarchyTreeNodesMock).toHaveBeenCalledWith(['placement-1'])
  expect(refreshDocumentsInTreeMock).not.toHaveBeenCalled()
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
      throw new Error('not found')
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

test('Test that S_FaOpenedDocuments createTemporaryDocument middle background focuses tab', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  navigateToOpenedDocumentRouteMock.mockClear()

  const documentId = await store.createTemporaryDocument({
    displayName: 'Background',
    openMode: 'middleBackground',
    templateId: 'tpl-1',
    worldId: 'world-1'
  })

  expect(store.activeDocumentId).toBe(documentId)
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith(documentId)
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
      tabLabel: 'Character',
      templateIcon: 'mdi-account',
      templateId: 'tpl-1',
      worldId: 'world-1'
    }]
  })
  getWorldByIdMock.mockRejectedValueOnce(new Error('missing'))
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  expect(store.tabs).toEqual([])
  expect(store.activeDocumentId).toBeNull()
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
  getDocumentByIdMock.mockRejectedValueOnce(new Error('missing'))

  await store.openFromTree('doc-missing', 'leftNavigate', treeMeta)

  expect(store.tabs).toHaveLength(1)
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalledWith('doc-missing')
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
  getDocumentByIdMock.mockRejectedValueOnce(new Error('missing'))
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()

  expect(store.tabs).toEqual([])
  expect(store.activeDocumentId).toBeNull()
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
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshHierarchyTreeNodes = refreshHierarchyTreeNodesMock
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
  expect(notifyCreateMock).toHaveBeenCalledWith({
    group: false,
    message: 'Document successfully deleted.',
    type: 'positive'
  })
  expect(store.tabs).toHaveLength(0)
  expect(store.activeDocumentId).toBeNull()
  expect(navigateToWorkspaceHomeRouteMock).toHaveBeenCalled()
})

test('Test that S_FaOpenedDocuments deleteOpenedDocument no-ops tab removal when document is not open', async () => {
  const refreshDocumentsInTreeMock = vi.fn()
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const { S_FaProjectHierarchyTree } = await import('../S_FaProjectHierarchyTree')
  const store = S_FaOpenedDocuments()
  const hierarchyStore = S_FaProjectHierarchyTree()
  hierarchyStore.refreshDocumentsInTree = refreshDocumentsInTreeMock
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [baseTab]
  })

  await store.deleteOpenedDocument('doc-closed')

  expect(deleteDocumentMock).toHaveBeenCalledWith('doc-closed')
  expect(notifyCreateMock).toHaveBeenCalledWith({
    group: false,
    message: 'Document successfully deleted.',
    type: 'positive'
  })
  expect(store.tabs.map((tab) => tab.documentId)).toEqual(['doc-1'])
  expect(store.activeDocumentId).toBe('doc-1')
  expect(navigateToOpenedDocumentRouteMock).not.toHaveBeenCalled()
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

test('Test that S_FaOpenedDocuments openFromTree middle background focuses an existing tab', async () => {
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
  await store.hydrateFromProjectDatabase()
  navigateToOpenedDocumentRouteMock.mockClear()

  await store.openFromTree('doc-1', 'middleBackground', treeMeta)

  expect(store.tabs).toHaveLength(1)
  expect(store.activeDocumentId).toBe('doc-1')
  expect(navigateToOpenedDocumentRouteMock).toHaveBeenCalledWith('doc-1')
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
    isMinor: false
  })
  const tab = store.findTabByDocumentId('doc-1')
  expect(tab?.savedDocumentTextColor).toBe('#AABBCC')
  expect(tab?.savedDocumentBackgroundColor).toBe('#112233')
  expect(tab?.hasUnsavedChanges).toBe(false)
})

test('Test that S_FaOpenedDocuments hydrate reconciles appearance colors from project database', async () => {
  getDocumentByIdMock.mockResolvedValueOnce({
    displayName: 'Hero',
    documentBackgroundColor: '#112233',
    documentTextColor: '#AABBCC',
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

test('Test that S_FaOpenedDocuments saveDocumentDisplayName throws when temporary tab is missing after create', async () => {
  const tabDomain = await import('app/src/scripts/openedDocuments/functions/openedDocumentTabDomain')
  const originalFind = tabDomain.findOpenedDocumentTabIndexByDocumentId
  const findIndexSpy = vi.spyOn(tabDomain, 'findOpenedDocumentTabIndexByDocumentId')
  const { S_FaOpenedDocuments } = await import('../S_FaOpenedDocuments')
  const store = S_FaOpenedDocuments()
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

  await expect(store.saveDocumentDisplayName(documentId, { keepEditMode: false })).rejects.toThrow()

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
