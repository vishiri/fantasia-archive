/** @vitest-environment jsdom */
import { expect, test } from 'vitest'

import type {
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'
import {
  mapWorkspaceLayoutToHierarchyTreeSkeleton,
  patchHierarchyTreeSkeletonLabelsInPlace
} from '../mapWorkspaceLayoutToHierarchyTreeSkeleton'
import { mapHierarchyDocumentChildrenToTreeNodes } from '../mapHierarchyDocumentChildrenToTreeNodes'
import { applyProjectHierarchyTreeSiblingOrderToTreeData } from '../../scripts/projectHierarchyTreeSiblingOrderPatchWiring'
import { refreshProjectHierarchyTreeAddNewDocumentLabelsInTree } from '../../scripts/projectHierarchyTreeAddNewDocumentNode'
import { isProjectHierarchyTreeSameBucketSiblingReorder } from '../projectHierarchyTreeSameBucketSiblingReorder'
import { createWaitForProjectHierarchyTreeDragCommitWindow } from '../waitForProjectHierarchyTreeDragCommitWindow'
import { createWaitForProjectHierarchyTreeDragGetDataOrderStable } from '../../scripts/projectHierarchyTreeDragGetDataOrderStableWiring'
import { areProjectHierarchyTreeOrderedDocumentIdsEqual } from '../projectHierarchyTreeOrderedDocumentIdsEqual'
import { computeProjectHierarchyTreePostDropSiblingOrder } from '../computeProjectHierarchyTreePostDropSiblingOrder'
import {
  finalizeProjectHierarchyTreeDragSiblingOrderSnapshot,
  resolveProjectHierarchyTreeDragSiblingOrderSnapshot
} from '../../scripts/projectHierarchyTreeDragSiblingOrderSnapshotWiring'
import { PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON } from '../projectHierarchyTreeConstants'
import { createResolveProjectHierarchyTreePlacementDisplayIcon } from '../projectHierarchyTreePlacementDisplayIcon'
import {
  applyPersistedProjectHierarchyTreeOpenNodeIds,
  collectProjectHierarchyTreeLatentDocumentOpenNodeIds,
  collectProjectHierarchyTreePersistedExpandedNodeIds,
  isProjectHierarchyTreeNodePersistableInOpenSet
} from '../projectHierarchyTreePersistedOpenNodeIds'
import {
  collectProjectHierarchyTreeAncestorIds,
  collectProjectHierarchyTreeDescendantIds,
  evictCollapsedNodeChildren,
  findProjectHierarchyTreeNodeById,
  needsProjectHierarchyTreeLazyLoadBeforeOpen
} from '../projectHierarchyTreeExpandState'
import {
  buildProjectHierarchyTreeVisibleFlatVirtualScrollKey,
  collectProjectHierarchyTreeVisibleFlatNodes
} from '../projectHierarchyTreeVisibleFlatNodes'
import { mergeLoadedChildrenIntoNode } from '../projectHierarchyTreeMergeLoadedChildren'
import {
  isProjectHierarchyTreeNodeDraggable,
  isProjectHierarchyTreeNodeDroppable,
  isProjectHierarchyTreeRootDroppable,
  resolvePlacementIdFromHeTreeNode,
  resolveProjectHierarchyTreeDragContext
} from '../projectHierarchyTreeDnD'
import { findProjectHierarchyTreeDocumentsWithInvalidPlacementParent } from '../projectHierarchyTreeDocumentPlacementGuard'
import { replaceProjectHierarchyTreeNodeByIdInPlace } from '../projectHierarchyTreeCloneLoadedNodeForPublish'
import { resolveProjectHierarchyTreeDragExpandedSnapshot, captureProjectHierarchyTreeDragExpandSnapshots } from '../../scripts/projectHierarchyTreeDragExpandSnapshotWiring'
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
  PROJECT_HIERARCHY_TREE_NODE_ROW_KIND_CLASS_LIST,
  PROJECT_HIERARCHY_TREE_TREE_NODE_KIND_CLASS_LIST,
  resolveProjectHierarchyTreeNodeRowKindClass,
  resolveProjectHierarchyTreeTreeNodeKindClass
} from '../projectHierarchyTreeTreeNodeKindClass'
import { resolveProjectHierarchyTreeHeTreeNodeKey } from '../projectHierarchyTreeHeTreeNodeKey'
import {
  shouldDeferProjectHierarchyTreeWorldsExpandRestore
} from '../projectHierarchyTreeDragExpandFreeze'
import {
  expandProjectHierarchyTreeExpandedNodeIdsWithAncestors
} from '../projectHierarchyTreeExpandState'
import {
  clampProjectHierarchyTreeScrollTopToLastDomRow,
  readProjectHierarchyTreeLastDomRowViewportGapPx,
  readProjectHierarchyTreeVtlistInnerMetrics,
  shouldClampProjectHierarchyTreeVirtualScrollTail
} from '../projectHierarchyTreeVirtualScrollClamp'

const resolveProjectHierarchyTreePlacementDisplayIcon = createResolveProjectHierarchyTreePlacementDisplayIcon({
  defaultPlacementIcon: PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON
})

const sampleWorld = {
  color: '#ff0000',
  colorPallete: '',
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
      titlePluralTranslations: {},
      titleSingularTranslations: {},
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
      titlePluralTranslations: {},
      titleSingularTranslations: {},
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
  expect(tree[0]?.children[1]?.hasChildren).toBe(true)
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
    documentTemplateId: 'template-1',
    groupId: null,
    hasChildren: false,
    icon: 'mdi-plus',
    id: 'placement-1__add-new',
    label: 'Add new character',
    nodeKind: 'addNewDocument',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  })).toBe(false)
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
  })).toBe(false)
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
    titlePluralTranslations: {},
    titleSingularTranslations: {},
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

test('Test that needsProjectHierarchyTreeLazyLoadBeforeOpen is true only for unloaded lazy rows', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([
    {
      color: '#ff0000',
      colorPallete: '',
      displayName: 'World A',
      groups: [],
      id: 'world-1',
      placements: [
        {
          displayName: 'Character',
          documentTemplateId: 'template-1',
          groupId: null,
          groupSortOrder: null,
          hasChildren: true,
          icon: 'mdi-account',
          id: 'placement-1',
          nickname: '',
          titlePluralTranslations: {},
          titleSingularTranslations: {},
          rootSortOrder: 0,
          worldId: 'world-1'
        }
      ],
      sortOrder: 0
    }
  ])
  const placement = tree[0]!.children[0]!
  expect(needsProjectHierarchyTreeLazyLoadBeforeOpen(placement)).toBe(true)
  placement.childrenLoaded = true
  expect(needsProjectHierarchyTreeLazyLoadBeforeOpen(placement)).toBe(false)
  placement.childrenLoaded = false
  placement.hasChildren = false
  expect(needsProjectHierarchyTreeLazyLoadBeforeOpen(placement)).toBe(false)
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
          nickname: 'Renamed heroes',
          titlePluralTranslations: {},
          titleSingularTranslations: {},
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
    titlePluralTranslations: {},
    titleSingularTranslations: {},
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

test('Test that projectHierarchyTreeDnD allows direct parent droppable for nested sibling reorder', () => {
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
  expect(isProjectHierarchyTreeNodeDroppable(parentDocument, dragContext, tree)).toBe(true)
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

test('Test that projectHierarchyTreeDnD allows parent droppable without tree parent walk', () => {
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
  expect(isProjectHierarchyTreeNodeDroppable(parentDocument, dragContext, tree)).toBe(true)
})

test('Test that projectHierarchyTreeDnD rejects add-new rows as drag sources and drop targets', () => {
  const addNewNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: null,
    documentTemplateId: 'template-1',
    groupId: null,
    hasChildren: false,
    icon: 'mdi-plus',
    id: 'placement-1__add-new',
    label: 'Add new character',
    nodeKind: 'addNewDocument',
    placementId: 'placement-1',
    titlePluralTranslations: {},
    titleSingularTranslations: {},
    worldColor: '#000',
    worldId: 'world-1'
  }
  expect(isProjectHierarchyTreeNodeDraggable(addNewNode)).toBe(false)
  expect(isProjectHierarchyTreeNodeDroppable(addNewNode, {
    dragNode: {
      data: {
        children: [],
        childrenLoaded: true,
        documentId: 'doc-a',
        groupId: null,
        hasChildren: false,
        icon: '',
        id: 'doc-a',
        label: 'Doc',
        nodeKind: 'document',
        placementId: 'placement-1',
        worldColor: '#000',
        worldId: 'world-1'
      }
    }
  })).toBe(false)
})

test('Test that projectHierarchyTreeDnD rejects document targets that are not sibling rows', () => {
  const placeholderDocument: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: false,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'doc-placeholder',
    label: 'Loading',
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const draggedDocument: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-a',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-a',
    label: 'Doc',
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  expect(isProjectHierarchyTreeNodeDroppable(placeholderDocument, {
    dragNode: {
      data: draggedDocument
    }
  })).toBe(false)
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
          nickname: 'Renamed heroes',
          titlePluralTranslations: {},
          titleSingularTranslations: {},
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

/**
 * applyPersistedProjectHierarchyTreeOpenNodeIds keeps descendants when a latent-expand ancestor row is absent.
 */
test('Test that applyPersistedProjectHierarchyTreeOpenNodeIds keeps descendants under collapsed world', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(
    applyPersistedProjectHierarchyTreeOpenNodeIds(tree, ['group-1', 'placement-1'])
  ).toEqual(['group-1', 'placement-1'])
  expect(
    applyPersistedProjectHierarchyTreeOpenNodeIds(tree, ['world-1', 'placement-1'])
  ).toEqual(['world-1', 'placement-1'])
})

test('Test that applyPersistedProjectHierarchyTreeOpenNodeIds keeps latent document ids under collapsed placement', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(
    applyPersistedProjectHierarchyTreeOpenNodeIds(tree, [
      'world-1',
      'group-1',
      'doc-a',
      'doc-b'
    ])
  ).toEqual([
    'world-1',
    'group-1',
    'doc-a',
    'doc-b'
  ])
})

test('Test that applyPersistedProjectHierarchyTreeOpenNodeIds keeps latent document ids before lazy load', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(
    applyPersistedProjectHierarchyTreeOpenNodeIds(tree, [
      'world-1',
      'group-1',
      'placement-1',
      'doc-parent',
      'doc-child'
    ])
  ).toEqual([
    'world-1',
    'group-1',
    'placement-1',
    'doc-parent',
    'doc-child'
  ])
})

test('Test that collectProjectHierarchyTreePersistedExpandedNodeIds keeps latent document ids', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(
    collectProjectHierarchyTreePersistedExpandedNodeIds(
      tree,
      new Set(['world-1', 'group-1', 'placement-1', 'doc-a', 'doc-b'])
    )
  ).toEqual(['world-1', 'group-1', 'placement-1', 'doc-a', 'doc-b'])
})

/**
 * collectProjectHierarchyTreePersistedExpandedNodeIds mirrors latent descendant ids from the open set.
 */
test('Test that collectProjectHierarchyTreePersistedExpandedNodeIds keeps latent descendant ids', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(
    collectProjectHierarchyTreePersistedExpandedNodeIds(
      tree,
      new Set(['group-1', 'placement-1'])
    )
  ).toEqual(['group-1', 'placement-1'])
})

test('Test that collectProjectHierarchyTreeVisibleFlatNodes skips collapsed descendants', () => {
  const worldNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [{
      children: [{
        children: [],
        childrenLoaded: true,
        documentId: 'doc-nested',
        groupId: 'group-1',
        hasChildren: false,
        icon: '',
        id: 'doc-nested',
        label: 'Nested doc',
        nodeKind: 'document',
        placementId: 'placement-1',
        worldColor: '#aabbcc',
        worldId: 'world-1'
      }],
      childrenLoaded: true,
      documentId: null,
      groupId: 'group-1',
      hasChildren: true,
      icon: '',
      id: 'group-1',
      label: 'Group',
      nodeKind: 'group',
      placementId: null,
      worldColor: '#aabbcc',
      worldId: 'world-1'
    }],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    worldColor: '#aabbcc',
    worldId: 'world-1'
  }
  const collapsed = collectProjectHierarchyTreeVisibleFlatNodes(
    [worldNode],
    new Set(['world-1'])
  )
  expect(collapsed.map((node) => node.id)).toEqual(['world-1', 'group-1'])
  const expanded = collectProjectHierarchyTreeVisibleFlatNodes(
    [worldNode],
    new Set(['world-1', 'group-1'])
  )
  expect(expanded.map((node) => node.id)).toEqual(['world-1', 'group-1', 'doc-nested'])
})

test('Test that collectProjectHierarchyTreeLatentDocumentOpenNodeIds rejects lazy placeholders and known nodes', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const latentIds = collectProjectHierarchyTreeLatentDocumentOpenNodeIds(tree, [
    'placement-1',
    'placement-1__lazy',
    'group-1',
    'doc-latent',
    'not-a-document'
  ])
  expect(latentIds).toEqual(['doc-latent'])
})

test('Test that isProjectHierarchyTreeNodePersistableInOpenSet rejects unknown nodes', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(
    isProjectHierarchyTreeNodePersistableInOpenSet(tree, 'missing-node', new Set())
  ).toBe(false)
})

test('Test that applyPersistedProjectHierarchyTreeOpenNodeIds keeps placement ids with collapsed group ancestor', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(
    applyPersistedProjectHierarchyTreeOpenNodeIds(tree, ['placement-1'])
  ).toEqual(['placement-1'])
})

test('Test that collectProjectHierarchyTreeLatentDocumentOpenNodeIds accepts uuid document ids', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const latentId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  expect(
    collectProjectHierarchyTreeLatentDocumentOpenNodeIds(tree, [latentId])
  ).toEqual([latentId])
})

test('Test that isProjectHierarchyTreeNodePersistableInOpenSet keeps placement under collapsed group', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(
    isProjectHierarchyTreeNodePersistableInOpenSet(
      tree,
      'placement-1',
      new Set(['world-1', 'placement-1'])
    )
  ).toBe(true)
})

test('Test that isProjectHierarchyTreeNodePersistableInOpenSet rejects nested rows under collapsed add-new ancestor', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!.children[0]!
  placement.children = [
    {
      children: [
        {
          children: [],
          childrenLoaded: true,
          documentId: 'doc-nested',
          groupId: 'group-1',
          hasChildren: false,
          icon: '',
          id: 'doc-nested',
          label: 'Nested',
          nodeKind: 'document',
          placementId: 'placement-1',
          worldColor: '#000',
          worldId: 'world-1'
        }
      ],
      childrenLoaded: true,
      documentId: null,
      groupId: 'group-1',
      hasChildren: true,
      icon: '',
      id: 'add-new-placement-1',
      label: 'Add new',
      nodeKind: 'addNewDocument',
      placementId: 'placement-1',
      worldColor: '#000',
      worldId: 'world-1'
    }
  ]
  expect(
    isProjectHierarchyTreeNodePersistableInOpenSet(
      tree,
      'doc-nested',
      new Set(['world-1', 'group-1', 'placement-1', 'doc-nested'])
    )
  ).toBe(false)
})

test('Test that mapWorkspaceLayoutToHierarchyTreeSkeleton always adds lazy placeholder on template placements', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([
    {
      color: '#000',
      colorPallete: '',
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
          titlePluralTranslations: {},
          titleSingularTranslations: {},
          id: 'placement-solo',
          nickname: '',
          rootSortOrder: 0,
          worldId: 'world-solo'
        }
      ],
      sortOrder: 0
    }
  ])
  const placement = tree[0]?.children[0]
  expect(placement?.hasChildren).toBe(true)
  expect(placement?.children).toHaveLength(1)
  expect(placement?.children[0]?.id).toBe('placement-solo__lazy')
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
        nickname: 'Late',
        titlePluralTranslations: {},
        titleSingularTranslations: {},
      },
      {
        ...sampleWorld.placements[0]!,
        groupSortOrder: 1,
        id: 'placement-early',
        nickname: 'Early',
        titlePluralTranslations: {},
        titleSingularTranslations: {},
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
    colorPallete: '',
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
      colorPallete: '',
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
  ).toEqual([
    'world-1',
    'group-1',
    'placement-1',
    'placement-2'
  ])
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

test('Test that resolveProjectHierarchyTreeDragExpandedSnapshot keeps nested persisted opens when live DOM is partial during drag', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const openIds = new Set(['world-1', 'group-1', 'placement-1', 'placement-2'])
  expect(
    resolveProjectHierarchyTreeDragExpandedSnapshot(
      tree,
      ['world-1', 'group-1'],
      [],
      openIds,
      true
    )
  ).toEqual([
    'world-1',
    'group-1',
    'placement-1',
    'placement-2'
  ])
})

test('Test that drag restore snapshot keeps latent ids when ui freeze snapshot drops collapsed world descendants', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const openIds = new Set(['group-1', 'placement-1'])
  const snapshots = captureProjectHierarchyTreeDragExpandSnapshots({
    collapsedVisibleNodeIds: ['world-1'],
    liveExpandedNodeIds: [],
    openNodeIds: openIds,
    scrollHostPresent: true,
    treeNodes: tree
  })
  expect(snapshots.persistedExpandSnapshot).toEqual(['group-1', 'placement-1'])
  expect(snapshots.uiFreezeSnapshot).toEqual([])
})

test('Test that collectProjectHierarchyTreeDescendantIds walks nested children', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const worldNode = tree[0]!
  expect(collectProjectHierarchyTreeDescendantIds(worldNode)).toEqual([
    'group-1',
    'placement-1',
    'placement-1__lazy',
    'placement-2',
    'placement-2__lazy'
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
  expect(placementNode?.hasChildren).toBe(true)
  expect(placementNode?.children).toHaveLength(1)
  expect(placementNode?.children[0]?.id).toBe('placement-1__lazy')
  patchHierarchyTreeSkeletonLabelsInPlace(tree, [sampleWorld])
  expect(placementNode?.hasChildren).toBe(true)
  expect(placementNode?.children).toHaveLength(1)
  expect(placementNode?.children[0]?.id).toBe('placement-1__lazy')
})

/**
 * patchHierarchyTreeSkeletonLabelsInPlace keeps template placements expandable when IPC hasChildren is false.
 */
test('Test that patchHierarchyTreeSkeletonLabelsInPlace keeps placement expandable when IPC hasChildren is false', () => {
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
  expect(placementNode.hasChildren).toBe(true)
  expect(placementNode.children).toHaveLength(1)
  expect(placementNode.children[0]?.id).toBe('placement-1__lazy')
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
  refreshProjectHierarchyTreeAddNewDocumentLabelsInTree(tree, 'en-US')
  expect(placementNode.children).toHaveLength(2)
  expect(placementNode.children[0]?.id).toBe('doc-1')
  expect(placementNode.children[1]?.nodeKind).toBe('addNewDocument')
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
 * resolveProjectHierarchyTreePlacementDisplayIcon falls back to default document icon.
 */
test('Test that resolveProjectHierarchyTreePlacementDisplayIcon falls back for empty icon', () => {
  expect(resolveProjectHierarchyTreePlacementDisplayIcon('')).toBe('mdi-file-outline')
  expect(resolveProjectHierarchyTreePlacementDisplayIcon('  ')).toBe('mdi-file-outline')
  expect(resolveProjectHierarchyTreePlacementDisplayIcon('mdi-account')).toBe('mdi-account')
})

/**
 * mapWorkspaceLayoutToHierarchyTreeSkeleton applies default icon for unset template placements.
 */
test('Test that mapWorkspaceLayoutToHierarchyTreeSkeleton applies default placement icon', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([{
    ...sampleWorld,
    placements: [
      {
        displayName: 'Untitled template',
        documentTemplateId: 'template-empty',
        groupId: null,
        groupSortOrder: null,
        hasChildren: false,
        icon: '',
        titlePluralTranslations: {},
        titleSingularTranslations: {},
        id: 'placement-empty',
        nickname: '',
        rootSortOrder: 0,
        worldId: 'world-1'
      }
    ],
    groups: []
  }])
  expect(tree[0]?.children[0]?.icon).toBe('mdi-file-outline')
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

test('Test that mapHierarchyDocumentChildrenToTreeNodes copies document appearance colors', () => {
  const nodes = mapHierarchyDocumentChildrenToTreeNodes({
    items: [
      {
        displayName: 'Doc 1',
        documentBackgroundColor: '#112233',
        documentTextColor: '#aabbcc',
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
  expect(nodes[0]?.documentTextColor).toBe('#aabbcc')
  expect(nodes[0]?.documentBackgroundColor).toBe('#112233')
})

test('Test that mapHierarchyDocumentChildrenToTreeNodes applies default icon when placement icon unset', () => {
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
    placementIcon: '',
    worldColor: '#000',
    worldId: 'world-1'
  })
  expect(nodes[0]?.icon).toBe('mdi-file-outline')
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
      colorPallete: '',
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

test('Test that projectHierarchyTreeNodeShowsOpenIcon uses loaded document child rows', () => {
  const loadedChild = {
    children: [],
    childrenLoaded: false,
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
    children: [loadedChild],
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
  expect(projectHierarchyTreeNodeShowsOpenIcon(parentDocument, 0)).toBe(true)
})

test('Test that syncProjectHierarchyTreeDocumentHasChildrenFlags keeps parents with loaded document children', () => {
  const loadedChild = {
    children: [],
    childrenLoaded: false,
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
  const parentNode = {
    children: [loadedChild],
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
  expect(emptiedParentDocumentIds).toEqual([])
  expect(parentNode.hasChildren).toBe(true)
  expect(parentNode.childrenLoaded).toBe(true)
})

test('Test that mapProjectHierarchyTreeToTopologyKey sorts root placement ids deterministically', () => {
  const worldWithRootPlacements = {
    ...sampleWorld,
    groups: [],
    placements: [
      {
        ...sampleWorld.placements[1]!,
        id: 'placement-z',
        rootSortOrder: 1
      },
      {
        ...sampleWorld.placements[1]!,
        displayName: 'Earlier placement',
        id: 'placement-a',
        rootSortOrder: 0
      }
    ]
  }
  const key = mapProjectHierarchyTreeToTopologyKey(
    mapWorkspaceLayoutToHierarchyTreeSkeleton([worldWithRootPlacements])
  )
  expect(key.indexOf('placement-a')).toBeLessThan(key.indexOf('placement-z'))
})

/**
 * resolveProjectHierarchyTreeTreeNodeKindClass maps each node kind to a he-tree row class.
 */
test('Test that resolveProjectHierarchyTreeTreeNodeKindClass maps node kinds', () => {
  expect(resolveProjectHierarchyTreeTreeNodeKindClass('world')).toBe('projectHierarchyTree-treeNode--world')
  expect(resolveProjectHierarchyTreeTreeNodeKindClass('group')).toBe('projectHierarchyTree-treeNode--group')
  expect(resolveProjectHierarchyTreeTreeNodeKindClass('templatePlacement')).toBe('projectHierarchyTree-treeNode--documentTemplate')
  expect(resolveProjectHierarchyTreeTreeNodeKindClass('document')).toBe('projectHierarchyTree-treeNode--document')
  expect(resolveProjectHierarchyTreeTreeNodeKindClass('addNewDocument')).toBe('projectHierarchyTree-treeNode--addNewDocument')
  expect(PROJECT_HIERARCHY_TREE_TREE_NODE_KIND_CLASS_LIST).toHaveLength(5)
})

/**
 * resolveProjectHierarchyTreeNodeRowKindClass maps each node kind to a row-slot class.
 */
test('Test that resolveProjectHierarchyTreeNodeRowKindClass maps node kinds', () => {
  expect(resolveProjectHierarchyTreeNodeRowKindClass('world')).toBe('projectHierarchyTree__nodeRow--world')
  expect(resolveProjectHierarchyTreeNodeRowKindClass('group')).toBe('projectHierarchyTree__nodeRow--group')
  expect(resolveProjectHierarchyTreeNodeRowKindClass('templatePlacement')).toBe('projectHierarchyTree__nodeRow--documentTemplate')
  expect(resolveProjectHierarchyTreeNodeRowKindClass('document')).toBe('projectHierarchyTree__nodeRow--document')
  expect(resolveProjectHierarchyTreeNodeRowKindClass('addNewDocument')).toBe('projectHierarchyTree__nodeRow--addNewDocument')
  expect(PROJECT_HIERARCHY_TREE_NODE_ROW_KIND_CLASS_LIST).toHaveLength(5)
})

test('Test that findProjectHierarchyTreeDocumentsWithInvalidPlacementParent flags world-level documents', () => {
  const escapedDocument: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-escaped',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-escaped',
    label: 'Escaped',
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const worldNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [escapedDocument],
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
  }
  expect(findProjectHierarchyTreeDocumentsWithInvalidPlacementParent([worldNode])).toEqual([{
    documentId: 'doc-escaped',
    parentNodeId: 'world-1',
    parentNodeKind: 'world'
  }])
})

test('Test that findProjectHierarchyTreeDocumentsWithInvalidPlacementParent accepts placement children', () => {
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
  const placementNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [documentNode],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    titlePluralTranslations: {},
    titleSingularTranslations: {},
    id: 'placement-1',
    label: 'Placement',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  expect(findProjectHierarchyTreeDocumentsWithInvalidPlacementParent([placementNode])).toEqual([])
})

test('Test that mapHierarchyDocumentChildrenToTreeNodes sorts rows by sortOrder', () => {
  const nodes = mapHierarchyDocumentChildrenToTreeNodes({
    items: [
      {
        displayName: 'Test Document - Buildings 07',
        hasChildren: false,
        id: 'doc-7',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 6
      },
      {
        displayName: 'Test Document - Buildings 01',
        hasChildren: false,
        id: 'doc-1',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 0
      },
      {
        displayName: 'Test Document - Buildings 04',
        hasChildren: false,
        id: 'doc-4',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 3
      }
    ],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  expect(nodes.map((node) => node.label)).toEqual([
    'Test Document - Buildings 01',
    'Test Document - Buildings 04',
    'Test Document - Buildings 07'
  ])
})

test('Test that waitForProjectHierarchyTreeDragCommitWindow polls until suppress clears', async () => {
  let suppressTreeEmit = true
  let tickCount = 0
  const waitForDragCommitWindow = createWaitForProjectHierarchyTreeDragCommitWindow({
    maxAttempts: 5,
    nextTick: async () => {
      tickCount += 1
      if (tickCount >= 2) {
        suppressTreeEmit = false
      }
    },
    readSuppressTreeEmit: () => suppressTreeEmit
  })
  const result = await waitForDragCommitWindow()
  expect(result.ready).toBe(true)
  expect(result.attempts).toBe(2)
})

test('Test that waitForProjectHierarchyTreeDragCommitWindow returns not ready after max attempts', async () => {
  const waitForDragCommitWindow = createWaitForProjectHierarchyTreeDragCommitWindow({
    maxAttempts: 2,
    nextTick: async () => undefined,
    readSuppressTreeEmit: () => true
  })
  const result = await waitForDragCommitWindow()
  expect(result.ready).toBe(false)
  expect(result.attempts).toBe(2)
})

test('Test that waitForProjectHierarchyTreeDragCommitWindow returns immediately when ready', async () => {
  const waitForDragCommitWindow = createWaitForProjectHierarchyTreeDragCommitWindow({
    nextTick: async () => undefined,
    readSuppressTreeEmit: () => false
  })
  const result = await waitForDragCommitWindow()
  expect(result.ready).toBe(true)
  expect(result.attempts).toBe(0)
})

test('Test that waitForProjectHierarchyTreeDragGetDataOrderStable polls until order is stable', async () => {
  let tickCount = 0
  const orders = [['doc-2', 'doc-1'], ['doc-1', 'doc-2'], ['doc-1', 'doc-2']]
  const waitForGetDataOrderStable = createWaitForProjectHierarchyTreeDragGetDataOrderStable({
    maxAttempts: 5,
    nextTick: async () => {
      tickCount += 1
    },
    readSiblingOrderFromGetData: () => orders.shift() ?? ['doc-1', 'doc-2']
  })
  const result = await waitForGetDataOrderStable()
  expect(result.settled).toBe(true)
  expect(result.orderedDocumentIds).toEqual(['doc-1', 'doc-2'])
  expect(result.attempts).toBe(3)
  expect(tickCount).toBe(2)
})

test('Test that waitForProjectHierarchyTreeDragGetDataOrderStable returns not settled after max attempts', async () => {
  const waitForGetDataOrderStable = createWaitForProjectHierarchyTreeDragGetDataOrderStable({
    maxAttempts: 2,
    nextTick: async () => undefined,
    readSiblingOrderFromGetData: () => null
  })
  const result = await waitForGetDataOrderStable()
  expect(result.settled).toBe(false)
  expect(result.attempts).toBe(2)
  expect(result.orderedDocumentIds).toBeNull()
})

test('Test that areProjectHierarchyTreeOrderedDocumentIdsEqual compares sibling ids', () => {
  expect(areProjectHierarchyTreeOrderedDocumentIdsEqual(['doc-1'], ['doc-1'])).toBe(true)
  expect(areProjectHierarchyTreeOrderedDocumentIdsEqual(['doc-1', 'doc-2'], ['doc-2', 'doc-1'])).toBe(false)
})

test('Test that computeProjectHierarchyTreePostDropSiblingOrder applies he-tree same-parent index adjust', () => {
  expect(computeProjectHierarchyTreePostDropSiblingOrder({
    dragStartIndex: 0,
    dragStartOrderedDocumentIds: ['doc-a', 'doc-b', 'doc-c', 'doc-d'],
    movedDocumentId: 'doc-a',
    sameParentReorder: true,
    targetIndexBeforeDrop: 3
  })).toEqual(['doc-b', 'doc-c', 'doc-a', 'doc-d'])
  expect(computeProjectHierarchyTreePostDropSiblingOrder({
    dragStartIndex: 3,
    dragStartOrderedDocumentIds: ['doc-a', 'doc-b', 'doc-c', 'doc-d'],
    movedDocumentId: 'doc-d',
    sameParentReorder: true,
    targetIndexBeforeDrop: 0
  })).toEqual(['doc-d', 'doc-a', 'doc-b', 'doc-c'])
})

test('Test that mapProjectHierarchyTreeDocumentLabelsForOrderedIds resolves labels from tree nodes', async () => {
  const { mapProjectHierarchyTreeDocumentLabelsForOrderedIds } = await import(
    '../mapProjectHierarchyTreeDocumentLabelsForOrderedIds'
  )
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]?.children[0]
  expect(placement).toBeDefined()
  if (placement !== undefined) {
    placement.children = [
      {
        children: [],
        childrenLoaded: true,
        documentId: 'doc-1',
        groupId: null,
        hasChildren: false,
        icon: '',
        id: 'doc-1',
        label: 'First',
        nodeKind: 'document',
        placementId: 'placement-1',
        worldColor: '#000',
        worldId: 'world-1'
      },
      {
        children: [],
        childrenLoaded: true,
        documentId: 'doc-2',
        groupId: null,
        hasChildren: false,
        icon: '',
        id: 'doc-2',
        label: 'Second',
        nodeKind: 'document',
        placementId: 'placement-1',
        worldColor: '#000',
        worldId: 'world-1'
      }
    ]
    placement.childrenLoaded = true
  }
  expect(mapProjectHierarchyTreeDocumentLabelsForOrderedIds(tree, ['doc-2', 'doc-1'])).toEqual([
    'Second',
    'First'
  ])
})

test('Test that waitForProjectHierarchyTreeDragModelSettle polls until model settled', async () => {
  let tickCount = 0
  let settled = false
  const { createWaitForProjectHierarchyTreeDragModelSettle } = await import('../waitForProjectHierarchyTreeDragModelSettle')
  const waitForModelSettle = createWaitForProjectHierarchyTreeDragModelSettle({
    maxAttempts: 5,
    nextTick: async () => {
      tickCount += 1
      if (tickCount >= 2) {
        settled = true
      }
    },
    readModelSettled: () => settled
  })
  const result = await waitForModelSettle()
  expect(result.settled).toBe(true)
  expect(result.attempts).toBe(3)
  expect(tickCount).toBe(2)
})

test('Test that waitForProjectHierarchyTreeDragModelSettle returns not settled after max attempts', async () => {
  const { createWaitForProjectHierarchyTreeDragModelSettle } = await import('../waitForProjectHierarchyTreeDragModelSettle')
  const waitForModelSettle = createWaitForProjectHierarchyTreeDragModelSettle({
    maxAttempts: 2,
    nextTick: async () => undefined,
    readModelSettled: () => false
  })
  const result = await waitForModelSettle()
  expect(result.settled).toBe(false)
  expect(result.attempts).toBe(2)
})

test('Test that resolveProjectHierarchyTreeDragSiblingOrderSnapshot reads sibling ids in tree order', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const children = mapHierarchyDocumentChildrenToTreeNodes({
    items: [
      {
        displayName: 'Doc 2',
        hasChildren: false,
        id: 'doc-2',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 1
      },
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
  mergeLoadedChildrenIntoNode(tree, 'placement-1', children)
  const placement = findProjectHierarchyTreeNodeById(tree, 'placement-1')!
  placement.children = [placement.children[1]!, placement.children[0]!]
  const snapshot = resolveProjectHierarchyTreeDragSiblingOrderSnapshot(tree, 'doc-1')
  expect(snapshot).toEqual({
    orderedDocumentIds: ['doc-2', 'doc-1'],
    parentDocumentId: null,
    placementId: 'placement-1'
  })
})

test('Test that clampProjectHierarchyTreeScrollTopToLastDomRow removes viewport gap below last row', () => {
  const scrollContainer = document.createElement('div')
  scrollContainer.className = 'projectHierarchyTree'
  Object.defineProperty(scrollContainer, 'clientHeight', {
    value: 400,
    configurable: true
  })
  Object.defineProperty(scrollContainer, 'scrollHeight', {
    value: 900,
    configurable: true
  })
  Object.defineProperty(scrollContainer, 'scrollTop', {
    value: 500,
    writable: true,
    configurable: true
  })
  scrollContainer.getBoundingClientRect = () => ({
    bottom: 400,
    height: 400,
    left: 0,
    right: 200,
    top: 0,
    width: 200,
    x: 0,
    y: 0,
    toJSON: () => ({})
  })
  const inner = document.createElement('div')
  inner.className = 'vtlist-inner'
  const row = document.createElement('div')
  row.className = 'tree-node'
  row.getBoundingClientRect = () => ({
    bottom: 200,
    height: 32,
    left: 0,
    right: 200,
    top: 168,
    width: 200,
    x: 0,
    y: 168,
    toJSON: () => ({})
  })
  inner.append(row)
  scrollContainer.append(inner)
  const clampResult = clampProjectHierarchyTreeScrollTopToLastDomRow(scrollContainer)
  expect(clampResult.adjusted).toBe(true)
  expect(clampResult.gapBelowLastRowPx).toBeGreaterThan(190)
  expect(scrollContainer.scrollTop).toBeLessThan(500)
})

test('Test that resolveProjectHierarchyTreeHeTreeNodeKey uses stable node id', () => {
  expect(resolveProjectHierarchyTreeHeTreeNodeKey({
    data: {
      id: 'world-1'
    } as I_faProjectHierarchyTreeHeTreeNode
  }, 99)).toBe('world-1')
})

test('Test that buildProjectHierarchyTreeVisibleFlatVirtualScrollKey joins visible flat ids', () => {
  const worldNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [{
      children: [],
      childrenLoaded: true,
      documentId: null,
      groupId: 'group-1',
      hasChildren: false,
      icon: '',
      id: 'group-1',
      label: 'Group',
      nodeKind: 'group',
      placementId: null,
      worldColor: '#aabbcc',
      worldId: 'world-1'
    }],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    worldColor: '#aabbcc',
    worldId: 'world-1'
  }
  expect(buildProjectHierarchyTreeVisibleFlatVirtualScrollKey(
    [worldNode],
    new Set(['world-1', 'group-1'])
  )).toBe('world-1|group-1')
})

test('Test that shouldDeferProjectHierarchyTreeWorldsExpandRestore covers drag guard flags', () => {
  const base = {
    dragCommitPending: false,
    dragCommitScheduled: false,
    dragExpandPostCommitGuard: false,
    dragExpandUiFrozen: false,
    dragExpandedSnapshotNodeIds: null as string[] | null
  }
  expect(shouldDeferProjectHierarchyTreeWorldsExpandRestore(base)).toBe(false)
  expect(shouldDeferProjectHierarchyTreeWorldsExpandRestore({
    ...base,
    dragExpandUiFrozen: true
  })).toBe(true)
  expect(shouldDeferProjectHierarchyTreeWorldsExpandRestore({
    ...base,
    dragCommitPending: true
  })).toBe(true)
  expect(shouldDeferProjectHierarchyTreeWorldsExpandRestore({
    ...base,
    dragCommitScheduled: true
  })).toBe(true)
  expect(shouldDeferProjectHierarchyTreeWorldsExpandRestore({
    ...base,
    dragExpandPostCommitGuard: true
  })).toBe(true)
  expect(shouldDeferProjectHierarchyTreeWorldsExpandRestore({
    ...base,
    dragExpandedSnapshotNodeIds: ['world-1']
  })).toBe(true)
  expect(shouldDeferProjectHierarchyTreeWorldsExpandRestore({
    ...base,
    dragExpandedSnapshotNodeIds: []
  })).toBe(false)
})

test('Test that expandProjectHierarchyTreeExpandedNodeIdsWithAncestors adds ancestor ids', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placementChildren = mapHierarchyDocumentChildrenToTreeNodes({
    items: [{
      displayName: 'Nested',
      hasChildren: true,
      id: 'doc-nested',
      parentDocumentId: null,
      placementId: 'placement-1',
      sortOrder: 0
    }],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree, 'placement-1', placementChildren)
  const nestedChildren = mapHierarchyDocumentChildrenToTreeNodes({
    items: [{
      displayName: 'Child',
      hasChildren: false,
      id: 'doc-child',
      parentDocumentId: 'doc-nested',
      placementId: 'placement-1',
      sortOrder: 0
    }],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree, 'doc-nested', nestedChildren)
  const expanded = expandProjectHierarchyTreeExpandedNodeIdsWithAncestors(
    tree,
    ['doc-child']
  )
  expect(expanded).toContain('doc-child')
  expect(expanded).toContain('doc-nested')
  expect(expanded).toContain('placement-1')
  expect(expanded).toContain('world-1')
})

test('Test that mergeLoadedChildrenIntoNode preserves loaded document subtrees on remerge', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const firstLoad = mapHierarchyDocumentChildrenToTreeNodes({
    items: [{
      displayName: 'Parent',
      hasChildren: true,
      id: 'doc-parent',
      parentDocumentId: null,
      placementId: 'placement-1',
      sortOrder: 0
    }],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree, 'placement-1', firstLoad)
  const nestedLoad = mapHierarchyDocumentChildrenToTreeNodes({
    items: [{
      displayName: 'Child',
      hasChildren: false,
      id: 'doc-child',
      parentDocumentId: 'doc-parent',
      placementId: 'placement-1',
      sortOrder: 0
    }],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree, 'doc-parent', nestedLoad)
  const parentBefore = findProjectHierarchyTreeNodeById(tree, 'doc-parent')
  expect(parentBefore?.children.map((child) => child.id)).toEqual(['doc-child'])
  const refreshLoad = mapHierarchyDocumentChildrenToTreeNodes({
    items: [{
      displayName: 'Parent refreshed',
      hasChildren: true,
      id: 'doc-parent',
      parentDocumentId: null,
      placementId: 'placement-1',
      sortOrder: 0
    }],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree, 'placement-1', refreshLoad)
  const parentAfter = findProjectHierarchyTreeNodeById(tree, 'doc-parent')
  expect(parentAfter?.label).toBe('Parent refreshed')
  expect(parentAfter?.children.map((child) => child.id)).toEqual(['doc-child'])
})

test('Test that mergeLoadedChildrenIntoNode preserves nested subtrees when parent childrenLoaded is false', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const firstLoad = mapHierarchyDocumentChildrenToTreeNodes({
    items: [{
      displayName: 'Parent',
      hasChildren: true,
      id: 'doc-parent',
      parentDocumentId: null,
      placementId: 'placement-1',
      sortOrder: 0
    }],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree, 'placement-1', firstLoad)
  const nestedLoad = mapHierarchyDocumentChildrenToTreeNodes({
    items: [{
      displayName: 'Child',
      hasChildren: false,
      id: 'doc-child',
      parentDocumentId: 'doc-parent',
      placementId: 'placement-1',
      sortOrder: 0
    }],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree, 'doc-parent', nestedLoad)
  const placement = findProjectHierarchyTreeNodeById(tree, 'placement-1')
  expect(placement).not.toBeNull()
  placement!.childrenLoaded = false
  const refreshLoad = mapHierarchyDocumentChildrenToTreeNodes({
    items: [{
      displayName: 'Sibling saved',
      hasChildren: false,
      id: 'doc-sibling',
      parentDocumentId: null,
      placementId: 'placement-1',
      sortOrder: 0
    }, {
      displayName: 'Parent refreshed',
      hasChildren: true,
      id: 'doc-parent',
      parentDocumentId: null,
      placementId: 'placement-1',
      sortOrder: 1
    }],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree, 'placement-1', refreshLoad)
  const parentAfter = findProjectHierarchyTreeNodeById(tree, 'doc-parent')
  expect(parentAfter?.children.map((child) => child.id)).toEqual(['doc-child'])
})

test('Test that shouldClampProjectHierarchyTreeVirtualScrollTail detects tail scroll', () => {
  const scrollContainer = document.createElement('div')
  Object.defineProperty(scrollContainer, 'scrollTop', {
    value: 90,
    writable: true
  })
  Object.defineProperty(scrollContainer, 'clientHeight', {
    value: 100
  })
  Object.defineProperty(scrollContainer, 'scrollHeight', {
    value: 190
  })
  expect(shouldClampProjectHierarchyTreeVirtualScrollTail(scrollContainer)).toBe(true)
  scrollContainer.scrollTop = 0
  expect(shouldClampProjectHierarchyTreeVirtualScrollTail(scrollContainer)).toBe(false)
})

test('Test that readProjectHierarchyTreeLastDomRowViewportGapPx handles missing inner rows', () => {
  const scrollContainer = document.createElement('div')
  expect(readProjectHierarchyTreeLastDomRowViewportGapPx(scrollContainer)).toBeNull()
  const inner = document.createElement('div')
  inner.className = 'vtlist-inner'
  scrollContainer.appendChild(inner)
  expect(readProjectHierarchyTreeLastDomRowViewportGapPx(scrollContainer)).toBeNull()
})

test('Test that readProjectHierarchyTreeVtlistInnerMetrics reads inner margins', () => {
  const scrollContainer = document.createElement('div')
  expect(readProjectHierarchyTreeVtlistInnerMetrics(scrollContainer)).toBeNull()
  const inner = document.createElement('div')
  inner.className = 'vtlist-inner'
  inner.style.marginTop = '4px'
  inner.style.marginBottom = '8px'
  Object.defineProperty(inner, 'offsetHeight', {
    value: 120
  })
  const row = document.createElement('div')
  row.className = 'tree-node'
  inner.appendChild(row)
  scrollContainer.appendChild(inner)
  Object.defineProperty(scrollContainer, 'clientHeight', {
    value: 200
  })
  Object.defineProperty(scrollContainer, 'scrollTop', {
    value: 0,
    writable: true
  })
  Object.defineProperty(scrollContainer, 'getBoundingClientRect', {
    value: () => ({
      bottom: 200,
      height: 200,
      left: 0,
      right: 100,
      top: 0,
      width: 100,
      x: 0,
      y: 0,
      toJSON: () => ({})
    })
  })
  Object.defineProperty(row, 'getBoundingClientRect', {
    value: () => ({
      bottom: 40,
      height: 40,
      left: 0,
      right: 100,
      top: 0,
      width: 100,
      x: 0,
      y: 0,
      toJSON: () => ({})
    })
  })
  const metrics = readProjectHierarchyTreeVtlistInnerMetrics(scrollContainer)
  expect(metrics).not.toBeNull()
  expect(metrics?.marginTopPx).toBe(4)
  expect(metrics?.marginBottomPx).toBe(8)
  expect(metrics?.mountedNodeCount).toBe(1)
  expect(metrics?.innerOffsetHeight).toBe(120)
})

test('Test that clampProjectHierarchyTreeScrollTopToLastDomRow skips when no gap', () => {
  const scrollContainer = document.createElement('div')
  Object.defineProperty(scrollContainer, 'scrollTop', {
    value: 12,
    writable: true
  })
  const result = clampProjectHierarchyTreeScrollTopToLastDomRow(scrollContainer)
  expect(result.adjusted).toBe(false)
  expect(result.nextScrollTopPx).toBe(12)
})

test('Test that applyProjectHierarchyTreeSiblingOrderToTreeData reorders loaded siblings in place', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const children = mapHierarchyDocumentChildrenToTreeNodes({
    items: [
      {
        displayName: 'Doc 1',
        hasChildren: false,
        id: 'doc-1',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 0
      },
      {
        displayName: 'Doc 2',
        hasChildren: false,
        id: 'doc-2',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 1
      }
    ],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree, 'placement-1', children)
  const patched = applyProjectHierarchyTreeSiblingOrderToTreeData(tree, 'doc-2', ['doc-2', 'doc-1'])
  expect(patched).toBe(true)
  const placement = findProjectHierarchyTreeNodeById(tree, 'placement-1')
  expect(placement?.children.map((row) => row.id)).toEqual(['doc-2', 'doc-1'])
})

test('Test that isProjectHierarchyTreeSameBucketSiblingReorder matches snapshot parent', () => {
  expect(isProjectHierarchyTreeSameBucketSiblingReorder({
    snapshot: {
      orderedDocumentIds: ['doc-1'],
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    treeParentDocumentId: null
  })).toBe(true)
  expect(isProjectHierarchyTreeSameBucketSiblingReorder({
    snapshot: {
      orderedDocumentIds: ['doc-1'],
      parentDocumentId: 'doc-parent',
      placementId: 'placement-1'
    },
    treeParentDocumentId: null
  })).toBe(false)
})

test('Test that areProjectHierarchyTreeOrderedDocumentIdsEqual compares sibling id lists', () => {
  expect(areProjectHierarchyTreeOrderedDocumentIdsEqual(['doc-a', 'doc-b'], ['doc-a', 'doc-b'])).toBe(true)
  expect(areProjectHierarchyTreeOrderedDocumentIdsEqual(['doc-a'], ['doc-a', 'doc-b'])).toBe(false)
  expect(areProjectHierarchyTreeOrderedDocumentIdsEqual(['doc-b', 'doc-a'], ['doc-a', 'doc-b'])).toBe(false)
})

test('Test that mapProjectHierarchyTreeDocumentLabelsForOrderedIds maps labels and falls back to ids', async () => {
  const { mapProjectHierarchyTreeDocumentLabelsForOrderedIds } = await import('../mapProjectHierarchyTreeDocumentLabelsForOrderedIds')
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(mapProjectHierarchyTreeDocumentLabelsForOrderedIds(tree, null)).toBeNull()
  const children = mapHierarchyDocumentChildrenToTreeNodes({
    items: [{
      displayName: 'Doc Alpha',
      hasChildren: false,
      id: 'doc-alpha',
      parentDocumentId: null,
      placementId: 'placement-1',
      sortOrder: 0
    }],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree, 'placement-1', children)
  expect(mapProjectHierarchyTreeDocumentLabelsForOrderedIds(tree, ['doc-alpha', 'doc-missing'])).toEqual([
    'Doc Alpha',
    'doc-missing'
  ])
})

test('Test that finalizeProjectHierarchyTreeDragSiblingOrderSnapshot clears null document id', () => {
  let snapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null = {
    orderedDocumentIds: ['doc-a'],
    parentDocumentId: null,
    placementId: 'placement-1'
  }
  expect(finalizeProjectHierarchyTreeDragSiblingOrderSnapshot({
    documentId: null,
    setDragSiblingOrderSnapshot: (value) => {
      snapshot = value
    },
    treeNodes: []
  })).toBeNull()
  expect(snapshot).toBeNull()
})

test('Test that createWaitForProjectHierarchyTreeDragCommitWindow waits for suppress clear', async () => {
  let suppress = true
  const waitForCommitWindow = createWaitForProjectHierarchyTreeDragCommitWindow({
    maxAttempts: 3,
    nextTick: async () => {
      suppress = false
    },
    readSuppressTreeEmit: () => suppress
  })
  const ready = await waitForCommitWindow()
  expect(ready.ready).toBe(true)
  const waitForTimeout = createWaitForProjectHierarchyTreeDragCommitWindow({
    maxAttempts: 2,
    nextTick: async () => undefined,
    readSuppressTreeEmit: () => true
  })
  const timedOut = await waitForTimeout()
  expect(timedOut.ready).toBe(false)
  expect(timedOut.attempts).toBe(2)
})

test('Test that createWaitForProjectHierarchyTreeDragModelSettle resolves when model settles', async () => {
  const { createWaitForProjectHierarchyTreeDragModelSettle } = await import('../waitForProjectHierarchyTreeDragModelSettle')
  let settled = false
  const waitForModelSettle = createWaitForProjectHierarchyTreeDragModelSettle({
    maxAttempts: 3,
    nextTick: async () => {
      settled = true
    },
    readModelSettled: () => settled
  })
  const result = await waitForModelSettle()
  expect(result.settled).toBe(true)
})

test('Test that createProjectHierarchyTreeDragSessionState tracks drag session bindings', async () => {
  const { ref } = await import('vue')
  const { createProjectHierarchyTreeDragSessionState } = await import('../../scripts/projectHierarchyTreeDragSessionStateWiring')
  const session = createProjectHierarchyTreeDragSessionState({
    dragCommitPending: ref(false),
    dragCommitScheduled: ref(false),
    dragDropCommitted: ref(false),
    isTreeDragActive: ref(true)
  })
  session.captureDragSiblingOrderAtDragStart(['doc-a', 'doc-b'])
  expect(session.readDragSiblingOrderAtDragStart()).toEqual(['doc-a', 'doc-b'])
  session.captureDragSiblingOrderAtDragStart(null)
  expect(session.readDragSiblingOrderAtDragStart()).toBeNull()
  session.draggedDocumentId.set('doc-a')
  expect(session.draggedDocumentId.get()).toBe('doc-a')
  session.dragSiblingOrderSnapshot.set({
    orderedDocumentIds: ['doc-a'],
    parentDocumentId: null,
    placementId: 'placement-1'
  })
  expect(session.dragSiblingOrderSnapshot.get()?.placementId).toBe('placement-1')
  session.clearDragSessionFlags()
  expect(session.draggedDocumentId.get()).toBeNull()
})

test('Test that mapHierarchyDocumentChildrenToTreeNodes tie-breaks equal sortOrder by name then id', () => {
  const nodes = mapHierarchyDocumentChildrenToTreeNodes({
    items: [
      {
        displayName: 'Bravo',
        hasChildren: false,
        id: 'doc-b',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 0
      },
      {
        displayName: 'Alpha',
        hasChildren: false,
        id: 'doc-a',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 0
      },
      {
        displayName: 'Alpha',
        hasChildren: false,
        id: 'doc-c',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 0
      }
    ],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  expect(nodes.map((node) => node.id)).toEqual(['doc-a', 'doc-c', 'doc-b'])
})

test('Test that replaceProjectHierarchyTreeNodeByIdInPlace skips undefined tree slots', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const sparseTree = tree as unknown as I_faProjectHierarchyTreeHeTreeNode[]
  sparseTree.length = 2
  sparseTree[1] = undefined as unknown as I_faProjectHierarchyTreeHeTreeNode
  expect(replaceProjectHierarchyTreeNodeByIdInPlace(sparseTree, 'missing', tree[0]!)).toBe(false)
})

test('Test that findProjectHierarchyTreeDocumentsWithInvalidPlacementParent returns empty for non-array input', async () => {
  const { findProjectHierarchyTreeDocumentsWithInvalidPlacementParent } = await import('../projectHierarchyTreeDocumentPlacementGuard')
  expect(findProjectHierarchyTreeDocumentsWithInvalidPlacementParent(null as unknown as I_faProjectHierarchyTreeHeTreeNode[])).toEqual([])
})

test('Test that collectProjectHierarchyTreeVisibleFlatNodes skips descendants when ancestor collapsed', () => {
  const nestedDoc: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-hidden',
    groupId: 'group-1',
    hasChildren: false,
    icon: '',
    id: 'doc-hidden',
    label: 'Hidden',
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const groupNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [nestedDoc],
    childrenLoaded: true,
    documentId: null,
    groupId: 'group-1',
    hasChildren: true,
    icon: '',
    id: 'group-1',
    label: 'Group',
    nodeKind: 'group',
    placementId: null,
    worldColor: '#000',
    worldId: 'world-1'
  }
  const worldNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [groupNode],
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
  }
  const collapsedWorld = collectProjectHierarchyTreeVisibleFlatNodes(
    [worldNode],
    new Set(['group-1'])
  )
  expect(collapsedWorld.map((node) => node.id)).toEqual(['world-1'])
  const expandedWorld = collectProjectHierarchyTreeVisibleFlatNodes(
    [worldNode],
    new Set(['world-1', 'group-1'])
  )
  expect(expandedWorld.map((node) => node.id)).toEqual(['world-1', 'group-1', 'doc-hidden'])
})

test('Test that visible flat node expand helpers treat missing nodes as collapsed', async () => {
  const {
    collectProjectHierarchyTreeAncestorIdsForTests,
    isProjectHierarchyTreeNodeEffectivelyExpandedForTests
  } = await import('../projectHierarchyTreeVisibleFlatNodes')
  expect(collectProjectHierarchyTreeAncestorIdsForTests([], 'missing-node')).toBeNull()
  expect(isProjectHierarchyTreeNodeEffectivelyExpandedForTests(
    [],
    'missing-node',
    new Set(['missing-node'])
  )).toBe(false)
})

test('Test that waitForProjectHierarchyTreeDragModelSettle uses default max attempts and final settled read', async () => {
  const { createWaitForProjectHierarchyTreeDragModelSettle } = await import('../waitForProjectHierarchyTreeDragModelSettle')
  let attempts = 0
  const waitForModelSettle = createWaitForProjectHierarchyTreeDragModelSettle({
    nextTick: async () => {
      attempts += 1
      if (attempts >= 30) {
        settled = true
      }
    },
    readModelSettled: () => settled
  })
  let settled = false
  const result = await waitForModelSettle()
  expect(result.settled).toBe(true)
  expect(result.attempts).toBe(30)
})
