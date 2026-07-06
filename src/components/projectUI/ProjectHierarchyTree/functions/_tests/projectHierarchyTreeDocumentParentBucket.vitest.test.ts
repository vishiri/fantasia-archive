/** @vitest-environment jsdom */
import { expect, test } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh,
  findProjectHierarchyTreeDocumentParentBucket
} from '../projectHierarchyTreeDocumentParentBucket'

function buildPlacementNode (input: {
  children: I_faProjectHierarchyTreeHeTreeNode[]
  childrenLoaded: boolean
}): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: input.children,
    childrenLoaded: input.childrenLoaded,
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
}

function buildDocumentNode (input: {
  documentId: string
  id: string
  label?: string
}): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: true,
    documentId: input.documentId,
    groupId: null,
    hasChildren: false,
    icon: 'mdi-home',
    id: input.id,
    label: input.label ?? input.id,
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
}

test('Test that findProjectHierarchyTreeDocumentParentBucket resolves placement parent', () => {
  const placement = buildPlacementNode({
    children: [
      buildDocumentNode({
        documentId: 'doc-a',
        id: 'doc-a',
        label: 'Doc A'
      })
    ],
    childrenLoaded: true
  })
  const treeData = [placement]
  const bucket = findProjectHierarchyTreeDocumentParentBucket(treeData, 'doc-a')
  expect(bucket?.parentNode?.id).toBe('placement-1')
})

test('Test that collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh dedupes parent buckets', () => {
  const placement = buildPlacementNode({
    children: [
      buildDocumentNode({
        documentId: 'doc-a',
        id: 'doc-a'
      }),
      buildDocumentNode({
        documentId: 'doc-b',
        id: 'doc-b'
      })
    ],
    childrenLoaded: true
  })
  const parentNodeIds = collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh(
    [placement],
    ['doc-a', 'doc-b']
  )
  expect(parentNodeIds).toEqual(['placement-1'])
})

test('Test that collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh skips unloaded parents', () => {
  const placement = buildPlacementNode({
    children: [],
    childrenLoaded: false
  })
  const parentNodeIds = collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh(
    [placement],
    ['missing-doc']
  )
  expect(parentNodeIds).toEqual([])
})
