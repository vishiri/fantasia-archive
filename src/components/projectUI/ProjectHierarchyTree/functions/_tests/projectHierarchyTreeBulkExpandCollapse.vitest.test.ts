import { expect, test } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet,
  collectProjectHierarchyTreeBulkExpandCollapseSubtreeIds,
  collectProjectHierarchyTreeBulkExpandTargetIds,
  isProjectHierarchyTreeBulkExpandCollapseMenuEligible
} from '../projectHierarchyTreeBulkExpandCollapse'

function createAddNewRow (placementId: string): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: false,
    icon: '',
    id: `add-new-${placementId}`,
    label: 'Add new',
    nodeKind: 'addNewDocument',
    placementId,
    worldColor: '#000',
    worldId: 'world-1'
  }
}

function createPlacement (
  id: string,
  children: I_faProjectHierarchyTreeHeTreeNode[] = []
): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children,
    childrenLoaded: children.length > 0,
    documentId: null,
    groupId: 'group-1',
    hasChildren: true,
    icon: '',
    id,
    label: id,
    nodeKind: 'templatePlacement',
    placementId: id,
    worldColor: '#000',
    worldId: 'world-1'
  }
}

function createDocument (
  id: string,
  options: {
    children?: I_faProjectHierarchyTreeHeTreeNode[]
    hasChildren?: boolean
  } = {}
): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: options.children ?? [],
    childrenLoaded: (options.children ?? []).length > 0,
    documentId: id,
    groupId: 'group-1',
    hasChildren: options.hasChildren ?? false,
    icon: '',
    id,
    label: id,
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
}

const sampleTree: I_faProjectHierarchyTreeHeTreeNode[] = [
  {
    children: [
      {
        children: [
          createPlacement('placement-1', [
            createDocument('doc-1', {
              children: [createDocument('doc-2')],
              hasChildren: true
            })
          ]),
          createPlacement('placement-2', [createAddNewRow('placement-2')])
        ],
        childrenLoaded: true,
        documentId: null,
        groupId: 'group-1',
        hasChildren: true,
        icon: '',
        id: 'group-1',
        label: 'Group 1',
        nodeKind: 'group',
        placementId: null,
        worldColor: '#000',
        worldId: 'world-1'
      }
    ],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World 1',
    nodeKind: 'world',
    placementId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }
]

test('isProjectHierarchyTreeBulkExpandCollapseMenuEligible rejects add-new and leaf rows', () => {
  expect(isProjectHierarchyTreeBulkExpandCollapseMenuEligible(
    createAddNewRow('placement-1'),
    sampleTree
  )).toBe(false)
  expect(isProjectHierarchyTreeBulkExpandCollapseMenuEligible(
    createDocument('leaf-doc'),
    sampleTree
  )).toBe(false)
  expect(isProjectHierarchyTreeBulkExpandCollapseMenuEligible(
    createPlacement('placement-only-add-new', [createAddNewRow('placement-only-add-new')]),
    sampleTree
  )).toBe(false)
})

test('isProjectHierarchyTreeBulkExpandCollapseMenuEligible allows structural rows with descendants', () => {
  expect(isProjectHierarchyTreeBulkExpandCollapseMenuEligible(sampleTree[0]!, sampleTree)).toBe(true)
  expect(isProjectHierarchyTreeBulkExpandCollapseMenuEligible(
    createDocument('doc-1', {
      children: [createDocument('doc-2')],
      hasChildren: true
    }),
    sampleTree
  )).toBe(true)
})

test('collectProjectHierarchyTreeBulkExpandCollapseSubtreeIds includes anchor and descendants', () => {
  expect(collectProjectHierarchyTreeBulkExpandCollapseSubtreeIds(sampleTree, 'group-1')).toEqual([
    'group-1',
    'placement-1',
    'doc-1',
    'doc-2',
    'placement-2',
    'add-new-placement-2'
  ])
})

test('collectProjectHierarchyTreeBulkExpandTargetIds includes ancestors and expandable rows', () => {
  const targetIds = collectProjectHierarchyTreeBulkExpandTargetIds(sampleTree, 'doc-1')
  expect(targetIds).toContain('world-1')
  expect(targetIds).toContain('group-1')
  expect(targetIds).toContain('placement-1')
  expect(targetIds).toContain('doc-1')
  expect(targetIds).not.toContain('doc-2')
})

test('collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet prunes subtree and latent document ids', () => {
  const openNodeIds = new Set([
    'world-1',
    'group-1',
    'placement-1',
    'doc-1',
    'doc-latent'
  ])
  const pruneSet = collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet(
    sampleTree,
    openNodeIds,
    'placement-1'
  )
  expect(pruneSet.has('placement-1')).toBe(true)
  expect(pruneSet.has('doc-1')).toBe(true)
  expect(pruneSet.has('doc-2')).toBe(true)
  expect(pruneSet.has('doc-latent')).toBe(true)
  expect(pruneSet.has('world-1')).toBe(false)
  expect(pruneSet.has('group-1')).toBe(false)
})

test('collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet keeps latent ids when sibling placement expanded', () => {
  const treeWithTwoPlacements: I_faProjectHierarchyTreeHeTreeNode[] = [
    {
      ...sampleTree[0]!,
      children: [
        {
          ...sampleTree[0]!.children[0]!,
          children: [
            createPlacement('placement-1'),
            createPlacement('placement-2')
          ]
        }
      ]
    }
  ]
  const openNodeIds = new Set([
    'world-1',
    'group-1',
    'placement-1',
    'placement-2',
    'doc-latent'
  ])
  const pruneSet = collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet(
    treeWithTwoPlacements,
    openNodeIds,
    'placement-1'
  )
  expect(pruneSet.has('placement-1')).toBe(true)
  expect(pruneSet.has('doc-latent')).toBe(false)
})

test('collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet returns empty for unknown anchor', () => {
  expect(collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet(
    sampleTree,
    new Set(['world-1']),
    'missing-anchor'
  )).toEqual(new Set())
})

test('collectProjectHierarchyTreeBulkExpandTargetIds returns empty for unknown anchor', () => {
  expect(collectProjectHierarchyTreeBulkExpandTargetIds(sampleTree, 'missing-anchor')).toEqual([])
})

test('collectProjectHierarchyTreeBulkExpandTargetIds skips add-new rows in subtree walk', () => {
  const targetIds = collectProjectHierarchyTreeBulkExpandTargetIds(sampleTree, 'placement-2')
  expect(targetIds).toContain('placement-2')
  expect(targetIds).not.toContain('add-new-placement-2')
})

test('collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet adds open descendants under anchor', () => {
  const openNodeIds = new Set(['world-1', 'group-1', 'placement-1', 'doc-1', 'doc-2'])
  const pruneSet = collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet(
    sampleTree,
    openNodeIds,
    'placement-1'
  )
  expect(pruneSet.has('doc-2')).toBe(true)
})

test('collectProjectHierarchyTreeBulkExpandCollapseSubtreeIds returns empty for unknown anchor', () => {
  expect(collectProjectHierarchyTreeBulkExpandCollapseSubtreeIds(sampleTree, 'missing-anchor')).toEqual([])
})

test('isProjectHierarchyTreeBulkExpandCollapseMenuEligible allows placement with only add-new descendants', () => {
  const placement = createPlacement('placement-only-add-new', [createAddNewRow('placement-only-add-new')])
  const tree: I_faProjectHierarchyTreeHeTreeNode[] = [{
    ...sampleTree[0]!,
    children: [{
      ...sampleTree[0]!.children[0]!,
      children: [placement]
    }]
  }]
  expect(isProjectHierarchyTreeBulkExpandCollapseMenuEligible(placement, tree)).toBe(true)
})

test('collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet skips ancestor open ids', () => {
  const openNodeIds = new Set(['world-1', 'group-1', 'placement-1'])
  const pruneSet = collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet(
    sampleTree,
    openNodeIds,
    'placement-1'
  )
  expect(pruneSet.has('world-1')).toBe(false)
  expect(pruneSet.has('group-1')).toBe(false)
})

test('isProjectHierarchyTreeBulkExpandCollapseMenuEligible is false when node id is absent from tree', () => {
  const detachedGroup: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: 'group-9',
    hasChildren: true,
    icon: '',
    id: 'group-9',
    label: 'Detached',
    nodeKind: 'group',
    placementId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }
  expect(isProjectHierarchyTreeBulkExpandCollapseMenuEligible(detachedGroup, sampleTree)).toBe(false)
})
