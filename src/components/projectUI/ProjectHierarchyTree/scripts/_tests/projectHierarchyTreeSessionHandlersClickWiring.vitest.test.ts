import { expect, test, vi } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeSessionHandlersClickWiring } from '../projectHierarchyTreeSessionHandlersClickWiring'

const leafDocument: I_faProjectHierarchyTreeHeTreeNode = {
  children: [],
  childrenLoaded: true,
  documentId: 'doc-leaf',
  groupId: null,
  hasChildren: false,
  icon: 'mdi-feather',
  id: 'doc-leaf',
  label: 'Leaf doc',
  nodeKind: 'document',
  placementId: 'placement-1',
  worldColor: '#000',
  worldId: 'world-1'
}

const addNewDocument: I_faProjectHierarchyTreeHeTreeNode = {
  children: [],
  childrenLoaded: true,
  documentId: null,
  documentTemplateId: 'template-1',
  groupId: null,
  hasChildren: false,
  icon: 'mdi-plus',
  id: 'placement-1__add-new',
  label: 'Add new character',
  nodeKind: 'addNewDocument',
  placementId: 'placement-1',
  titlePluralTranslations: { 'en-US': 'Characters' },
  titleSingularTranslations: { 'en-US': 'Character' },
  worldColor: '#336699',
  worldId: 'world-1'
}

test('Test that session click wiring routes add-new node clicks to add-new handlers', () => {
  const onAddNewDocumentRowClick = vi.fn()
  const onNodeClick = vi.fn()
  const wiring = createProjectHierarchyTreeSessionHandlersClickWiring({
    addNewDocumentClickHandlers: {
      onAddNewDocumentRowAuxClick: vi.fn(),
      onAddNewDocumentRowClick
    },
    documentOpenHandlers: {
      onDocumentRowAuxClick: vi.fn(),
      onNodeClick
    }
  })
  wiring.onNodeClick({
    children: [],
    data: addNewDocument
  })
  expect(onAddNewDocumentRowClick).toHaveBeenCalledWith(addNewDocument)
  expect(onNodeClick).not.toHaveBeenCalled()
})

test('Test that session click wiring routes document node clicks to document open handlers', () => {
  const onAddNewDocumentRowClick = vi.fn()
  const onNodeClick = vi.fn()
  const wiring = createProjectHierarchyTreeSessionHandlersClickWiring({
    addNewDocumentClickHandlers: {
      onAddNewDocumentRowAuxClick: vi.fn(),
      onAddNewDocumentRowClick
    },
    documentOpenHandlers: {
      onDocumentRowAuxClick: vi.fn(),
      onNodeClick
    }
  })
  wiring.onNodeClick({
    children: [],
    data: leafDocument
  })
  expect(onNodeClick).toHaveBeenCalledWith({
    children: [],
    data: leafDocument
  })
  expect(onAddNewDocumentRowClick).not.toHaveBeenCalled()
})

test('Test that session click wiring routes add-new aux clicks to add-new handlers', () => {
  const onAddNewDocumentRowAuxClick = vi.fn()
  const onDocumentRowAuxClick = vi.fn()
  const event = {
    button: 1,
    preventDefault: vi.fn()
  } as unknown as MouseEvent
  const wiring = createProjectHierarchyTreeSessionHandlersClickWiring({
    addNewDocumentClickHandlers: {
      onAddNewDocumentRowAuxClick,
      onAddNewDocumentRowClick: vi.fn()
    },
    documentOpenHandlers: {
      onDocumentRowAuxClick,
      onNodeClick: vi.fn()
    }
  })
  wiring.onDocumentRowAuxClick(addNewDocument, event)
  expect(onAddNewDocumentRowAuxClick).toHaveBeenCalledWith(addNewDocument, event)
  expect(onDocumentRowAuxClick).not.toHaveBeenCalled()
})

test('Test that session click wiring routes document aux clicks to document open handlers', () => {
  const onDocumentRowAuxClick = vi.fn()
  const event = {
    button: 1,
    preventDefault: vi.fn()
  } as unknown as MouseEvent
  const wiring = createProjectHierarchyTreeSessionHandlersClickWiring({
    addNewDocumentClickHandlers: {
      onAddNewDocumentRowAuxClick: vi.fn(),
      onAddNewDocumentRowClick: vi.fn()
    },
    documentOpenHandlers: {
      onDocumentRowAuxClick,
      onNodeClick: vi.fn()
    }
  })
  wiring.onDocumentRowAuxClick(leafDocument, event)
  expect(onDocumentRowAuxClick).toHaveBeenCalledWith(leafDocument, event)
})

test('Test that session click wiring prevents default on add-new context menu', () => {
  const wiring = createProjectHierarchyTreeSessionHandlersClickWiring({
    addNewDocumentClickHandlers: {
      onAddNewDocumentRowAuxClick: vi.fn(),
      onAddNewDocumentRowClick: vi.fn()
    },
    documentOpenHandlers: {
      onDocumentRowAuxClick: vi.fn(),
      onNodeClick: vi.fn()
    }
  })
  const event = {
    preventDefault: vi.fn()
  } as unknown as MouseEvent
  wiring.onAddNewDocumentRowContextMenu(event)
  expect(event.preventDefault).toHaveBeenCalled()
})
