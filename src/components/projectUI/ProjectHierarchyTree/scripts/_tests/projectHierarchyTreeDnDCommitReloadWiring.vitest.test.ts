import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  refreshProjectHierarchyTreeDragCommitSourceContainer,
  refreshProjectHierarchyTreeDragCommitTargetContainer,
  resolveProjectHierarchyTreeDragCommitSourceReloadNodeId
} from '../projectHierarchyTreeDnDCommitReloadWiring'

function buildDocumentNode (documentId: string): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: true,
    documentId,
    groupId: null,
    hasChildren: false,
    icon: 'mdi-home',
    id: documentId,
    label: documentId,
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
}

test('Test that resolveProjectHierarchyTreeDragCommitSourceReloadNodeId uses placement id for top-level moves', () => {
  const treeData: I_faProjectHierarchyTreeHeTreeNode[] = []
  const nodeId = resolveProjectHierarchyTreeDragCommitSourceReloadNodeId({
    dragParentDocumentIdAtDragStart: null,
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-a'],
      parentDocumentId: 'doc-parent',
      placementId: 'placement-1'
    },
    treeData
  })
  expect(nodeId).toBe('placement-1')
})

test('Test that refreshProjectHierarchyTreeDragCommitTargetContainer reloads target only', async () => {
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  await refreshProjectHierarchyTreeDragCommitTargetContainer({
    commitResult: {
      committed: true,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: 'doc-parent',
      reloadChildrenNodeId: 'doc-parent'
    },
    refreshNodeChildrenFromDatabase
  })
  expect(refreshNodeChildrenFromDatabase).toHaveBeenCalledTimes(1)
  expect(refreshNodeChildrenFromDatabase).toHaveBeenCalledWith('doc-parent')
})

test('Test that refreshProjectHierarchyTreeDragCommitSourceContainer reloads source on cross-bucket moves', async () => {
  const treeData: I_faProjectHierarchyTreeHeTreeNode[] = [
    {
      children: [buildDocumentNode('doc-parent')],
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
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  await refreshProjectHierarchyTreeDragCommitSourceContainer({
    committed: true,
    dragParentDocumentIdAtDragStart: null,
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-a'],
      parentDocumentId: 'doc-parent',
      placementId: 'placement-1'
    },
    parentChangedFromDragStart: true,
    refreshNodeChildrenFromDatabase,
    treeData: ref(treeData)
  })
  expect(refreshNodeChildrenFromDatabase).toHaveBeenCalledTimes(1)
  expect(refreshNodeChildrenFromDatabase).toHaveBeenCalledWith('placement-1')
})

test('Test that resolveProjectHierarchyTreeDragCommitSourceReloadNodeId returns null without snapshot', () => {
  expect(resolveProjectHierarchyTreeDragCommitSourceReloadNodeId({
    dragParentDocumentIdAtDragStart: 'doc-parent',
    dragSiblingOrderSnapshot: null,
    treeData: []
  })).toBeNull()
})

test('Test that resolveProjectHierarchyTreeDragCommitSourceReloadNodeId resolves nested parent node id', () => {
  const parent = buildDocumentNode('doc-parent')
  const nodeId = resolveProjectHierarchyTreeDragCommitSourceReloadNodeId({
    dragParentDocumentIdAtDragStart: 'doc-parent',
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-a'],
      parentDocumentId: 'doc-parent',
      placementId: 'placement-1'
    },
    treeData: [parent]
  })
  expect(nodeId).toBe('doc-parent')
})

test('Test that refreshProjectHierarchyTreeDragCommitTargetContainer skips uncommitted moves', async () => {
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  await refreshProjectHierarchyTreeDragCommitTargetContainer({
    commitResult: {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null,
      reloadChildrenNodeId: 'doc-parent'
    },
    refreshNodeChildrenFromDatabase
  })
  expect(refreshNodeChildrenFromDatabase).not.toHaveBeenCalled()
})

test('Test that refreshProjectHierarchyTreeDragCommitSourceContainer skips when source reload id is unresolved', async () => {
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  await refreshProjectHierarchyTreeDragCommitSourceContainer({
    committed: true,
    dragParentDocumentIdAtDragStart: 'doc-parent',
    dragSiblingOrderSnapshot: null,
    parentChangedFromDragStart: true,
    refreshNodeChildrenFromDatabase,
    treeData: ref([])
  })
  expect(refreshNodeChildrenFromDatabase).not.toHaveBeenCalled()
})

test('Test that resolveProjectHierarchyTreeDragCommitSourceReloadNodeId falls back to parent document id', () => {
  const nodeId = resolveProjectHierarchyTreeDragCommitSourceReloadNodeId({
    dragParentDocumentIdAtDragStart: 'doc-missing',
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-a'],
      parentDocumentId: 'doc-missing',
      placementId: 'placement-1'
    },
    treeData: []
  })
  expect(nodeId).toBe('doc-missing')
})
