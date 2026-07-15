import { expect, test, vi } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeDocumentOpenHandlers } from '../projectHierarchyTreeDocumentOpenHandlersWiring'

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

const parentDocument: I_faProjectHierarchyTreeHeTreeNode = {
  children: [],
  childrenLoaded: true,
  documentId: 'doc-parent',
  groupId: null,
  hasChildren: true,
  icon: 'mdi-folder',
  id: 'doc-parent',
  label: 'Parent doc',
  nodeKind: 'document',
  placementId: 'placement-1',
  worldColor: '#000',
  worldId: 'world-1'
}

/**
 * createProjectHierarchyTreeDocumentOpenHandlers
 * Left click opens leaf documents only.
 */
test('Test that document open handlers emit left navigate for leaf document rows', () => {
  const onDocumentOpenRequest = vi.fn()
  const handlers = createProjectHierarchyTreeDocumentOpenHandlers({
    onDocumentOpenRequest
  })
  handlers.onNodeClick({
    children: [],
    data: leafDocument
  })
  expect(onDocumentOpenRequest).toHaveBeenCalledWith(
    'doc-leaf',
    'leftNavigate',
    {
      tabLabel: 'Leaf doc',
      templateIcon: 'mdi-feather'
    }
  )
})

/**
 * createProjectHierarchyTreeDocumentOpenHandlers
 * Left click on parent document rows is ignored.
 */
test('Test that document open handlers ignore left click on parent document rows', () => {
  const onDocumentOpenRequest = vi.fn()
  const handlers = createProjectHierarchyTreeDocumentOpenHandlers({
    onDocumentOpenRequest
  })
  handlers.onNodeClick({
    children: [{}],
    data: parentDocument
  })
  expect(onDocumentOpenRequest).not.toHaveBeenCalled()
})

/**
 * createProjectHierarchyTreeDocumentOpenHandlers
 * Middle click opens parent documents with middleBackground open mode.
 */
test('Test that document open handlers emit middle background for parent document rows', () => {
  const onDocumentOpenRequest = vi.fn()
  const handlers = createProjectHierarchyTreeDocumentOpenHandlers({
    onDocumentOpenRequest
  })
  const event = {
    button: 1,
    preventDefault: vi.fn()
  } as unknown as MouseEvent
  handlers.onDocumentRowAuxClick(parentDocument, event)
  expect(event.preventDefault).toHaveBeenCalled()
  expect(onDocumentOpenRequest).toHaveBeenCalledWith(
    'doc-parent',
    'middleBackground',
    {
      tabLabel: 'Parent doc',
      templateIcon: 'mdi-folder'
    }
  )
})

test('Test that document open handlers ignore non-document node clicks', () => {
  const onDocumentOpenRequest = vi.fn()
  const handlers = createProjectHierarchyTreeDocumentOpenHandlers({
    onDocumentOpenRequest
  })
  handlers.onNodeClick({
    data: {
      ...leafDocument,
      documentId: null,
      nodeKind: 'templatePlacement'
    }
  })
  expect(onDocumentOpenRequest).not.toHaveBeenCalled()
})

test('Test that document open handlers ignore aux click on non-middle buttons', () => {
  const onDocumentOpenRequest = vi.fn()
  const handlers = createProjectHierarchyTreeDocumentOpenHandlers({
    onDocumentOpenRequest
  })
  handlers.onDocumentRowAuxClick(leafDocument, {
    button: 0,
    preventDefault: vi.fn()
  } as unknown as MouseEvent)
  expect(onDocumentOpenRequest).not.toHaveBeenCalled()
})

test('Test that document open handlers ignore aux click on non-document rows', () => {
  const onDocumentOpenRequest = vi.fn()
  const handlers = createProjectHierarchyTreeDocumentOpenHandlers({
    onDocumentOpenRequest
  })
  handlers.onDocumentRowAuxClick({
    ...leafDocument,
    documentId: null,
    nodeKind: 'world'
  }, {
    button: 1,
    preventDefault: vi.fn()
  } as unknown as MouseEvent)
  expect(onDocumentOpenRequest).not.toHaveBeenCalled()
})

test('Test that document open handlers ignore add-new document node clicks', () => {
  const onDocumentOpenRequest = vi.fn()
  const handlers = createProjectHierarchyTreeDocumentOpenHandlers({
    onDocumentOpenRequest
  })
  handlers.onNodeClick({
    data: {
      ...leafDocument,
      documentId: null,
      documentTemplateId: 'template-1',
      id: 'placement-1__add-new',
      nodeKind: 'addNewDocument'
    }
  })
  handlers.onDocumentRowAuxClick({
    ...leafDocument,
    documentId: null,
    documentTemplateId: 'template-1',
    id: 'placement-1__add-new',
    nodeKind: 'addNewDocument'
  }, {
    button: 1,
    preventDefault: vi.fn()
  } as unknown as MouseEvent)
  expect(onDocumentOpenRequest).not.toHaveBeenCalled()
})
