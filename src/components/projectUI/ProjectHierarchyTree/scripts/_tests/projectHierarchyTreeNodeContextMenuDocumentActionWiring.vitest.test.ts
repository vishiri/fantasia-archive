import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers } from '../projectHierarchyTreeNodeContextMenuDocumentActionWiring'

const documentNode: I_faProjectHierarchyTreeHeTreeNode = {
  children: [],
  childrenLoaded: true,
  documentBackgroundColor: '#112233',
  documentId: 'doc-a',
  documentTextColor: '#AABBCC',
  groupId: 'group-1',
  hasChildren: false,
  icon: '',
  id: 'doc-a',
  label: 'Hero',
  nodeKind: 'document',
  placementId: 'placement-1',
  worldColor: '#000',
  worldId: 'world-1'
}

test('Test that buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers dispatches open through runFaAction', () => {
  const runFaAction = vi.fn()
  const handlers = buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers({
    contextMenuAnchorNodeId: ref('doc-a'),
    runFaAction,
    treeData: ref([documentNode])
  })

  handlers.onOpenDocumentClick()

  expect(runFaAction).toHaveBeenCalledWith('openHierarchyTreeDocument', { documentId: 'doc-a' })
})

test('Test that buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers dispatches edit through runFaAction', () => {
  const runFaAction = vi.fn()
  const handlers = buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers({
    contextMenuAnchorNodeId: ref('doc-a'),
    runFaAction,
    treeData: ref([documentNode])
  })

  handlers.onEditDocumentClick()

  expect(runFaAction).toHaveBeenCalledWith('editHierarchyTreeDocument', { documentId: 'doc-a' })
})

test('Test that buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers dispatches copy through runFaAction', () => {
  const runFaAction = vi.fn()
  const handlers = buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers({
    contextMenuAnchorNodeId: ref('doc-a'),
    runFaAction,
    treeData: ref([documentNode])
  })

  handlers.onCopyDocumentClick()

  expect(runFaAction).toHaveBeenCalledWith('copyHierarchyTreeDocument', { documentId: 'doc-a' })
})

test('Test that buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers dispatches delete through runFaAction', () => {
  const runFaAction = vi.fn()
  const handlers = buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers({
    contextMenuAnchorNodeId: ref('doc-a'),
    runFaAction,
    treeData: ref([documentNode])
  })

  handlers.onDeleteDocumentClick()

  expect(runFaAction).toHaveBeenCalledWith('deleteHierarchyTreeDocument', { documentId: 'doc-a' })
})

test('Test that buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers dispatches add child through runFaAction', () => {
  const runFaAction = vi.fn()
  const handlers = buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers({
    contextMenuAnchorNodeId: ref('doc-a'),
    runFaAction,
    treeData: ref([documentNode])
  })

  handlers.onAddNewDocumentUnderThisClick()

  expect(runFaAction).toHaveBeenCalledWith('addHierarchyTreeChildDocument', { documentId: 'doc-a' })
})

test('Test that buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers no-ops without anchor', () => {
  const runFaAction = vi.fn()
  const handlers = buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers({
    contextMenuAnchorNodeId: ref(null),
    runFaAction,
    treeData: ref([documentNode])
  })

  handlers.onOpenDocumentClick()
  handlers.onEditDocumentClick()
  handlers.onCopyDocumentClick()
  handlers.onDeleteDocumentClick()

  expect(runFaAction).not.toHaveBeenCalled()
})

test('Test that buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers no-ops for non-document anchors', () => {
  const runFaAction = vi.fn()
  const placementNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'placement-1',
    label: 'Buildings',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const handlers = buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers({
    contextMenuAnchorNodeId: ref('placement-1'),
    runFaAction,
    treeData: ref([placementNode])
  })

  handlers.onOpenDocumentClick()
  handlers.onAddNewDocumentUnderThisClick()

  expect(runFaAction).not.toHaveBeenCalled()
})
