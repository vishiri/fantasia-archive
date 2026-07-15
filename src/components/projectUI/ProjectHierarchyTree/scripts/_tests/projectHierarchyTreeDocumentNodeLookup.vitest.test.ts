import { expect, test } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  findProjectHierarchyTreeDocumentNodeByDocumentId,
  resolveHierarchyTreeDocumentNodeFromAnchor
} from '../projectHierarchyTreeDocumentNodeLookup'

function buildDocumentNode (input: {
  documentId: string
  children?: I_faProjectHierarchyTreeHeTreeNode[]
  id?: string
}): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: input.children ?? [],
    childrenLoaded: true,
    documentId: input.documentId,
    groupId: null,
    hasChildren: (input.children ?? []).length > 0,
    icon: 'mdi-home',
    id: input.id ?? input.documentId,
    label: input.documentId,
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
}

test('Test that resolveHierarchyTreeDocumentNodeFromAnchor returns document nodes only', () => {
  const treeData: I_faProjectHierarchyTreeHeTreeNode[] = [
    buildDocumentNode({ documentId: 'doc-a' })
  ]
  expect(resolveHierarchyTreeDocumentNodeFromAnchor(treeData, 'doc-a')?.documentId).toBe('doc-a')
  expect(resolveHierarchyTreeDocumentNodeFromAnchor(treeData, 'missing')).toBeNull()
})

test('Test that resolveHierarchyTreeDocumentNodeFromAnchor rejects non-document anchors', () => {
  const placementNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: false,
    icon: 'mdi-home',
    id: 'placement-1',
    label: 'Buildings',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
  expect(resolveHierarchyTreeDocumentNodeFromAnchor([placementNode], 'placement-1')).toBeNull()
})

test('Test that findProjectHierarchyTreeDocumentNodeByDocumentId searches nested buckets', () => {
  const nested = buildDocumentNode({ documentId: 'doc-child' })
  const parent = buildDocumentNode({
    children: [nested],
    documentId: 'doc-parent'
  })
  const treeData: I_faProjectHierarchyTreeHeTreeNode[] = [parent]
  expect(findProjectHierarchyTreeDocumentNodeByDocumentId(treeData, 'doc-child')?.id).toBe('doc-child')
  expect(findProjectHierarchyTreeDocumentNodeByDocumentId(treeData, 'doc-missing')).toBeNull()
})
