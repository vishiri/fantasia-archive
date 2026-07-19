import { expect, test, vi } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { buildProjectHierarchyTreeDocumentButtonActionHandlers } from '../projectHierarchyTreeDocumentButtonActionWiring'

const documentNode: I_faProjectHierarchyTreeHeTreeNode = {
  children: [],
  childrenLoaded: true,
  documentId: 'doc-1',
  groupId: null,
  hasChildren: false,
  icon: '',
  id: 'doc-1',
  label: 'Doc',
  nodeKind: 'document',
  placementId: 'placement-1',
  worldColor: '#000',
  worldId: 'world-1'
}

/**
 * buildProjectHierarchyTreeDocumentButtonActionHandlers
 * Document-row buttons dispatch the same fa-actions as the context menu.
 */
test('Test that buildProjectHierarchyTreeDocumentButtonActionHandlers dispatches hierarchy tree document actions', () => {
  const runFaAction = vi.fn()
  const handlers = buildProjectHierarchyTreeDocumentButtonActionHandlers({
    runFaAction
  })

  handlers.onDocumentRowOpenButtonClick(documentNode)
  handlers.onDocumentRowEditButtonClick(documentNode)
  handlers.onDocumentRowAddUnderButtonClick(documentNode)

  expect(runFaAction).toHaveBeenNthCalledWith(1, 'openHierarchyTreeDocument', { documentId: 'doc-1' })
  expect(runFaAction).toHaveBeenNthCalledWith(2, 'editHierarchyTreeDocument', { documentId: 'doc-1' })
  expect(runFaAction).toHaveBeenNthCalledWith(3, 'addHierarchyTreeChildDocument', { documentId: 'doc-1' })
})

/**
 * buildProjectHierarchyTreeDocumentButtonActionHandlers
 * Non-document rows are ignored before fa-action dispatch.
 */
test('Test that buildProjectHierarchyTreeDocumentButtonActionHandlers ignores non-document rows', () => {
  const runFaAction = vi.fn()
  const handlers = buildProjectHierarchyTreeDocumentButtonActionHandlers({
    runFaAction
  })

  handlers.onDocumentRowOpenButtonClick({
    ...documentNode,
    documentId: null,
    nodeKind: 'group'
  })

  expect(runFaAction).not.toHaveBeenCalled()
})
