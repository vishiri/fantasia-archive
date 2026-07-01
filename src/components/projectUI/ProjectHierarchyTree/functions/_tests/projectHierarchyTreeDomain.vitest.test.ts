/** @vitest-environment jsdom */
import { expect, test } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import {
  mapHierarchyDocumentChildrenToTreeNodes,
  mapWorkspaceLayoutToHierarchyTreeSkeleton,
  patchHierarchyTreeSkeletonLabelsInPlace
} from '../mapWorkspaceLayoutToHierarchyTreeSkeleton'
import {
  collectProjectHierarchyTreeAncestorIds,
  collectProjectHierarchyTreeDescendantIds,
  evictCollapsedNodeChildren,
  findProjectHierarchyTreeNodeById,
  mergeLoadedChildrenIntoNode
} from '../projectHierarchyTreeExpandState'
import {
  isProjectHierarchyTreeNodeDraggable,
  isProjectHierarchyTreeNodeDroppable,
  isProjectHierarchyTreeRootDroppable,
  resolvePlacementIdFromHeTreeNode,
  resolveProjectHierarchyTreeDragContext
} from '../projectHierarchyTreeDnD'
import { resolveProjectHierarchyTreeDragExpandedSnapshot } from '../../scripts/projectHierarchyTreeDragExpandSnapshotWiring'
import { mapProjectHierarchyTreeToTopologyKey } from '../projectHierarchyTreeTopologyKey'
import { projectHierarchyTreeLayoutStructureMatchesTree } from '../../scripts/projectHierarchyTreeLayoutStructureMatch'
import {
  mergeProjectHierarchyTreePlacementExpandNodeIds,
  resolveDefaultProjectHierarchyTreeExpandedNodeIds,
  shouldRunProjectHierarchyTreePlacementExpandMerge
} from '../projectHierarchyTreeDefaultExpand'
import { buildProjectHierarchyTreeRevealPathFromSearchHit } from '../projectHierarchyTreeRevealPath'
import { resolveProjectHierarchyTreeScrollContainer } from '../projectHierarchyTreeScrollContainer'
import {
  resolveProjectHierarchyTreeDropParentDocumentId,
  resolveProjectHierarchyTreeSiblingSortOrder
} from '../projectHierarchyTreeMoveFromTree'
import {
  projectHierarchyTreeNodeShowsOpenIcon,
  syncProjectHierarchyTreeDocumentHasChildrenFlags
} from '../projectHierarchyTreeDocumentHasChildrenSync'
import {
  PROJECT_HIERARCHY_TREE_TREE_NODE_KIND_CLASS_LIST,
  resolveProjectHierarchyTreeTreeNodeKindClass
} from '../projectHierarchyTreeTreeNodeKindClass'

const sampleWorld = {
  color: '#ff0000',
  displayName: 'World A',
  groups: [
    {
      displayName: 'Group 1',
      hasChildren: true,
      id: 'group-1',
      rootSortOrder: 0,
      worldId: 'world-1'
    }
  ],
  id: 'world-1',
  placements: [
    {
      displayName: 'Character',
      documentTemplateId: 'template-1',
      groupId: 'group-1',
      groupSortOrder: 0,
      hasChildren: true,
      icon: 'mdi-account',
      id: 'placement-1',
      nickname: 'Heroes',
      rootSortOrder: null,
      worldId: 'world-1'
    },
    {
      displayName: 'Location',
      documentTemplateId: 'template-2',
      groupId: null,
      groupSortOrder: null,
      hasChildren: false,
      icon: 'mdi-map',
      id: 'placement-2',
      nickname: '',
      rootSortOrder: 1,
      worldId: 'world-1'
    }
  ],
  sortOrder: 0
}

/**
 * mapWorkspaceLayoutToHierarchyTreeSkeleton builds worlds with nested layout rows.
 */
test('Test that mapWorkspaceLayoutToHierarchyTreeSkeleton builds nested layout rows', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(tree).toHaveLength(1)
  expect(tree[0]?.nodeKind).toBe('world')
  expect(tree[0]?.children).toHaveLength(2)
  expect(tree[0]?.children[0]?.nodeKind).toBe('group')
  expect(tree[0]?.children[1]?.nodeKind).toBe('templatePlacement')
  expect(tree[0]?.children[0]?.children[0]?.label).toBe('Heroes')
})

/**
 * projectHierarchyTreeDnD allows document reorder only within one placement.
 */
test('Test that projectHierarchyTreeDnD fences document drag to same placement', () => {
  const documentA = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-a',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-a',
    label: 'Doc A',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const documentB = {
    ...documentA,
    documentId: 'doc-b',
    id: 'doc-b',
    label: 'Doc B',
    placementId: 'placement-2'
  }
  expect(isProjectHierarchyTreeNodeDraggable(documentA)).toBe(true)
  expect(isProjectHierarchyTreeNodeDraggable({
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    worldColor: '#000',
    worldId: 'world-1'
  })).toBe(false)
  expect(isProjectHierarchyTreeRootDroppable({
    dragNode: {
      data: documentA
    }
  })).toBe(true)
  expect(isProjectHierarchyTreeRootDroppable({
    dragNode: null
  })).toBe(false)
  expect(isProjectHierarchyTreeNodeDroppable(documentA, {
    dragNode: {
      data: documentA
    }
  }, [])).toBe(false)
  expect(isProjectHierarchyTreeNodeDroppable(documentB, {
    dragNode: {
      data: documentA
    }
  })).toBe(false)
})

/**
 * evictCollapsedNodeChildren clears lazy document subtrees on collapse.
 */
test('Test that evictCollapsedNodeChildren clears lazy-loaded document children', () => {
  const placementNode = {
    children: [
      {
        children: [],
        childrenLoaded: true,
        documentId: 'doc-1',
        groupId: null,
        hasChildren: false,
        icon: '',
        id: 'doc-1',
        label: 'Doc',
        nodeKind: 'document' as const,
        placementId: 'placement-1',
        worldColor: '#000',
        worldId: 'world-1'
      }
    ],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: 'mdi-account',
    id: 'placement-1',
    label: 'Heroes',
    nodeKind: 'templatePlacement' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  evictCollapsedNodeChildren(placementNode)
  expect(placementNode.children).toEqual([])
  expect(placementNode.childrenLoaded).toBe(false)
})

/**
 * mapProjectHierarchyTreeToTopologyKey ignores label changes.
 */
test('Test that mapProjectHierarchyTreeToTopologyKey ignores label-only changes', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const relabeled = mapWorkspaceLayoutToHierarchyTreeSkeleton([
    {
      ...sampleWorld,
      displayName: 'Renamed world'
    }
  ])
  expect(mapProjectHierarchyTreeToTopologyKey(tree)).toBe(
    mapProjectHierarchyTreeToTopologyKey(relabeled)
  )
})

/**
 * buildProjectHierarchyTreeRevealPathFromSearchHit returns ancestor open chain.
 */
test('Test that buildProjectHierarchyTreeRevealPathFromSearchHit builds open chain', () => {
  const path = buildProjectHierarchyTreeRevealPathFromSearchHit(
    {
      ancestorDocumentIds: ['doc-parent'],
      displayName: 'Target',
      documentId: 'doc-target',
      placementId: 'placement-1',
      worldId: 'world-1'
    },
    [sampleWorld]
  )
  expect(path).toEqual([
    'world-1',
    'group-1',
    'placement-1',
    'doc-parent',
    'doc-target'
  ])
})

/**
 * mergeLoadedChildrenIntoNode attaches lazy children under a target node id.
 */
test('Test that mergeLoadedChildrenIntoNode attaches lazy children under a target node id', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placementId = 'placement-1'
  const children = mapHierarchyDocumentChildrenToTreeNodes({
    items: [
      {
        displayName: 'Doc 1',
        hasChildren: false,
        id: 'doc-1',
        parentDocumentId: null,
        placementId,
        sortOrder: 0
      }
    ],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  const merged = mergeLoadedChildrenIntoNode(tree, placementId, children)
  expect(merged).toBe(true)
  const ancestors = collectProjectHierarchyTreeAncestorIds(tree, 'doc-1')
  expect(ancestors).toEqual(['world-1', 'group-1', placementId])
})

/**
 * projectHierarchyTreeMoveFromTree resolves drop parent and sibling order.
 */
test('Test that projectHierarchyTreeMoveFromTree resolves drop parent and sibling order', () => {
  const documentNode = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-1',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-1',
    label: 'Doc',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  expect(resolveProjectHierarchyTreeDropParentDocumentId(documentNode)).toBe('doc-1')
  expect(resolveProjectHierarchyTreeSiblingSortOrder([documentNode], 'doc-1')).toBe(0)
})

/**
 * resolveProjectHierarchyTreeScrollContainer finds nested scroll root.
 */
test('Test that resolveProjectHierarchyTreeScrollContainer finds nested scroll root', () => {
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  host.appendChild(tree)
  expect(resolveProjectHierarchyTreeScrollContainer(host)?.className).toBe('projectHierarchyTree')
})

/**
 * resolveProjectHierarchyTreeScrollContainer falls back to host when tree root missing.
 */
test('Test that resolveProjectHierarchyTreeScrollContainer falls back to host element', () => {
  const host = document.createElement('div')
  expect(resolveProjectHierarchyTreeScrollContainer(host)).toBe(host)
})

/**
 * patchHierarchyTreeSkeletonLabelsInPlace updates labels without rebuilding topology.
 */
test('Test that patchHierarchyTreeSkeletonLabelsInPlace updates display labels', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  patchHierarchyTreeSkeletonLabelsInPlace(tree, [
    {
      ...sampleWorld,
      displayName: 'Renamed world',
      placements: [
        {
          ...sampleWorld.placements[0]!,
          nickname: 'Renamed heroes'
        },
        sampleWorld.placements[1]!
      ]
    }
  ])
  expect(tree[0]?.label).toBe('Renamed world')
  expect(tree[0]?.children[0]?.children[0]?.label).toBe('Renamed heroes')
})

/**
 * mapWorkspaceLayoutToHierarchyTreeSkeleton uses template display name when nickname empty.
 */
test('Test that mapWorkspaceLayoutToHierarchyTreeSkeleton uses template display name without nickname', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const rootPlacement = tree[0]?.children.find((row) => row.nodeKind === 'templatePlacement')
  expect(rootPlacement?.label).toBe('Location')
})

/**
 * projectHierarchyTreeDnD accepts drops on matching template placement rows.
 */
test('Test that projectHierarchyTreeDnD accepts drops on matching placement rows', () => {
  const documentNode = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-1',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-1',
    label: 'Doc',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const placementNode = {
    children: [],
    childrenLoaded: false,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: 'mdi-account',
    id: 'placement-1',
    label: 'Heroes',
    nodeKind: 'templatePlacement' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  expect(isProjectHierarchyTreeNodeDroppable(placementNode, {
    dragNode: {
      data: documentNode
    }
  })).toBe(true)
  expect(isProjectHierarchyTreeNodeDroppable(placementNode, {
    dragNode: null
  })).toBe(true)
})

/**
 * resolveProjectHierarchyTreeDragContext returns null for non-document rows.
 */
test('Test that resolveProjectHierarchyTreeDragContext returns null for structural rows', () => {
  const worldNode = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])[0]!
  expect(resolveProjectHierarchyTreeDragContext(worldNode)).toBeNull()
})

/**
 * projectHierarchyTreeDnD rejects drops across placements and non-document drags.
 */
test('Test that projectHierarchyTreeDnD rejects invalid drag targets', () => {
  const documentA = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-a',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-a',
    label: 'Doc A',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const documentB = {
    ...documentA,
    documentId: 'doc-b',
    id: 'doc-b',
    placementId: 'placement-2'
  }
  const worldNode = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])[0]!
  expect(isProjectHierarchyTreeNodeDroppable(documentB, {
    dragNode: {
      data: documentA
    }
  })).toBe(false)
  expect(isProjectHierarchyTreeNodeDroppable(worldNode, {
    dragNode: {
      data: documentA
    }
  })).toBe(false)
  expect(isProjectHierarchyTreeNodeDroppable(documentA, {
    dragNode: {
      data: {
        ...documentA,
        nodeKind: 'world',
        documentId: null
      }
    }
  })).toBe(true)
  expect(isProjectHierarchyTreeNodeDroppable(documentA, {
    dragNode: {
      data: {
        ...documentA,
        placementId: null
      }
    }
  })).toBe(false)
})

test('Test that projectHierarchyTreeDnD blocks drop on direct parent document', () => {
  const parentDocument = {
    children: [] as I_faProjectHierarchyTreeHeTreeNode[],
    childrenLoaded: true,
    documentId: 'doc-parent',
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'doc-parent',
    label: 'Parent',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const childDocument = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-child',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-child',
    label: 'Child',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const siblingDocument = {
    ...childDocument,
    documentId: 'doc-sibling',
    id: 'doc-sibling',
    label: 'Sibling'
  }
  parentDocument.children = [childDocument, siblingDocument]
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!
  placement.children = [parentDocument]
  placement.childrenLoaded = true
  const dragContext = {
    dragNode: {
      data: childDocument
    }
  }
  expect(isProjectHierarchyTreeNodeDroppable(parentDocument, dragContext, tree)).toBe(false)
  expect(isProjectHierarchyTreeNodeDroppable(siblingDocument, dragContext, tree)).toBe(true)
})

test('Test that projectHierarchyTreeDnD allows nest on non-sibling section documents', () => {
  const parentDocument = {
    children: [] as I_faProjectHierarchyTreeHeTreeNode[],
    childrenLoaded: true,
    documentId: 'doc-parent',
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'doc-parent',
    label: 'Parent',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const childDocument = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-child',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-child',
    label: 'Child',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const cousinSection = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-cousin',
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'doc-cousin',
    label: 'Cousin',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  parentDocument.children = [childDocument]
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!
  placement.children = [parentDocument, cousinSection]
  placement.childrenLoaded = true
  const dragContext = {
    dragNode: {
      data: childDocument
    }
  }
  expect(isProjectHierarchyTreeNodeDroppable(cousinSection, dragContext, tree)).toBe(true)
})

test('Test that projectHierarchyTreeDnD tolerates missing children during parent resolve', () => {
  const childDocument = {
    children: undefined as unknown as I_faProjectHierarchyTreeHeTreeNode[],
    childrenLoaded: true,
    documentId: 'doc-child',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-child',
    label: 'Child',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const parentDocument = {
    children: [childDocument],
    childrenLoaded: true,
    documentId: 'doc-parent',
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'doc-parent',
    label: 'Parent',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!
  placement.children = [parentDocument]
  placement.childrenLoaded = true
  const dragContext = {
    dragNode: {
      data: childDocument
    }
  }
  expect(isProjectHierarchyTreeNodeDroppable(parentDocument, dragContext, tree)).toBe(false)
})

/**
 * resolvePlacementIdFromHeTreeNode returns null when placement id missing.
 */
test('Test that resolvePlacementIdFromHeTreeNode returns null without placement id', () => {
  expect(resolvePlacementIdFromHeTreeNode({
    children: [],
    childrenLoaded: false,
    documentId: null,
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    worldColor: '#000',
    worldId: 'world-1'
  })).toBeNull()
})

/**
 * buildProjectHierarchyTreeRevealPathFromSearchHit returns empty when placement missing.
 */
test('Test that buildProjectHierarchyTreeRevealPathFromSearchHit returns empty when placement missing', () => {
  expect(buildProjectHierarchyTreeRevealPathFromSearchHit({
    ancestorDocumentIds: [],
    displayName: 'Doc',
    documentId: 'doc-1',
    placementId: 'missing-placement',
    worldId: 'world-1'
  }, [sampleWorld])).toEqual([])
})

/**
 * patchHierarchyTreeSkeletonLabelsInPlace skips unknown worlds and patches grouped placements.
 */
test('Test that patchHierarchyTreeSkeletonLabelsInPlace patches grouped placement labels', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const staleWorld = {
    ...tree[0]!,
    id: 'stale-world',
    label: 'Stale'
  }
  patchHierarchyTreeSkeletonLabelsInPlace([staleWorld, ...tree], [
    {
      ...sampleWorld,
      groups: [
        {
          ...sampleWorld.groups[0]!,
          displayName: 'Renamed group'
        }
      ],
      placements: [
        {
          ...sampleWorld.placements[0]!,
          nickname: 'Renamed heroes'
        },
        sampleWorld.placements[1]!
      ]
    }
  ])
  expect(tree[0]?.children[0]?.children[0]?.label).toBe('Renamed heroes')
})

/**
 * evictCollapsedNodeChildren leaves world and group structural children intact.
 */
test('Test that evictCollapsedNodeChildren no-ops for world and group nodes', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const world = tree[0]!
  const group = world.children[0]!
  const placement = group.children[0]!
  const childCount = world.children.length
  evictCollapsedNodeChildren(world)
  evictCollapsedNodeChildren(group)
  evictCollapsedNodeChildren(placement)
  expect(world.children.length).toBe(childCount)
  expect(placement.children).toEqual([])
})
test('Test that mapWorkspaceLayoutToHierarchyTreeSkeleton omits lazy placeholders without children', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([
    {
      color: '#000',
      displayName: 'Solo world',
      groups: [],
      id: 'world-solo',
      placements: [
        {
          displayName: 'Item',
          documentTemplateId: 'template-solo',
          groupId: null,
          groupSortOrder: null,
          hasChildren: false,
          icon: 'mdi-file',
          id: 'placement-solo',
          nickname: '',
          rootSortOrder: 0,
          worldId: 'world-solo'
        }
      ],
      sortOrder: 0
    }
  ])
  expect(tree[0]?.children[0]?.children).toEqual([])
})

/**
 * mapProjectHierarchyTreeToTopologyKey sorts worlds and groups deterministically.
 */
test('Test that mapProjectHierarchyTreeToTopologyKey sorts topology ids', () => {
  const worldB = {
    ...sampleWorld,
    displayName: 'World B',
    groups: [],
    id: 'world-b',
    placements: [],
    sortOrder: 1
  }
  const worldA = {
    ...sampleWorld,
    id: 'world-a',
    sortOrder: 0
  }
  const key = mapProjectHierarchyTreeToTopologyKey(
    mapWorkspaceLayoutToHierarchyTreeSkeleton([worldB, worldA])
  )
  expect(key).toContain('world-a')
  expect(key.indexOf('world-a')).toBeLessThan(key.indexOf('world-b'))
})

/**
 * mapProjectHierarchyTreeToTopologyKey includes root placement topology.
 */
test('Test that mapProjectHierarchyTreeToTopologyKey includes root placement topology', () => {
  const soloWorld = {
    ...sampleWorld,
    groups: [],
    placements: [sampleWorld.placements[1]!]
  }
  const key = mapProjectHierarchyTreeToTopologyKey(
    mapWorkspaceLayoutToHierarchyTreeSkeleton([soloWorld])
  )
  expect(key).toContain('placement-2')
})

/**
 * buildProjectHierarchyTreeRevealPathFromSearchHit omits group id for root placements.
 */
test('Test that buildProjectHierarchyTreeRevealPathFromSearchHit omits group for root placements', () => {
  const path = buildProjectHierarchyTreeRevealPathFromSearchHit({
    ancestorDocumentIds: [],
    displayName: 'Map doc',
    documentId: 'doc-map',
    placementId: 'placement-2',
    worldId: 'world-1'
  }, [sampleWorld])
  expect(path).toEqual(['world-1', 'placement-2', 'doc-map'])
})

/**
 * mapWorkspaceLayoutToHierarchyTreeSkeleton sorts grouped placements by groupSortOrder.
 */
test('Test that mapWorkspaceLayoutToHierarchyTreeSkeleton sorts grouped placements', () => {
  const world = {
    ...sampleWorld,
    placements: [
      {
        ...sampleWorld.placements[0]!,
        groupSortOrder: 2,
        id: 'placement-late',
        nickname: 'Late'
      },
      {
        ...sampleWorld.placements[0]!,
        groupSortOrder: 1,
        id: 'placement-early',
        nickname: 'Early'
      }
    ]
  }
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([world])
  const group = tree[0]?.children.find((row) => row.nodeKind === 'group')
  expect(group?.children.map((row) => row.id)).toEqual(['placement-early', 'placement-late'])
})

/**
 * patchHierarchyTreeSkeletonLabelsInPlace skips missing group and placement rows.
 */
test('Test that patchHierarchyTreeSkeletonLabelsInPlace skips missing layout rows', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const groupNode = tree[0]?.children[0]!
  groupNode.id = 'missing-group'
  const placementNode = groupNode.children[0]!
  placementNode.id = 'missing-placement'
  patchHierarchyTreeSkeletonLabelsInPlace(tree, [sampleWorld])
  expect(groupNode.label).not.toBe('Renamed group')
})

/**
 * findProjectHierarchyTreeNodeById and mergeLoadedChildrenIntoNode handle missing ids.
 */
test('Test that expand state helpers return null or false for missing nodes', () => {
  expect(findProjectHierarchyTreeNodeById([], 'missing')).toBeNull()
  expect(mergeLoadedChildrenIntoNode([], 'missing', [])).toBe(false)
})

/**
 * resolveProjectHierarchyTreeScrollContainer falls back when no nested tree exists.
 */
test('Test that resolveProjectHierarchyTreeScrollContainer falls back to host element', () => {
  const host = document.createElement('section')
  expect(resolveProjectHierarchyTreeScrollContainer(host)).toBe(host)
  host.classList.add('projectHierarchyTree')
  expect(resolveProjectHierarchyTreeScrollContainer(host)).toBe(host)
})

/**
 * isProjectHierarchyTreeRootDroppable rejects null drag nodes.
 */
test('Test that isProjectHierarchyTreeRootDroppable rejects null drag nodes', () => {
  expect(isProjectHierarchyTreeRootDroppable({
    dragNode: null
  })).toBe(false)
})

/**
 * mapProjectHierarchyTreeToTopologyKey records root placement rows without groups.
 */
test('Test that mapProjectHierarchyTreeToTopologyKey records root placement rows', () => {
  const world = {
    color: '#000',
    displayName: 'Solo',
    groups: [],
    id: 'world-solo',
    placements: [sampleWorld.placements[1]!],
    sortOrder: 0
  }
  const key = mapProjectHierarchyTreeToTopologyKey(
    mapWorkspaceLayoutToHierarchyTreeSkeleton([world])
  )
  expect(JSON.parse(key).placements).toEqual([
    {
      groupId: null,
      id: 'placement-2'
    }
  ])
})

/**
 * patchHierarchyTreeSkeletonLabelsInPlace skips stale root placement rows.
 */
test('Test that patchHierarchyTreeSkeletonLabelsInPlace skips stale root placement rows', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const rootPlacement = tree[0]?.children.find((row) => row.nodeKind === 'templatePlacement')!
  const priorLabel = rootPlacement.label
  rootPlacement.id = 'stale-root-placement'
  patchHierarchyTreeSkeletonLabelsInPlace(tree, [sampleWorld])
  expect(rootPlacement.label).toBe(priorLabel)
})

/**
 * patchHierarchyTreeSkeletonLabelsInPlace skips missing placements under a valid group.
 */
test('Test that patchHierarchyTreeSkeletonLabelsInPlace skips missing grouped placements', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const groupNode = tree[0]?.children[0]!
  const placementNode = groupNode.children[0]!
  const priorLabel = placementNode.label
  placementNode.id = 'missing-grouped-placement'
  patchHierarchyTreeSkeletonLabelsInPlace(tree, [sampleWorld])
  expect(placementNode.label).toBe(priorLabel)
})

/**
 * resolveDefaultProjectHierarchyTreeExpandedNodeIds expands worlds and groups on first visit.
 */
test('Test that resolveDefaultProjectHierarchyTreeExpandedNodeIds expands worlds and groups', () => {
  const expandedNodeIds = resolveDefaultProjectHierarchyTreeExpandedNodeIds([sampleWorld])
  expect(expandedNodeIds).toEqual(['world-1', 'group-1', 'placement-1'])
})

/**
 * resolveDefaultProjectHierarchyTreeExpandedNodeIds skips worlds without layout rows.
 */
test('Test that resolveDefaultProjectHierarchyTreeExpandedNodeIds skips empty worlds', () => {
  const expandedNodeIds = resolveDefaultProjectHierarchyTreeExpandedNodeIds([
    {
      color: '#000',
      displayName: 'Empty',
      groups: [],
      id: 'world-empty',
      placements: [],
      sortOrder: 0
    }
  ])
  expect(expandedNodeIds).toEqual([])
})

/**
 * mergeProjectHierarchyTreePlacementExpandNodeIds adds placement ancestors when documents exist.
 */
test('Test that mergeProjectHierarchyTreePlacementExpandNodeIds expands placements with children', () => {
  const merged = mergeProjectHierarchyTreePlacementExpandNodeIds(
    ['world-1', 'group-1'],
    [sampleWorld]
  )
  expect(merged).toContain('placement-1')
})

/**
 * mergeProjectHierarchyTreePlacementExpandNodeIds
 * Expands root placements without a group ancestor.
 */
test('Test that mergeProjectHierarchyTreePlacementExpandNodeIds expands root placements', () => {
  const merged = mergeProjectHierarchyTreePlacementExpandNodeIds([], [
    {
      ...sampleWorld,
      groups: [],
      placements: [
        {
          ...sampleWorld.placements[1]!,
          hasChildren: true
        }
      ]
    }
  ])
  expect(merged).toEqual(['world-1', 'placement-2'])
})

test('Test that shouldRunProjectHierarchyTreePlacementExpandMerge skips when placement ids are persisted', () => {
  expect(shouldRunProjectHierarchyTreePlacementExpandMerge(['world-1', 'placement-1'], [sampleWorld])).toBe(false)
  expect(shouldRunProjectHierarchyTreePlacementExpandMerge(['world-1', 'group-1'], [sampleWorld])).toBe(true)
  expect(shouldRunProjectHierarchyTreePlacementExpandMerge([], [sampleWorld])).toBe(false)
})

test('Test that resolveProjectHierarchyTreeDragExpandedSnapshot prefers live DOM expand ids', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const openIds = new Set(['world-1', 'group-1', 'placement-1', 'placement-2'])
  expect(
    resolveProjectHierarchyTreeDragExpandedSnapshot(tree, ['world-1'], [], openIds, true)
  ).toEqual(['world-1'])
  expect(
    resolveProjectHierarchyTreeDragExpandedSnapshot(tree, [], [], openIds, false)
  ).toEqual([
    'world-1',
    'group-1',
    'placement-1',
    'placement-2'
  ])
  expect(
    resolveProjectHierarchyTreeDragExpandedSnapshot(tree, [], ['group-1'], openIds, true)
  ).toEqual(['world-1', 'placement-2'])
  expect(
    resolveProjectHierarchyTreeDragExpandedSnapshot(
      tree,
      [],
      ['group-1', 'placement-2'],
      openIds,
      true
    )
  ).toEqual(['world-1'])
})

test('Test that collectProjectHierarchyTreeDescendantIds walks nested children', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const worldNode = tree[0]!
  expect(collectProjectHierarchyTreeDescendantIds(worldNode)).toEqual([
    'group-1',
    'placement-1',
    'placement-1__lazy',
    'placement-2'
  ])
})

/**
 * patchHierarchyTreeSkeletonLabelsInPlace adds lazy children when placement gains documents.
 */
test('Test that patchHierarchyTreeSkeletonLabelsInPlace syncs lazy children when hasChildren flips', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([
    {
      ...sampleWorld,
      placements: [
        {
          ...sampleWorld.placements[0]!,
          hasChildren: false
        }
      ]
    }
  ])
  const placementNode = tree[0]?.children[0]?.children[0]
  expect(placementNode?.children).toEqual([])
  patchHierarchyTreeSkeletonLabelsInPlace(tree, [sampleWorld])
  expect(placementNode?.hasChildren).toBe(true)
  expect(placementNode?.children).toHaveLength(1)
  expect(placementNode?.children[0]?.id).toBe('placement-1__lazy')
})

/**
 * patchHierarchyTreeSkeletonLabelsInPlace clears lazy children when placement loses documents.
 */
test('Test that patchHierarchyTreeSkeletonLabelsInPlace clears lazy children when hasChildren flips off', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placementNode = tree[0]?.children[0]?.children[0]!
  expect(placementNode.children).toHaveLength(1)
  patchHierarchyTreeSkeletonLabelsInPlace(tree, [
    {
      ...sampleWorld,
      placements: [
        {
          ...sampleWorld.placements[0]!,
          hasChildren: false
        },
        sampleWorld.placements[1]!
      ]
    }
  ])
  expect(placementNode.hasChildren).toBe(false)
  expect(placementNode.children).toEqual([])
})

/**
 * patchHierarchyTreeSkeletonLabelsInPlace keeps loaded rows when hasChildren flips off.
 */
test('Test that patchHierarchyTreeSkeletonLabelsInPlace keeps loaded children when hasChildren flips off', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placementNode = tree[0]?.children[0]?.children[0]!
  const loadedChild = mapHierarchyDocumentChildrenToTreeNodes({
    items: [
      {
        displayName: 'Doc 1',
        hasChildren: false,
        id: 'doc-1',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 0
      }
    ],
    placementIcon: 'mdi-account',
    worldColor: '#ff0000',
    worldId: 'world-1'
  })[0]!
  placementNode.children = [loadedChild]
  placementNode.childrenLoaded = true
  patchHierarchyTreeSkeletonLabelsInPlace(tree, [
    {
      ...sampleWorld,
      placements: [
        {
          ...sampleWorld.placements[0]!,
          hasChildren: false
        },
        sampleWorld.placements[1]!
      ]
    }
  ])
  expect(placementNode.children).toEqual([loadedChild])
})

/**
 * projectHierarchyTreeLayoutStructureMatchesTree rejects stale empty world children.
 */
test('Test that projectHierarchyTreeLayoutStructureMatchesTree rejects stale empty world children', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([
    {
      ...sampleWorld,
      groups: [],
      placements: []
    }
  ])
  expect(projectHierarchyTreeLayoutStructureMatchesTree(tree, [sampleWorld])).toBe(false)
})

/**
 * projectHierarchyTreeLayoutStructureMatchesTree accepts matching layout skeletons.
 */
test('Test that projectHierarchyTreeLayoutStructureMatchesTree accepts matching skeletons', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(projectHierarchyTreeLayoutStructureMatchesTree(tree, [sampleWorld])).toBe(true)
})

/**
 * projectHierarchyTreeLayoutStructureMatchesTree rejects unknown world nodes in the tree.
 */
test('Test that projectHierarchyTreeLayoutStructureMatchesTree rejects unknown world nodes', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  tree[0]!.id = 'missing-world'
  expect(projectHierarchyTreeLayoutStructureMatchesTree(tree, [sampleWorld])).toBe(false)
})

/**
 * mapHierarchyDocumentChildrenToTreeNodes copies the placement icon onto document rows.
 */
test('Test that mapHierarchyDocumentChildrenToTreeNodes copies placement icon onto documents', () => {
  const nodes = mapHierarchyDocumentChildrenToTreeNodes({
    items: [
      {
        displayName: 'Doc 1',
        hasChildren: false,
        id: 'doc-1',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 0
      }
    ],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  expect(nodes[0]?.icon).toBe('mdi-account')
})

/**
 * mapHierarchyDocumentChildrenToTreeNodes adds lazy placeholders for expandable documents.
 */
test('Test that mapHierarchyDocumentChildrenToTreeNodes adds lazy placeholders', () => {
  const nodes = mapHierarchyDocumentChildrenToTreeNodes({
    items: [
      {
        displayName: 'Parent doc',
        hasChildren: true,
        id: 'doc-parent',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 0
      }
    ],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  expect(nodes[0]?.children).toHaveLength(1)
  expect(nodes[0]?.children[0]?.id).toBe('doc-parent__lazy')
})

/**
 * mergeLoadedChildrenIntoNode finds nested placement nodes under groups.
 */
test('Test that mergeLoadedChildrenIntoNode merges into nested placement nodes', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const documentChild = mapHierarchyDocumentChildrenToTreeNodes({
    items: [
      {
        displayName: 'Nested doc',
        hasChildren: false,
        id: 'doc-nested',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 0
      }
    ],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  expect(mergeLoadedChildrenIntoNode(tree, 'placement-1', documentChild)).toBe(true)
  expect(findProjectHierarchyTreeNodeById(tree, 'doc-nested')).not.toBeNull()
})

/**
 * mapWorkspaceLayoutToHierarchyTreeSkeleton sorts placements with null groupSortOrder.
 */
test('Test that mapWorkspaceLayoutToHierarchyTreeSkeleton sorts null groupSortOrder placements', () => {
  const world = {
    ...sampleWorld,
    placements: [
      {
        ...sampleWorld.placements[0]!,
        groupSortOrder: null,
        id: 'placement-a'
      },
      {
        ...sampleWorld.placements[0]!,
        groupSortOrder: 1,
        id: 'placement-b'
      }
    ]
  }
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([world])
  const group = tree[0]?.children.find((row) => row.nodeKind === 'group')
  expect(group?.children[0]?.id).toBe('placement-a')
  expect(group?.children[1]?.id).toBe('placement-b')
})

/**
 * mapProjectHierarchyTreeToTopologyKey ignores non-placement world children.
 */
test('Test that mapProjectHierarchyTreeToTopologyKey ignores document rows under worlds', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  tree[0]?.children.push({
    children: [],
    childrenLoaded: true,
    documentId: 'doc-orphan',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-orphan',
    label: 'Orphan',
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  })
  const key = mapProjectHierarchyTreeToTopologyKey(tree)
  expect(JSON.parse(key).placements).toEqual(
    JSON.parse(
      mapProjectHierarchyTreeToTopologyKey(
        mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
      )
    ).placements
  )
})

/**
 * mapWorkspaceLayoutToHierarchyTreeSkeleton marks empty worlds without children.
 */
test('Test that mapWorkspaceLayoutToHierarchyTreeSkeleton marks empty worlds without children', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([
    {
      color: '#000',
      displayName: 'Empty',
      groups: [],
      id: 'world-empty',
      placements: [],
      sortOrder: 0
    }
  ])
  expect(tree[0]?.hasChildren).toBe(false)
  expect(tree[0]?.children).toEqual([])
})

test('Test that syncProjectHierarchyTreeDocumentHasChildrenFlags clears stale loaded parent flags', () => {
  const parentNode = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-parent',
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'doc-parent',
    label: 'Parent',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const emptiedParentDocumentIds = syncProjectHierarchyTreeDocumentHasChildrenFlags([parentNode])
  expect(emptiedParentDocumentIds).toEqual(['doc-parent'])
  expect(parentNode.hasChildren).toBe(false)
  expect(parentNode.childrenLoaded).toBe(false)
})

test('Test that projectHierarchyTreeNodeShowsOpenIcon hides caret for empty loaded documents', () => {
  const documentNode = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-parent',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-parent',
    label: 'Parent',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  expect(projectHierarchyTreeNodeShowsOpenIcon(documentNode, 0)).toBe(false)
  expect(projectHierarchyTreeNodeShowsOpenIcon(documentNode, 1)).toBe(false)
})

test('Test that projectHierarchyTreeNodeShowsOpenIcon shows caret for document parents with nested rows', () => {
  const parentDocument = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-parent',
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'doc-parent',
    label: 'Parent',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  expect(projectHierarchyTreeNodeShowsOpenIcon(parentDocument, 2)).toBe(true)
  expect(projectHierarchyTreeNodeShowsOpenIcon({
    ...parentDocument,
    childrenLoaded: false,
    hasChildren: false
  }, 1)).toBe(true)
})

/**
 * resolveProjectHierarchyTreeTreeNodeKindClass maps each node kind to a he-tree row class.
 */
test('Test that resolveProjectHierarchyTreeTreeNodeKindClass maps node kinds', () => {
  expect(resolveProjectHierarchyTreeTreeNodeKindClass('world')).toBe('projectHierarchyTree-treeNode--world')
  expect(resolveProjectHierarchyTreeTreeNodeKindClass('group')).toBe('projectHierarchyTree-treeNode--group')
  expect(resolveProjectHierarchyTreeTreeNodeKindClass('templatePlacement')).toBe('projectHierarchyTree-treeNode--documentTemplate')
  expect(resolveProjectHierarchyTreeTreeNodeKindClass('document')).toBe('projectHierarchyTree-treeNode--document')
  expect(PROJECT_HIERARCHY_TREE_TREE_NODE_KIND_CLASS_LIST).toHaveLength(4)
})
