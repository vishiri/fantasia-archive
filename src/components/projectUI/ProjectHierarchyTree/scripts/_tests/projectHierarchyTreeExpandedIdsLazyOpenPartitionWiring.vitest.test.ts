import { expect, test } from 'vitest'
import { partitionProjectHierarchyTreeExpandedIdsForLazyOpen } from '../projectHierarchyTreeExpandedIdsLazyOpenPartitionWiring'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

function buildNode (
  overrides: Partial<I_faProjectHierarchyTreeHeTreeNode> & Pick<I_faProjectHierarchyTreeHeTreeNode, 'id' | 'nodeKind'>
): I_faProjectHierarchyTreeHeTreeNode {
  return {
    categoryCount: 0,
    children: [],
    childrenLoaded: false,
    documentCount: 0,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: 'mdi-tag',
    label: overrides.id,
    placementId: null,
    tagId: null,
    worldColor: '#000',
    worldId: 'world-1',
    ...overrides
  }
}

test('Test that partitionProjectHierarchyTreeExpandedIdsForLazyOpen defers unloaded tags', () => {
  const tag = buildNode({
    children: [buildNode({
      childrenLoaded: true,
      hasChildren: false,
      id: 'lazy',
      nodeKind: 'document'
    })],
    childrenLoaded: false,
    id: 'tag-1',
    nodeKind: 'tag',
    tagId: 'tag-1'
  })
  const world = buildNode({
    children: [tag],
    childrenLoaded: true,
    id: 'world-1',
    nodeKind: 'world'
  })
  const result = partitionProjectHierarchyTreeExpandedIdsForLazyOpen({
    expandedNodeIds: ['world-1', 'tag-1'],
    treeNodes: [world]
  })
  expect(result.immediateOpenNodeIds).toEqual(['world-1'])
  expect(result.deferredOpenNodeIds).toEqual(['tag-1'])
})
