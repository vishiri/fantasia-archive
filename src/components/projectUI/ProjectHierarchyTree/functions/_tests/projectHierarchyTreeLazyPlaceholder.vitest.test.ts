import { expect, test } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeLazyPlaceholderApi } from '../projectHierarchyTreeLazyPlaceholder'

const {
  createLazyPlaceholderChild,
  resolveLazyChildren,
  syncProjectHierarchyTreeNodeLazyChildren
} = createProjectHierarchyTreeLazyPlaceholderApi()

function createPlacementNode (
  overrides: Partial<I_faProjectHierarchyTreeHeTreeNode> = {}
): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [{ id: 'stale-child' } as I_faProjectHierarchyTreeHeTreeNode],
    childrenLoaded: false,
    documentId: null,
    groupId: 'group-1',
    hasChildren: true,
    icon: 'mdi-home',
    id: 'placement-1',
    label: 'Buildings',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1',
    ...overrides
  }
}

test('createLazyPlaceholderChild builds a lazy document placeholder from the parent placement', () => {
  expect(createLazyPlaceholderChild(createPlacementNode())).toEqual({
    children: [],
    childrenLoaded: false,
    documentId: null,
    groupId: null,
    hasChildren: false,
    icon: 'mdi-home',
    id: 'placement-1__lazy',
    label: '',
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  })
})

test('resolveLazyChildren returns an empty list when the parent has no children', () => {
  expect(resolveLazyChildren(createPlacementNode({ hasChildren: false }))).toEqual([])
})

test('syncProjectHierarchyTreeNodeLazyChildren clears children when hasChildren is false', () => {
  const node = createPlacementNode({ hasChildren: false })

  syncProjectHierarchyTreeNodeLazyChildren(node)

  expect(node.children).toEqual([])
})

test('syncProjectHierarchyTreeNodeLazyChildren skips world and group nodes', () => {
  const worldNode = createPlacementNode({
    children: [{ id: 'keep' } as I_faProjectHierarchyTreeHeTreeNode],
    nodeKind: 'world'
  })

  syncProjectHierarchyTreeNodeLazyChildren(worldNode)

  expect(worldNode.children).toEqual([{ id: 'keep' }])
})

test('syncProjectHierarchyTreeNodeLazyChildren installs a lazy placeholder when needed', () => {
  const node = createPlacementNode({ children: [] })

  syncProjectHierarchyTreeNodeLazyChildren(node)

  expect(node.children).toEqual([createLazyPlaceholderChild(node)])
})
