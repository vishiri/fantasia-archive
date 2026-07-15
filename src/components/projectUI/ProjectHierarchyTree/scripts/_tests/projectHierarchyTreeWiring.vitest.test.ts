/** @vitest-environment jsdom */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { computed, ref, watch, type Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  mapWorkspaceLayoutToHierarchyTreeSkeleton,
  patchHierarchyTreeSkeletonLabelsInPlace
} from '../projectHierarchyTreeMapperWiring'
import { mapHierarchyDocumentChildrenToTreeNodes } from '../projectHierarchyTreeMapperWiring'
import {
  collectProjectHierarchyTreeLazyLoadIdsAlongExpandedPaths,
  sortProjectHierarchyTreeExpandedNodeIdsForRestore
} from '../projectHierarchyTreeExpandedRestoreOrder'
import {
  applyExpandedNodeIdsToTree,
  collectExpandedNodeIdsFromTree,
  collectProjectHierarchyTreeAncestorIds,
  evictCollapsedNodeChildren,
  findProjectHierarchyTreeNodeById,
  pruneProjectHierarchyTreeExpandedNodeIdsToAncestors,
  publishProjectHierarchyTreeRootRevision
} from '../../functions/projectHierarchyTreeExpandState'
import { mergeLoadedChildrenIntoNode } from '../projectHierarchyTreeMergeLoadedChildrenWiring'
import { PROJECT_HIERARCHY_TREE_DRAG_EXPAND_SNAPSHOT_RESTORE_OPTIONS } from '../../functions/projectHierarchyTreeConstants'
import { createProjectHierarchyTreeDragSessionState } from '../projectHierarchyTreeDragSessionStateWiring'
import * as projectHierarchyTreeExpandState from '../../functions/projectHierarchyTreeExpandState'
import {
  isProjectHierarchyTreeDocumentDropParentValid,
  isProjectHierarchyTreeDocumentSiblingRow,
  isProjectHierarchyTreeNodeDraggable,
  isProjectHierarchyTreeNodeDroppable,
  isProjectHierarchyTreeRootDroppable,
  resolvePlacementIdFromHeTreeNode,
  resolveProjectHierarchyTreeDragContext
} from '../../functions/projectHierarchyTreeDnD'
import {
  resolveProjectHierarchyTreeDropParentDocumentId,
  resolveProjectHierarchyTreeSiblingSortOrder
} from '../../functions/projectHierarchyTreeMoveFromTree'
import { buildProjectHierarchyTreeRevealPathFromSearchHit } from '../../functions/projectHierarchyTreeRevealPath'
import { resolveProjectHierarchyTreeScrollContainer } from '../../functions/projectHierarchyTreeScrollContainer'
import { mapProjectHierarchyTreeToTopologyKey } from '../../functions/projectHierarchyTreeTopologyKey'
import { syncProjectHierarchyTreeDocumentHasChildrenFlags } from '../../functions/projectHierarchyTreeDocumentHasChildrenSync'
import { createProjectHierarchyTreeLazyLoadWiring } from '../projectHierarchyTreeLazyLoadWiring'
import {
  commitProjectHierarchyTreeDraggedDocumentMove,
  findProjectHierarchyTreeDocumentParentBucket
} from '../projectHierarchyTreeDnDCommitWiring'
import { createProjectHierarchyTreeSessionHandlersWiring } from '../projectHierarchyTreeSessionHandlersWiring'
import { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from '../projectHierarchyTreeDocumentRowExpandClickGestureWiring'
import { createProjectHierarchyTreeSessionHydrateWiring } from '../projectHierarchyTreeSessionHydrateWiring'
import { createProjectHierarchyTreeSessionRefs } from '../projectHierarchyTreeSessionRefsWiring'
import { createProjectHierarchyTreeSessionSubWiring } from '../projectHierarchyTreeSessionSubWiring'
import { createProjectHierarchyTreeSyncWiring } from '../projectHierarchyTreeSyncWiring'
import { createProjectHierarchyTreeDnDWiring } from '../projectHierarchyTreeDnDWiring'
import { createProjectHierarchyTreeDnDHandlers } from '../projectHierarchyTreeDnDHandlersWiring'
import { scheduleProjectHierarchyTreeDragCommit } from '../projectHierarchyTreeDnDScheduleWiring'
import { openProjectHierarchyTreeNestParentAfterDragDrop } from '../projectHierarchyTreeNestParentOpenWiring'
import { createProjectHierarchyTreeDragCancelWiring } from '../projectHierarchyTreeDragCancelWiring'
import { isProjectHierarchyTreeDragExpandUiFrozen } from '../../functions/projectHierarchyTreeDragExpandFreeze'
import { remountProjectHierarchyTreeAndRestoreExpandedSnapshot } from '../projectHierarchyTreeMountRemountWiring'
import { collectProjectHierarchyTreeLiveExpandedNodeIdsFromDom } from '../projectHierarchyTreeLiveExpandDomWiring'
import { restoreProjectHierarchyTreeExpandedSnapshot } from '../projectHierarchyTreeExpandedSnapshotWiring'
import { attachProjectHierarchyTreeScrollPersist } from '../projectHierarchyTreeScrollPersistWiring'
import { finalizeProjectHierarchyTreeDragCommitExpandState } from '../projectHierarchyTreeDnDCommitFinalizeWiring'
import { runProjectHierarchyTreePostDragExpandCloseGuard } from '../projectHierarchyTreePostDragExpandCloseGuardWiring'
import { reapplyProjectHierarchyTreeLatentDescendantExpandState } from '../projectHierarchyTreeLatentExpandReapplyWiring'
import { runProjectHierarchyTreeSessionExpandOpen } from '../projectHierarchyTreeSessionExpandOpenWiring'
import {
  markProjectHierarchyTreeNodeClosed,
  markProjectHierarchyTreeNodeOpen,
  restoreProjectHierarchyTreeUiState,
  revealProjectHierarchyTreePendingPath,
  reapplyProjectHierarchyTreeHeTreeOpenState,
  syncProjectHierarchyTreeOpenSetToPersist
} from '../projectHierarchyTreeUiStateWiring'
import { wireProjectHierarchyTreeSessionLifecycle } from '../projectHierarchyTreeSessionWatchWiring'
import { createProjectHierarchyTreeSessionEarlyWiring } from '../projectHierarchyTreeSessionEarlyWiring'
import { bindProjectHierarchyTreeHeTreeNodeTabIndexGuard } from '../projectHierarchyTreeHeTreeNodeTabIndexWiring'
import { bindProjectHierarchyTreeSessionPendingRefresh } from '../projectHierarchyTreePendingDocumentRefreshWiring'
import { bindProjectHierarchyTreeSessionLifecycle } from '../projectHierarchyTreeSessionLifecycleBindWiring'
import {
  PROJECT_HIERARCHY_TREE_DOCUMENT_ROW_DRAG_HOLD_DELAY_MS
} from '../../functions/projectHierarchyTreeConstants'

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

function buildDocumentNode (overrides: Partial<import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeNode> = {}) {
  return {
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
    worldId: 'world-1',
    ...overrides
  }
}

function createTestDocumentRowExpandClickGesture (
  isTreeDragActive: Ref<boolean> = ref(false)
) {
  return createProjectHierarchyTreeDocumentRowExpandClickGestureWiring({
    isTreeDragActive
  })
}

function createTestDocumentRowDragHoldWiring () {
  return {
    clearHoldSession: vi.fn(),
    getIsDragHoldArmed: () => true,
    handleDocumentRowPointerDown: vi.fn(),
    handleTreeDragStartCapture: vi.fn(),
    markDragStartedFromHold: vi.fn()
  }
}

function buildProjectHierarchyTreeDnDWiringTestDeps (
  overrides: Partial<Parameters<typeof createProjectHierarchyTreeDnDWiring>[0]> = {}
): Parameters<typeof createProjectHierarchyTreeDnDWiring>[0] {
  const isTreeDragActive = overrides.isTreeDragActive ?? ref(false)
  return {
    documentRowDragHoldWiring: overrides.documentRowDragHoldWiring ?? createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: overrides.documentRowExpandClickGesture ??
      createTestDocumentRowExpandClickGesture(isTreeDragActive),
    dragCommitPending: ref(false),
    dragCommitScheduled: ref(false),
    dragDropCommitted: ref(false),
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
    flushUiStatePersist: vi.fn(),
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    isTreeDragActive,
    loadChildrenForNode: vi.fn(async () => undefined),
    markNodeClosed: vi.fn(),
    markNodeOpen: vi.fn(),
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => undefined),
    nextTick: async () => undefined,
    reapplyHeTreeOpenState: vi.fn(),
    reapplyLatentDescendantExpandState: vi.fn(async () => undefined),
    openNodeIds: ref(new Set<string>()),
    queuePersistExpandedNodeIds: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
    refreshNodeChildrenFromDatabase: vi.fn(async () => undefined),
    resyncTreeDataFromLayout: vi.fn(),
    restoreExpandedSnapshot: vi.fn(async () => undefined),
    suppressTreeEmit: ref(false),
    treeData: ref<I_faProjectHierarchyTreeHeTreeNode[]>([]),
    ...overrides
  }
}

function buildProjectHierarchyTreeDragCancelTestDeps (
  overrides: Partial<Parameters<typeof createProjectHierarchyTreeDragCancelWiring>[0]> = {}
): Parameters<typeof createProjectHierarchyTreeDragCancelWiring>[0] {
  return {
    clearDragSessionFlags: vi.fn(),
    dragCommitPending: ref(true),
    dragDropCommitted: ref(false),
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(true),
    dragExpandedSnapshot: () => ['world-1'],
    nextTick: async () => undefined,
    resyncTreeDataFromLayout: vi.fn(),
    restoreExpandedSnapshot: vi.fn(async () => undefined),
    ...overrides
  }
}

function buildScheduleDragCommitTestDeps (
  overrides: Partial<Parameters<typeof scheduleProjectHierarchyTreeDragCommit>[0]> = {}
): Parameters<typeof scheduleProjectHierarchyTreeDragCommit>[0] {
  return {
    clearDragSessionFlags: vi.fn(),
    dragCommitPending: ref(true),
    dragCommitScheduled: ref(false),
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    dragExpandedSnapshot: () => ['world-1'],
    dragSiblingOrderAtDragStart: () => null,
    readDragParentDocumentIdAtDragStart: () => null,
    readDragSiblingOrderSnapshot: () => null,
    setDragSiblingOrderSnapshot: () => {},
    draggedDocumentId: () => null,
    flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
    flushUiStatePersist: vi.fn(),
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    loadChildrenForNode: vi.fn(async () => undefined),
    refreshNodeChildrenFromDatabase: vi.fn(async () => undefined),
    markNodeClosed: vi.fn(),
    openNodeIds: ref(new Set<string>()),
    queuePersistExpandedNodeIds: vi.fn(),
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => undefined),
    nextTick: async () => undefined,
    reapplyHeTreeOpenState: vi.fn(),
    reapplyLatentDescendantExpandState: vi.fn(async () => undefined),
    refreshLayout: vi.fn(async () => undefined),
    removeDragCancelListeners: vi.fn(),
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    resyncTreeDataFromLayout: vi.fn(),
    restoreExpandedSnapshot: vi.fn(async () => undefined),
    suppressTreeEmit: ref(false),
    treeData: ref<I_faProjectHierarchyTreeHeTreeNode[]>([]),
    ...overrides
  }
}

function buildRestoreExpandedSnapshotTestDeps (
  overrides: Partial<Parameters<typeof restoreProjectHierarchyTreeExpandedSnapshot>[0]> = {}
): Parameters<typeof restoreProjectHierarchyTreeExpandedSnapshot>[0] {
  return {
    expandedNodeIds: ['world-1'],
    flushDeferredTreeRevisionPublish: vi.fn(),
    getTreeRef: () => null,
    loadChildrenForNode: vi.fn(async () => undefined),
    nextTick: async () => undefined,
    onExpandedNodeIdsChange: vi.fn(),
    openNodeIds: ref(new Set<string>()),
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData: ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])),
    ...overrides
  }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

test('Test that mapWorkspaceLayoutToHierarchyTreeSkeleton handles root placements and label patch', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(tree[0]?.children[1]?.nodeKind).toBe('templatePlacement')
  patchHierarchyTreeSkeletonLabelsInPlace(tree, [
    {
      ...sampleWorld,
      displayName: 'Renamed',
      placements: sampleWorld.placements.map((placement) => {
        if (placement.id === 'placement-2') {
          return {
            ...placement,
            displayName: 'Places',
            nickname: 'Maps',
            titlePluralTranslations: {},
            titleSingularTranslations: {},
          }
        }
        return placement
      })
    }
  ])
  expect(tree[0]?.label).toBe('Renamed')
  expect(tree[0]?.children[1]?.label).toBe('Maps')
})

test('Test that collectProjectHierarchyTreeLiveExpandedNodeIdsFromDom reads open icon rows', () => {
  const host = document.createElement('div')
  const openRow = document.createElement('div')
  openRow.className = 'projectHierarchyTree__nodeRow'
  const openIcon = document.createElement('span')
  openIcon.className = 'projectHierarchyTree__openIcon projectHierarchyTree__openIcon--open'
  openIcon.setAttribute('data-test-locator', 'projectHierarchyTree-openIcon')
  const node = document.createElement('div')
  node.setAttribute('data-test-hierarchy-node-id', 'world-1')
  openRow.append(openIcon, node)
  const closedRow = document.createElement('div')
  closedRow.className = 'projectHierarchyTree__nodeRow'
  const closedIcon = document.createElement('span')
  closedIcon.className = 'projectHierarchyTree__openIcon'
  closedIcon.setAttribute('data-test-locator', 'projectHierarchyTree-openIcon')
  const closedNode = document.createElement('div')
  closedNode.setAttribute('data-test-hierarchy-node-id', 'group-1')
  closedRow.append(closedIcon, closedNode)
  host.append(openRow, closedRow)
  expect(collectProjectHierarchyTreeLiveExpandedNodeIdsFromDom(host)).toEqual(['world-1'])
})

test('Test that expand state helpers prune and collect open ids', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const openIds = new Set(['world-1', 'missing-id'])
  expect(collectExpandedNodeIdsFromTree(tree, openIds)).toEqual(['world-1'])
  const nestedOpenIds = new Set(['world-1', 'placement-1'])
  expect(collectExpandedNodeIdsFromTree(tree, nestedOpenIds)).toEqual(['world-1'])
  expect(
    pruneProjectHierarchyTreeExpandedNodeIdsToAncestors(tree, ['world-1', 'placement-1'])
  ).toEqual(['world-1'])
  expect(collectExpandedNodeIdsFromTree(tree, new Set(['missing-node']))).toEqual([])
  expect(applyExpandedNodeIdsToTree(tree, ['world-1', 'stale'])).toEqual(['world-1'])
  expect(findProjectHierarchyTreeNodeById(tree, 'group-1')?.nodeKind).toBe('group')
  expect(collectProjectHierarchyTreeAncestorIds(tree, 'missing')).toBeNull()
  evictCollapsedNodeChildren(tree[0]!)
  expect(tree[0]?.children.length).toBeGreaterThan(0)
})

test('Test that markProjectHierarchyTreeNodeClosed keeps descendant open ids when world collapses', () => {
  const tree = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set(['world-1', 'group-1', 'placement-1']))
  const queuePersistExpandedNodeIds = vi.fn()
  const worldNode = tree.value[0]!
  markProjectHierarchyTreeNodeClosed({
    node: worldNode,
    nodeId: worldNode.id,
    openNodeIds,
    queuePersistExpandedNodeIds,
    treeData: tree
  })
  expect([...openNodeIds.value].sort()).toEqual(['group-1', 'placement-1'])
  expect(queuePersistExpandedNodeIds).toHaveBeenCalledWith(['group-1', 'placement-1'])
})

test('Test that markProjectHierarchyTreeNodeClosed keeps descendant open ids when group collapses', () => {
  const tree = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set(['world-1', 'group-1', 'placement-1']))
  const queuePersistExpandedNodeIds = vi.fn()
  const groupNode = tree.value[0]!.children[0]!
  markProjectHierarchyTreeNodeClosed({
    node: groupNode,
    nodeId: groupNode.id,
    openNodeIds,
    queuePersistExpandedNodeIds,
    treeData: tree
  })
  expect([...openNodeIds.value].sort()).toEqual(['placement-1', 'world-1'])
  expect(queuePersistExpandedNodeIds).toHaveBeenCalledWith(['world-1', 'placement-1'])
})

test('Test that markProjectHierarchyTreeNodeClosed keeps descendant open ids when template placement collapses', () => {
  const tree = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set(['world-1', 'group-1', 'placement-1', 'doc-a', 'doc-b']))
  const queuePersistExpandedNodeIds = vi.fn()
  const placementNode = tree.value[0]!.children[0]!.children[0]!
  markProjectHierarchyTreeNodeClosed({
    node: placementNode,
    nodeId: placementNode.id,
    openNodeIds,
    queuePersistExpandedNodeIds,
    treeData: tree
  })
  expect([...openNodeIds.value].sort()).toEqual(['doc-a', 'doc-b', 'group-1', 'world-1'])
  expect(queuePersistExpandedNodeIds).toHaveBeenCalledWith(['world-1', 'group-1', 'doc-a', 'doc-b'])
})

test('Test that markProjectHierarchyTreeNodeClosed keeps descendant open ids when document collapses', () => {
  const parentDocument = {
    children: [
      {
        children: [],
        childrenLoaded: true,
        documentId: 'doc-child',
        groupId: 'group-1',
        hasChildren: false,
        icon: '',
        id: 'doc-child',
        label: 'Child',
        nodeKind: 'document' as const,
        placementId: 'placement-1',
        worldColor: '#000',
        worldId: 'world-1'
      }
    ],
    childrenLoaded: true,
    documentId: 'doc-parent',
    groupId: 'group-1',
    hasChildren: true,
    icon: '',
    id: 'doc-parent',
    label: 'Parent',
    nodeKind: 'document' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  const tree = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set(['world-1', 'group-1', 'placement-1', 'doc-parent', 'doc-child']))
  const queuePersistExpandedNodeIds = vi.fn()
  markProjectHierarchyTreeNodeClosed({
    node: parentDocument,
    nodeId: parentDocument.id,
    openNodeIds,
    queuePersistExpandedNodeIds,
    treeData: tree
  })
  expect([...openNodeIds.value].sort()).toEqual([
    'doc-child',
    'group-1',
    'placement-1',
    'world-1'
  ])
  expect(queuePersistExpandedNodeIds).toHaveBeenCalledWith([
    'world-1',
    'group-1',
    'placement-1',
    'doc-child'
  ])
})

test('Test that markProjectHierarchyTreeNodeOpen records ancestor open ids', () => {
  const tree = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set<string>())
  const queuePersistExpandedNodeIds = vi.fn()
  markProjectHierarchyTreeNodeOpen({
    nodeId: 'placement-1',
    openNodeIds,
    queuePersistExpandedNodeIds,
    treeData: tree
  })
  expect([...openNodeIds.value].sort()).toEqual(['group-1', 'placement-1', 'world-1'])
})

test('Test that markProjectHierarchyTreeNodeOpen tolerates unknown node ids', () => {
  const tree = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set<string>())
  const queuePersistExpandedNodeIds = vi.fn()
  markProjectHierarchyTreeNodeOpen({
    nodeId: 'missing-node',
    openNodeIds,
    queuePersistExpandedNodeIds,
    treeData: tree
  })
  expect([...openNodeIds.value]).toEqual(['missing-node'])
})

test('Test that projectHierarchyTree move and scroll helpers resolve targets', () => {
  const placement = {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    titlePluralTranslations: {},
    titleSingularTranslations: {},
    id: 'placement-1',
    label: 'Heroes',
    nodeKind: 'templatePlacement' as const,
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
  expect(resolveProjectHierarchyTreeDropParentDocumentId(buildDocumentNode())).toBe('doc-a')
  expect(resolveProjectHierarchyTreeDropParentDocumentId(placement)).toBeNull()
  expect(resolveProjectHierarchyTreeDropParentDocumentId(
    mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])[0]!
  )).toBeNull()
  expect(resolveProjectHierarchyTreeSiblingSortOrder([buildDocumentNode()], 'doc-a')).toBe(0)
  expect(resolveProjectHierarchyTreeSiblingSortOrder([buildDocumentNode()], 'missing')).toBe(1)

  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  host.appendChild(tree)
  expect(resolveProjectHierarchyTreeScrollContainer(host)).toBe(tree)
  expect(resolveProjectHierarchyTreeScrollContainer(tree)).toBe(tree)
  expect(resolveProjectHierarchyTreeScrollContainer(null)).toBeNull()
})

test('Test that projectHierarchyTree DnD helpers cover drag context branches', () => {
  const documentA = buildDocumentNode()
  expect(resolveProjectHierarchyTreeDragContext(documentA)?.documentId).toBe('doc-a')
  expect(resolveProjectHierarchyTreeDragContext({
    ...documentA,
    nodeKind: 'world',
    documentId: null
  })).toBeNull()
  expect(resolvePlacementIdFromHeTreeNode(documentA)).toBe('placement-1')
  expect(isProjectHierarchyTreeNodeDroppable(documentA, { dragNode: null })).toBe(true)
  expect(isProjectHierarchyTreeNodeDroppable(placementNode(), {
    dragNode: {
      data: documentA
    }
  })).toBe(true)
  expect(isProjectHierarchyTreeRootDroppable({
    dragNode: {
      data: documentA
    }
  })).toBe(false)
  expect(isProjectHierarchyTreeNodeDraggable(documentA)).toBe(true)
  expect(isProjectHierarchyTreeDocumentSiblingRow({
    ...documentA,
    documentId: null,
    id: 'placement-1__lazy'
  })).toBe(false)
})

test('Test that isProjectHierarchyTreeDocumentDropParentValid accepts placement first level', () => {
  const placementNode = {
    children: [],
    childrenLoaded: false,
    documentId: null,
    groupId: 'group-1',
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
  expect(isProjectHierarchyTreeDocumentDropParentValid({
    parentDocumentId: null,
    parentNode: placementNode
  })).toBe(true)
  expect(isProjectHierarchyTreeDocumentDropParentValid({
    parentDocumentId: null,
    parentNode: {
      ...placementNode,
      nodeKind: 'world'
    }
  })).toBe(false)
})

function placementNode () {
  return {
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
}

test('Test that buildProjectHierarchyTreeRevealPathFromSearchHit returns empty for missing world', () => {
  expect(buildProjectHierarchyTreeRevealPathFromSearchHit({
    ancestorDocumentIds: [],
    displayName: 'X',
    documentId: 'doc-1',
    placementId: 'placement-1',
    worldId: 'missing'
  }, [sampleWorld])).toEqual([])
})

test('Test that createProjectHierarchyTreeSyncWiring resyncs layout skeleton', async () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([])
  const suppressTreeEmit = ref(false)
  const wiring = createProjectHierarchyTreeSyncWiring({
    getPreferredLanguageCode: () => 'en-US',
    getWorlds: () => [],
    nextTick: async () => undefined,
    suppressTreeEmit,
    treeData
  })
  wiring.resyncTreeDataFromLayout()
  expect(treeData.value).toEqual([])

  const wiringWithWorlds = createProjectHierarchyTreeSyncWiring({
    getPreferredLanguageCode: () => 'en-US',
    getWorlds: () => [sampleWorld],
    nextTick: async () => undefined,
    suppressTreeEmit,
    treeData
  })
  wiringWithWorlds.resyncTreeDataFromLayout()
  expect(treeData.value).toHaveLength(1)
  wiringWithWorlds.resyncTreeDataFromLayout()
  expect(mapProjectHierarchyTreeToTopologyKey(treeData.value)).toBe(
    mapProjectHierarchyTreeToTopologyKey(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  )
})

test('Test that createProjectHierarchyTreeSyncWiring patches labels when topology unchanged', () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const suppressTreeEmit = ref(false)
  const worlds = ref([sampleWorld])
  const wiring = createProjectHierarchyTreeSyncWiring({
    getPreferredLanguageCode: () => 'en-US',
    getWorlds: () => worlds.value,
    nextTick: async () => undefined,
    suppressTreeEmit,
    treeData
  })
  worlds.value = [
    {
      ...sampleWorld,
      displayName: 'Renamed world only'
    }
  ]
  wiring.resyncTreeDataFromLayout()
  expect(treeData.value[0]?.label).toBe('Renamed world only')
  expect(suppressTreeEmit.value).toBe(false)
})

test('Test that createProjectHierarchyTreeLazyLoadWiring loads placement and nested documents', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const initialTree = treeData.value
  const listPlacementDocumentChildren = vi.fn(async (
    input: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => {
    if (input.parentDocumentId !== undefined && input.parentDocumentId !== null) {
      return {
        items: []
      }
    }
    return {
      items: [
        {
          displayName: 'Doc 1',
          hasChildren: true,
          id: 'doc-1',
          parentDocumentId: null,
          placementId: 'placement-1',
          sortOrder: 0
        }
      ]
    }
  })
  const onAfterTreeRevisionPublished = vi.fn()
  const wiring = createProjectHierarchyTreeLazyLoadWiring({
    getPreferredLanguageCode: () => 'en-US',
    listPlacementDocumentChildren,
    nextTick: async () => undefined,
    onAfterTreeRevisionPublished,
    shouldDeferTreeRevisionPublish: () => false,
    suppressTreeEmit: ref(false),
    treeData
  })
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')
  expect(placement).not.toBeNull()
  await wiring.loadChildrenForNode(placement!)
  expect(onAfterTreeRevisionPublished).toHaveBeenCalledTimes(1)
  expect(treeData.value[0]?.children[0]?.children[0]?.children[0]?.id).toBe('doc-1')
  expect(treeData.value).not.toBe(initialTree)
  const document = findProjectHierarchyTreeNodeById(treeData.value, 'doc-1')
  await wiring.loadChildrenForNode(document!)
  await wiring.loadChildrenAlongRevealPath(['placement-1', 'doc-1'])
  expect(listPlacementDocumentChildren).toHaveBeenCalled()
})

/**
 * publishProjectHierarchyTreeRootRevision shallow-clones the tree root array.
 */
test('Test that publishProjectHierarchyTreeRootRevision shallow-clones the tree root', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const next = publishProjectHierarchyTreeRootRevision(tree)
  expect(next).not.toBe(tree)
  expect(next).toEqual(tree)
})

test('Test that commitProjectHierarchyTreeDraggedDocumentMove persists reorder', async () => {
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
      }
    ],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree, 'placement-1', children)
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)
  const refreshLayout = vi.fn(async () => undefined)
  const resyncTreeDataFromLayout = vi.fn()
  await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-1',
    reindexDocumentSiblingsInHierarchy,
    refreshLayout,
    resyncTreeDataFromLayout,
    treeData: tree
  })
  expect(reindexDocumentSiblingsInHierarchy).toHaveBeenCalled()
  expect(refreshLayout).not.toHaveBeenCalled()
  expect(findProjectHierarchyTreeDocumentParentBucket(tree, 'doc-1')?.parentDocumentId).toBeNull()
  await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: null,
    reindexDocumentSiblingsInHierarchy,
    refreshLayout,
    resyncTreeDataFromLayout,
    treeData: tree
  })
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  reindexDocumentSiblingsInHierarchy.mockRejectedValueOnce(new Error('fail'))
  await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-1',
    reindexDocumentSiblingsInHierarchy,
    refreshLayout,
    resyncTreeDataFromLayout,
    treeData: tree
  })
  expect(resyncTreeDataFromLayout).toHaveBeenCalled()
  expect(refreshLayout).toHaveBeenCalled()
  errorSpy.mockRestore()
})

test('Test that commitProjectHierarchyTreeDraggedDocumentMove skips reload for same-bucket reorder snapshot', async () => {
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
  const result = await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-2',
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-2', 'doc-1'],
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => undefined),
    refreshLayout: vi.fn(async () => undefined),
    resyncTreeDataFromLayout: vi.fn(),
    treeData: tree
  })
  expect(result).toEqual({
    committed: true,
    emptiedParentDocumentIds: [],
    nestParentDocumentId: null,
    reloadChildrenNodeId: null
  })
})

test('Test that commitProjectHierarchyTreeDraggedDocumentMove returns nest parent id', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placementChildren = mapHierarchyDocumentChildrenToTreeNodes({
    items: [
      {
        displayName: 'Parent',
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
  mergeLoadedChildrenIntoNode(tree, 'placement-1', placementChildren)
  const nestedChildren = mapHierarchyDocumentChildrenToTreeNodes({
    items: [
      {
        displayName: 'Child',
        hasChildren: false,
        id: 'doc-child',
        parentDocumentId: 'doc-parent',
        placementId: 'placement-1',
        sortOrder: 0
      }
    ],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree, 'doc-parent', nestedChildren)
  const result = await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-child',
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => undefined),
    refreshLayout: vi.fn(async () => undefined),
    resyncTreeDataFromLayout: vi.fn(),
    treeData: tree
  })
  expect(result).toEqual({
    committed: true,
    emptiedParentDocumentIds: [],
    nestParentDocumentId: 'doc-parent',
    reloadChildrenNodeId: 'doc-parent'
  })
})

test('Test that commitProjectHierarchyTreeDraggedDocumentMove reports emptied parent document', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placementChildren = mapHierarchyDocumentChildrenToTreeNodes({
    items: [
      {
        displayName: 'Parent',
        hasChildren: true,
        id: 'doc-parent',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 0
      },
      {
        displayName: 'Child',
        hasChildren: false,
        id: 'doc-child',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 1
      }
    ],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree, 'placement-1', placementChildren)
  const parentNode = findProjectHierarchyTreeNodeById(tree, 'doc-parent')
  expect(parentNode).not.toBeNull()
  if (parentNode !== null) {
    parentNode.children = []
    parentNode.childrenLoaded = true
    parentNode.hasChildren = true
  }
  const result = await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-child',
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => undefined),
    refreshLayout: vi.fn(async () => undefined),
    resyncTreeDataFromLayout: vi.fn(),
    treeData: tree
  })
  expect(result).toEqual({
    committed: true,
    emptiedParentDocumentIds: [],
    nestParentDocumentId: null,
    reloadChildrenNodeId: 'placement-1'
  })
  const emptiedParentDocumentIds = syncProjectHierarchyTreeDocumentHasChildrenFlags(tree)
  expect(emptiedParentDocumentIds).toEqual(['doc-parent'])
  expect(parentNode?.hasChildren).toBe(false)
})

test('Test that openProjectHierarchyTreeNestParentAfterDragDrop opens parent row', async () => {
  const tree = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const placementChildren = mapHierarchyDocumentChildrenToTreeNodes({
    items: [
      {
        displayName: 'Parent',
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
  mergeLoadedChildrenIntoNode(tree.value, 'placement-1', placementChildren)
  const openNodeAndParents = vi.fn()
  const markNodeOpen = vi.fn()
  const loadChildrenForNode = vi.fn(async () => undefined)
  const flushDeferredTreeRevisionPublish = vi.fn(async () => undefined)
  await openProjectHierarchyTreeNestParentAfterDragDrop({
    flushDeferredTreeRevisionPublish,
    getTreeRef: () => ({
      closeAll: vi.fn(),
      openNodeAndParents
    }),
    loadChildrenForNode,
    markNodeOpen,
    nestParentDocumentId: 'doc-parent',
    nextTick: async () => undefined,
    treeData: tree
  })
  expect(flushDeferredTreeRevisionPublish).toHaveBeenCalledTimes(1)
  expect(loadChildrenForNode).toHaveBeenCalledTimes(1)
  expect(markNodeOpen).toHaveBeenCalledWith('doc-parent')
  expect(openNodeAndParents).toHaveBeenCalledTimes(1)
})

test('Test that session handlers wiring emits document open requests', async () => {
  const treeComponentRef = ref<I_faProjectHierarchyTreeHeTreeInstance | null>(null)
  const treeScrollHostRef = ref<HTMLElement | null>(null)
  const onDocumentOpenRequest = vi.fn()
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode: async () => undefined
    },
    nextTick: async () => {},
    onDocumentOpenRequest,
    openNodeIds: ref<Set<string>>(new Set()),
    queuePersistExpandedNodeIds: vi.fn(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef,
    treeData: ref([]),
    treeMountKey: ref(0),
    treeScrollHostRef,
    uiStateWiring: {
      markNodeClosed: vi.fn(),
      markNodeOpen: vi.fn(),
      reapplyHeTreeOpenState: vi.fn(),
      reapplyLatentDescendantExpandState: vi.fn(async () => undefined)
    }
  })
  wiring.onNodeClick({
    data: buildDocumentNode(),
    children: []
  })
  expect(onDocumentOpenRequest).toHaveBeenCalledWith(
    'doc-a',
    'leftNavigate',
    expect.objectContaining({
      tabLabel: expect.any(String),
      templateIcon: expect.any(String)
    })
  )
  wiring.setTreeComponentRef({
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  })
  wiring.setTreeScrollHostRef(document.createElement('div'))
  await wiring.onNodeOpen({
    data: placementNode()
  })
  wiring.onNodeClose({
    data: placementNode()
  })
})

test('Test that hydrate wiring refreshes session and tears down', async () => {
  const hydrateWiring = createProjectHierarchyTreeSessionHydrateWiring({
    dndWiring: {
      onUnmountedCleanup: vi.fn()
    },
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      refreshLayout: vi.fn(async () => undefined),
      refreshUiState: vi.fn(async () => undefined)
    },
    syncWiring: {
      resyncTreeDataFromLayout: vi.fn()
    },
    uiStateWiring: {
      attachScrollPersist: () => () => undefined,
      onUnmountedCleanup: vi.fn(),
      restoreUiStateFromStore: vi.fn(async () => undefined)
    }
  })
  await hydrateWiring.hydrateTreeSession()
  hydrateWiring.teardown()
})

test('Test that createProjectHierarchyTreeSessionRefs initializes drag refs', () => {
  const refs = createProjectHierarchyTreeSessionRefs({ ref })
  expect(refs.openNodeIds.value.size).toBe(0)
  expect(refs.isTreeDragActive.value).toBe(false)
})

test('Test that createProjectHierarchyTreeDnDWiring runs drag lifecycle', async () => {
  const deps = buildProjectHierarchyTreeDnDWiringTestDeps()
  const wiring = createProjectHierarchyTreeDnDWiring(deps)
  wiring.onBeforeDragStart({
    data: buildDocumentNode()
  })
  expect(deps.isTreeDragActive.value).toBe(true)
  expect(deps.dragExpandUiFrozen.value).toBe(true)
  wiring.onTreeDataUpdate([])
  wiring.onTreeAfterDrop()
  wiring.onTreeDragEndCleanup()
  wiring.onUnmountedCleanup()
})

test('Test that createProjectHierarchyTreeDragCancelWiring finishes cancelled drag sessions', async () => {
  vi.useFakeTimers()
  const clearDragSessionFlags = vi.fn()
  const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  const resyncTreeDataFromLayout = vi.fn()
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  const dragExpandUiFrozen = ref(true)
  const wiring = createProjectHierarchyTreeDragCancelWiring(buildProjectHierarchyTreeDragCancelTestDeps({
    clearDragSessionFlags,
    dragExpandUiFrozen,
    resyncTreeDataFromLayout,
    restoreExpandedSnapshot
  }))
  wiring.attachDragCancelListeners()
  wiring.finishDragSessionWithoutCommit()
  await vi.advanceTimersByTimeAsync(500)
  for (let tick = 0; tick < 8; tick += 1) {
    await Promise.resolve()
  }
  expect(removeEventListenerSpy).toHaveBeenCalled()
  expect(resyncTreeDataFromLayout).toHaveBeenCalled()
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith(['world-1'], undefined)
  expect(dragExpandUiFrozen.value).toBe(false)
  expect(clearDragSessionFlags).toHaveBeenCalled()
  removeEventListenerSpy.mockRestore()
  vi.useRealTimers()
})

test('Test that createProjectHierarchyTreeDragCancelWiring restores empty snapshot when drag snapshot missing', async () => {
  vi.useFakeTimers()
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  const wiring = createProjectHierarchyTreeDragCancelWiring(buildProjectHierarchyTreeDragCancelTestDeps({
    dragExpandedSnapshot: () => null,
    restoreExpandedSnapshot
  }))
  wiring.finishDragSessionWithoutCommit()
  await vi.advanceTimersByTimeAsync(500)
  for (let tick = 0; tick < 8; tick += 1) {
    await Promise.resolve()
  }
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith([], undefined)
  vi.useRealTimers()
})

test('Test that createProjectHierarchyTreeDragCancelWiring skips finish after committed drop', () => {
  const resyncTreeDataFromLayout = vi.fn()
  const wiring = createProjectHierarchyTreeDragCancelWiring(buildProjectHierarchyTreeDragCancelTestDeps({
    dragDropCommitted: ref(true),
    resyncTreeDataFromLayout
  }))
  wiring.finishDragSessionWithoutCommit()
  expect(resyncTreeDataFromLayout).not.toHaveBeenCalled()
})

test('Test that createProjectHierarchyTreeDragCancelWiring handles pointerup and escape', async () => {
  const dragDropCommitted = ref(false)
  const resyncTreeDataFromLayout = vi.fn()
  const wiring = createProjectHierarchyTreeDragCancelWiring(buildProjectHierarchyTreeDragCancelTestDeps({
    dragDropCommitted,
    resyncTreeDataFromLayout
  }))
  wiring.onWindowPointerUpDuringDrag()
  await Promise.resolve()
  expect(resyncTreeDataFromLayout).toHaveBeenCalledTimes(1)
  dragDropCommitted.value = true
  wiring.onWindowPointerUpDuringDrag()
  await Promise.resolve()
  expect(resyncTreeDataFromLayout).toHaveBeenCalledTimes(1)
  dragDropCommitted.value = false
  wiring.onWindowKeydownDuringDrag({
    key: 'Tab'
  } as KeyboardEvent)
  expect(resyncTreeDataFromLayout).toHaveBeenCalledTimes(1)
  wiring.onWindowKeydownDuringDrag({
    key: 'Escape'
  } as KeyboardEvent)
  expect(resyncTreeDataFromLayout).toHaveBeenCalledTimes(2)
})

test('Test that createProjectHierarchyTreeDragCancelWiring logs pointerup nextTick failures', async () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const wiring = createProjectHierarchyTreeDragCancelWiring(buildProjectHierarchyTreeDragCancelTestDeps({
    nextTick: async () => {
      throw new Error('tick failed')
    }
  }))
  wiring.onWindowPointerUpDuringDrag()
  await vi.runAllTimersAsync()
  expect(errorSpy).toHaveBeenCalled()
  errorSpy.mockRestore()
})

test('Test that createProjectHierarchyTreeDnDWiring attaches drag cancel listeners on document drag', () => {
  const addSpy = vi.spyOn(window, 'addEventListener')
  const wiring = createProjectHierarchyTreeDnDWiring(buildProjectHierarchyTreeDnDWiringTestDeps())
  wiring.onBeforeDragStart({
    data: buildDocumentNode()
  })
  expect(addSpy).toHaveBeenCalledWith('pointerup', expect.any(Function))
  expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  wiring.onUnmountedCleanup()
  addSpy.mockRestore()
})

test('Test that createProjectHierarchyTreeDnDWiring rejects model updates while suppressTreeEmit is set', () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const initialLength = treeData.value.length
  const wiring = createProjectHierarchyTreeDnDWiring(buildProjectHierarchyTreeDnDWiringTestDeps({
    suppressTreeEmit: ref(true),
    treeData
  }))
  wiring.onBeforeDragStart({
    data: buildDocumentNode()
  })
  wiring.onTreeDataUpdate([])
  expect(treeData.value.length).toBe(initialLength)
})

test('Test that createProjectHierarchyTreeDnDWiring dragend skips cancel cleanup after committed drop', () => {
  const removeSpy = vi.spyOn(window, 'removeEventListener')
  const dragCommitPending = ref(true)
  const dragDropCommitted = ref(true)
  const wiring = createProjectHierarchyTreeDnDWiring(buildProjectHierarchyTreeDnDWiringTestDeps({
    dragCommitPending,
    dragCommitScheduled: ref(true),
    dragDropCommitted,
    dragExpandUiFrozen: ref(true),
    isTreeDragActive: ref(true)
  }))
  wiring.onTreeDragEndCleanup()
  expect(removeSpy).not.toHaveBeenCalled()
  expect(dragCommitPending.value).toBe(true)
  removeSpy.mockRestore()
})

test('Test that createProjectHierarchyTreeDnDHandlers covers drag handler branches', () => {
  const dragCommitPending = ref(false)
  const dragCommitScheduled = ref(false)
  const dragDropCommitted = ref(false)
  const dragExpandPostCommitGuard = ref(false)
  const dragExpandUiFrozen = ref(false)
  const isTreeDragActive = ref(false)
  const suppressTreeEmit = ref(false)
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const draggedDocumentId = {
    current: null as string | null
  }
  const dragExpandedSnapshot = {
    current: null as string[] | null
  }
  const removeDragCancelListeners = vi.fn()
  const clearDragSessionFlags = vi.fn()
  const queuePersistExpandedNodeIds = vi.fn()
  const dragCancelWiring = createProjectHierarchyTreeDragCancelWiring(buildProjectHierarchyTreeDragCancelTestDeps({
    clearDragSessionFlags,
    dragCommitPending,
    dragDropCommitted,
    dragExpandPostCommitGuard,
    dragExpandUiFrozen
  }))
  const handlers = createProjectHierarchyTreeDnDHandlers({
    clearDragSessionFlags,
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(isTreeDragActive),
    dragCancelWiring,
    dragCommitPending,
    dragCommitScheduled,
    dragDropCommitted,
    dragExpandPostCommitGuard,
    dragExpandUiFrozen,
    draggedDocumentId: {
      get: () => draggedDocumentId.current,
      set: (value) => {
        draggedDocumentId.current = value
      }
    },
    dragExpandedSnapshot: {
      get: () => dragExpandedSnapshot.current,
      set: (value) => {
        dragExpandedSnapshot.current = value
      }
    },
    dragSiblingOrderSnapshot: {
      get: () => null,
      set: () => undefined
    },
    captureDragModelValueRevisionAtDrop: vi.fn(),
    captureDragParentDocumentIdAtDragStart: vi.fn(),
    captureDragSiblingOrderAtDragStart: vi.fn(),
    incrementDragModelValueRevision: vi.fn(),
    readDragParentDocumentIdAtDragStart: () => null,
    readDragSiblingOrderAtDragStart: () => null,
    readDragModelValueSettledForCommit: () => true,
    resetDragModelValueRevisionForDragStart: vi.fn(),
    flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
    flushUiStatePersist: vi.fn(),
    isTreeDragActive,
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    loadChildrenForNode: vi.fn(async () => undefined),
    markNodeClosed: vi.fn(),
    markNodeOpen: vi.fn(),
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => undefined),
    nextTick: async () => undefined,
    reapplyHeTreeOpenState: vi.fn(),
    reapplyLatentDescendantExpandState: vi.fn(async () => undefined),
    openNodeIds: ref(new Set(['world-1'])),
    queuePersistExpandedNodeIds,
    refreshLayout: vi.fn(async () => undefined),
    refreshNodeChildrenFromDatabase: vi.fn(async () => undefined),
    removeDragCancelListeners,
    resyncTreeDataFromLayout: vi.fn(),
    restoreExpandedSnapshot: vi.fn(async () => undefined),
    suppressTreeEmit,
    treeData
  })
  handlers.onBeforeDragStart({
    data: buildDocumentNode()
  })
  expect(draggedDocumentId.current).toBe('doc-a')
  expect(dragExpandedSnapshot.current).toEqual(['world-1'])
  expect(queuePersistExpandedNodeIds).not.toHaveBeenCalled()
  handlers.onTreeDataUpdate([])
  expect(treeData.value).toEqual([])
  suppressTreeEmit.value = true
  handlers.onTreeDataUpdate(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  expect(treeData.value).toEqual([])
  dragDropCommitted.value = true
  handlers.onTreeDragEndCleanup()
  expect(removeDragCancelListeners).not.toHaveBeenCalled()
  dragDropCommitted.value = false
  handlers.onTreeDragEndCleanup()
  expect(removeDragCancelListeners).toHaveBeenCalled()
  handlers.onUnmountedCleanup()
  expect(clearDragSessionFlags).toHaveBeenCalled()
})

test('Test that scheduleProjectHierarchyTreeDragCommit runs commit chain', async () => {
  const dragCommitPending = ref(true)
  const dragExpandUiFrozen = ref(false)
  const clearDragSessionFlags = vi.fn(() => {
    dragCommitPending.value = false
  })
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  scheduleProjectHierarchyTreeDragCommit(buildScheduleDragCommitTestDeps({
    clearDragSessionFlags,
    dragCommitPending,
    dragExpandUiFrozen,
    restoreExpandedSnapshot
  }))
  await vi.runAllTimersAsync()
  expect(dragCommitPending.value).toBe(false)
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith(
    ['world-1'],
    PROJECT_HIERARCHY_TREE_DRAG_EXPAND_SNAPSHOT_RESTORE_OPTIONS
  )
  expect(restoreExpandedSnapshot).toHaveBeenCalledTimes(2)
  expect(dragExpandUiFrozen.value).toBe(false)
  expect(clearDragSessionFlags).toHaveBeenCalled()
})

test('Test that scheduleProjectHierarchyTreeDragCommit skips refresh for same-bucket sibling reorder', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placementChildren = mapHierarchyDocumentChildrenToTreeNodes({
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
  mergeLoadedChildrenIntoNode(tree, 'placement-1', placementChildren)
  const refreshNodeChildrenFromDatabase = vi.fn(async () => undefined)
  scheduleProjectHierarchyTreeDragCommit(buildScheduleDragCommitTestDeps({
    draggedDocumentId: () => 'doc-1',
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => undefined),
    refreshNodeChildrenFromDatabase,
    treeData: ref(tree)
  }))
  await vi.runAllTimersAsync()
  expect(refreshNodeChildrenFromDatabase).not.toHaveBeenCalled()
})

test('Test that projectHierarchyTree UI state wiring restores and reveals paths', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set<string>())
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  host.appendChild(tree)
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  const queuePersistExpandedNodeIds = vi.fn()
  const queuePersistScrollTopPx = vi.fn()
  markProjectHierarchyTreeNodeOpen({
    nodeId: 'world-1',
    openNodeIds,
    queuePersistExpandedNodeIds,
    treeData
  })
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  markProjectHierarchyTreeNodeClosed({
    node: placement,
    nodeId: 'placement-1',
    openNodeIds,
    queuePersistExpandedNodeIds,
    treeData
  })
  await restoreProjectHierarchyTreeUiState({
    getExpandedNodeIds: () => ['world-1'],
    getScrollTopPx: () => 12,
    getTreeRef: () => treeRef,
    getTreeScrollHost: () => host,
    getWorlds: () => [sampleWorld],
    loadChildrenAlongRevealPath: async () => undefined,
    nextTick: async () => undefined,
    onExpandedNodeIdsChange: vi.fn(),
    openNodeIds,
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData
  })
  await revealProjectHierarchyTreePendingPath({
    getPendingRevealPath: () => ['world-1', 'placement-1'],
    getTreeRef: () => treeRef,
    getTreeScrollHost: () => host,
    loadChildrenAlongRevealPath: async () => undefined,
    markNodeOpen: (nodeId: string) => {
      markProjectHierarchyTreeNodeOpen({
        nodeId,
        openNodeIds,
        queuePersistExpandedNodeIds,
        treeData
      })
    },
    nextTick: async () => undefined,
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData
  })
  const detach = attachProjectHierarchyTreeScrollPersist({
    getTreeScrollHost: () => host,
    queuePersistScrollTopPx
  })
  tree.scrollTop = 44
  tree.dispatchEvent(new Event('scroll'))
  expect(queuePersistScrollTopPx).toHaveBeenCalledWith(44)
  detach()
  expect(attachProjectHierarchyTreeScrollPersist({
    getTreeScrollHost: () => null,
    queuePersistScrollTopPx
  })()).toBeUndefined()
})

test('Test that wireProjectHierarchyTreeSessionLifecycle resets store when project closes', async () => {
  const resetOnProjectClose = vi.fn()
  const { nextTick, watch } = await import('vue')
  wireProjectHierarchyTreeSessionLifecycle({
    S_FaActiveProject: () => ({
      activeProject: null,
      hasActiveProject: false
    }),
    clearPendingRevealPath: vi.fn(),
    flushUiStatePersist: vi.fn(),
    hydrateTreeSession: vi.fn(async () => undefined),
    layoutRefreshGeneration: ref(0),
    shouldDeferWorldsExpandRestore: () => false,
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    openNodeIds: ref(new Set(['world-1'])),
    pendingRevealPath: ref([]),
    resetOnProjectClose,
    resyncTreeDataFromLayout: vi.fn(),
    restoreExpandedSnapshot: vi.fn(async () => undefined),
    revealPendingPath: vi.fn(async () => undefined),
    teardown: vi.fn(),
    treeData: ref([]),
    watch,
    worlds: ref([])
  })
  await nextTick()
  expect(resetOnProjectClose).toHaveBeenCalled()
})

test('Test that wireProjectHierarchyTreeSessionLifecycle ignores empty reveal paths', async () => {
  const revealPendingPath = vi.fn(async () => undefined)
  const clearPendingRevealPath = vi.fn()
  const { watch } = await import('vue')
  const pendingRevealPath = ref<string[]>([])
  wireProjectHierarchyTreeSessionLifecycle({
    S_FaActiveProject: () => ({
      activeProject: null,
      hasActiveProject: false
    }),
    clearPendingRevealPath,
    flushUiStatePersist: vi.fn(),
    hydrateTreeSession: vi.fn(async () => undefined),
    layoutRefreshGeneration: ref(0),
    shouldDeferWorldsExpandRestore: () => false,
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    openNodeIds: ref(new Set<string>()),
    pendingRevealPath,
    resetOnProjectClose: vi.fn(),
    resyncTreeDataFromLayout: vi.fn(),
    restoreExpandedSnapshot: vi.fn(async () => undefined),
    revealPendingPath,
    teardown: vi.fn(),
    treeData: ref([]),
    watch,
    worlds: ref([])
  })
  pendingRevealPath.value = []
  expect(revealPendingPath).not.toHaveBeenCalled()
})

test('Test that session handlers ignore expand events while drag expand UI is frozen', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = tree[0]!.children[0]!
  const markNodeOpen = vi.fn()
  const markNodeClosed = vi.fn()
  const loadChildrenForNode = vi.fn(async () => undefined)
  const dragExpandUiFrozen = ref(true)
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(),
    dragContext: {
      dragNode: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen,
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
      loadChildrenForNode
    },
    nextTick: async () => {},
    onDocumentOpenRequest: vi.fn(),
    openNodeIds: ref<Set<string>>(new Set()),
    queuePersistExpandedNodeIds: vi.fn(),
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: ref(null),
    treeData: ref([]),
    treeMountKey: ref(0),
    treeScrollHostRef: ref(null),
    uiStateWiring: {
      markNodeClosed,
      markNodeOpen,
      reapplyHeTreeOpenState: vi.fn(),
      reapplyLatentDescendantExpandState: vi.fn(async () => undefined)
    }
  })
  await wiring.onNodeOpen({ data: placement })
  wiring.onNodeClose({ data: placement })
  const stat = {
    children: [],
    open: false
  }
  wiring.onNodeOpenIconPointerDown(stat)
  await wiring.onNodeOpenIconClick(placement, stat)
  expect(markNodeOpen).not.toHaveBeenCalled()
  expect(markNodeClosed).not.toHaveBeenCalled()
  expect(loadChildrenForNode).not.toHaveBeenCalled()
  expect(stat.open).toBe(false)
})

test('Test that isProjectHierarchyTreeDragExpandUiFrozen reflects drag session flag', () => {
  expect(isProjectHierarchyTreeDragExpandUiFrozen({
    dragExpandUiFrozen: false
  })).toBe(false)
  expect(isProjectHierarchyTreeDragExpandUiFrozen({
    dragExpandUiFrozen: true
  })).toBe(true)
})

test('Test that runProjectHierarchyTreePostDragExpandCloseGuard suppresses close during drag restore', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const treeData = ref(tree)
  const markNodeClosed = vi.fn()
  const placement = findProjectHierarchyTreeNodeById(tree, 'placement-1')
  if (placement === null) {
    throw new Error('missing placement')
  }
  runProjectHierarchyTreePostDragExpandCloseGuard({
    dragExpandPostCommitGuard: () => true,
    getDragExpandedSnapshotNodeIds: () => ['placement-1'],
    markNodeClosed,
    node: placement,
    nodeId: 'placement-1',
    treeData
  })
  expect(markNodeClosed).not.toHaveBeenCalled()
  runProjectHierarchyTreePostDragExpandCloseGuard({
    dragExpandPostCommitGuard: () => false,
    getDragExpandedSnapshotNodeIds: () => ['placement-1'],
    markNodeClosed,
    node: placement,
    nodeId: 'placement-1',
    treeData
  })
  expect(markNodeClosed).not.toHaveBeenCalled()
  runProjectHierarchyTreePostDragExpandCloseGuard({
    dragExpandPostCommitGuard: () => false,
    getDragExpandedSnapshotNodeIds: () => null,
    markNodeClosed,
    node: placement,
    nodeId: 'placement-1',
    treeData
  })
  expect(markNodeClosed).toHaveBeenCalledWith('placement-1', placement)
})

test('Test that finalizeProjectHierarchyTreeDragCommitExpandState restores expand snapshot', async () => {
  const dragExpandPostCommitGuard = ref(true)
  const dragExpandUiFrozen = ref(true)
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  const reapplyLatentDescendantExpandState = vi.fn(async () => undefined)
  const reapplyHeTreeOpenState = vi.fn()
  const flushUiStatePersist = vi.fn()
  const clearDragSessionFlags = vi.fn()
  await finalizeProjectHierarchyTreeDragCommitExpandState({
    clearDragSessionFlags,
    dragExpandPostCommitGuard,
    dragExpandUiFrozen,
    expandedSnapshot: ['world-1', 'placement-1'],
    flushUiStatePersist,
    nextTick: async () => undefined,
    reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState,
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    },
    restoreExpandedSnapshot
  })
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith(
    ['world-1', 'placement-1'],
    PROJECT_HIERARCHY_TREE_DRAG_EXPAND_SNAPSHOT_RESTORE_OPTIONS
  )
  expect(reapplyLatentDescendantExpandState).toHaveBeenCalled()
  expect(reapplyHeTreeOpenState).toHaveBeenCalled()
  expect(flushUiStatePersist).toHaveBeenCalled()
  expect(clearDragSessionFlags).toHaveBeenCalled()
  expect(dragExpandUiFrozen.value).toBe(false)
  expect(dragExpandPostCommitGuard.value).toBe(false)
})

test('Test that wireProjectHierarchyTreeSessionLifecycle skips restore while drag expand UI is frozen', async () => {
  const resyncTreeDataFromLayout = vi.fn()
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const worlds = ref([sampleWorld])
  const { watch } = await import('vue')
  wireProjectHierarchyTreeSessionLifecycle({
    S_FaActiveProject: () => ({
      activeProject: {
        id: 'project-a'
      },
      hasActiveProject: true
    }),
    clearPendingRevealPath: vi.fn(),
    flushUiStatePersist: vi.fn(),
    hydrateTreeSession: vi.fn(async () => undefined),
    layoutRefreshGeneration: ref(0),
    shouldDeferWorldsExpandRestore: () => true,
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    openNodeIds: ref(new Set<string>()),
    pendingRevealPath: ref([]),
    resetOnProjectClose: vi.fn(),
    resyncTreeDataFromLayout,
    restoreExpandedSnapshot,
    revealPendingPath: vi.fn(async () => undefined),
    teardown: vi.fn(),
    treeData,
    watch,
    worlds
  })
  worlds.value = [{
    ...sampleWorld,
    displayName: 'World B'
  }]
  await Promise.resolve()
  expect(resyncTreeDataFromLayout).not.toHaveBeenCalled()
  expect(restoreExpandedSnapshot).not.toHaveBeenCalled()
})

test('Test that wireProjectHierarchyTreeSessionLifecycle watches project and worlds', async () => {
  const hydrateTreeSession = vi.fn(async () => undefined)
  const teardown = vi.fn()
  const resetOnProjectClose = vi.fn()
  const resyncTreeDataFromLayout = vi.fn()
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  const flushUiStatePersist = vi.fn()
  const clearPendingRevealPath = vi.fn()
  const revealPendingPath = vi.fn(async () => undefined)
  const onMounted = vi.fn((hook: () => void) => hook())
  const onUnmounted = vi.fn((hook: () => void) => hook())
  const worlds = ref([sampleWorld])
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set(['world-1', 'group-1']))
  const { watch } = await import('vue')
  wireProjectHierarchyTreeSessionLifecycle({
    S_FaActiveProject: () => ({
      activeProject: {
        id: 'project-a'
      },
      hasActiveProject: true
    }),
    clearPendingRevealPath,
    flushUiStatePersist,
    hydrateTreeSession,
    layoutRefreshGeneration: ref(0),
    shouldDeferWorldsExpandRestore: () => false,
    onMounted,
    onUnmounted,
    openNodeIds,
    pendingRevealPath: ref(['world-1']),
    resetOnProjectClose,
    resyncTreeDataFromLayout,
    restoreExpandedSnapshot,
    revealPendingPath,
    teardown,
    treeData,
    watch,
    worlds
  })
  worlds.value = [...worlds.value]
  await vi.runAllTimersAsync()
  expect(hydrateTreeSession).toHaveBeenCalled()
  expect(resyncTreeDataFromLayout).toHaveBeenCalled()
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith(['world-1', 'group-1'])
})

test('Test that wireProjectHierarchyTreeSessionLifecycle preserves expanded snapshot after layout structure change', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set(['world-1', 'group-1', 'placement-1']))
  const worlds = ref([sampleWorld])
  const suppressTreeEmit = ref(false)
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  const syncWiring = createProjectHierarchyTreeSyncWiring({
    getPreferredLanguageCode: () => 'en-US',
    getWorlds: () => worlds.value,
    nextTick: async () => undefined,
    suppressTreeEmit,
    treeData
  })
  const { watch } = await import('vue')
  wireProjectHierarchyTreeSessionLifecycle({
    S_FaActiveProject: () => ({
      activeProject: {
        id: 'project-a'
      },
      hasActiveProject: true
    }),
    clearPendingRevealPath: vi.fn(),
    flushUiStatePersist: vi.fn(),
    hydrateTreeSession: vi.fn(async () => undefined),
    layoutRefreshGeneration: ref(0),
    shouldDeferWorldsExpandRestore: () => false,
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    openNodeIds,
    pendingRevealPath: ref([]),
    resetOnProjectClose: vi.fn(),
    resyncTreeDataFromLayout: syncWiring.resyncTreeDataFromLayout,
    restoreExpandedSnapshot,
    revealPendingPath: vi.fn(async () => undefined),
    teardown: vi.fn(),
    treeData,
    watch,
    worlds
  })
  worlds.value = [{
    ...sampleWorld,
    groups: [
      ...sampleWorld.groups,
      {
        displayName: 'Group 2',
        hasChildren: false,
        id: 'group-2',
        rootSortOrder: 1,
        worldId: 'world-1'
      }
    ]
  }]
  await Promise.resolve()
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith(
    expect.arrayContaining(['world-1', 'group-1', 'placement-1'])
  )
  expect(mapProjectHierarchyTreeToTopologyKey(treeData.value)).not.toBe(
    mapProjectHierarchyTreeToTopologyKey(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  )
})

test('Test that createProjectHierarchyTreeSessionSubWiring builds tree session deps', () => {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(sessionRefs.isTreeDragActive),
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandPostCommitGuard: sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    getPreferredLanguageCode: () => 'en-US',
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined)
    },
    isTreeDragActive: sessionRefs.isTreeDragActive,
    nextTick: async () => undefined,
    openNodeIds: sessionRefs.openNodeIds,
    pendingRevealPath: ref([]),
    ref,
    suppressTreeEmit: sessionRefs.suppressTreeEmit,
    treeComponentRef: sessionRefs.treeComponentRef,
    treeData,
    treeMountKey: sessionRefs.treeMountKey,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch,
    worlds: ref([sampleWorld])
  })
  expect(subWiring.treeRootClassList.value).toEqual({
    'projectHierarchyTree--listDragging': false
  })
  expect(subWiring.treeStyle.value.height).toBe('100%')
  expect(subWiring.syncWiring.resyncTreeDataFromLayout).toBeTypeOf('function')
})

test('Test that createProjectHierarchyTreeUiStateSessionWiring delegates UI helpers', async () => {
  const { createProjectHierarchyTreeUiStateSessionWiring } = await import('../projectHierarchyTreeUiStateSessionWiring')
  const openNodeIds = ref(new Set<string>())
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const wiring = createProjectHierarchyTreeUiStateSessionWiring({
    flushDeferredTreeRevisionPublish: vi.fn(),
    flushUiStatePersist: vi.fn(),
    getExpandedNodeIds: () => ['world-1'],
    getPendingRevealPath: () => [],
    getScrollTopPx: () => 0,
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    getWorlds: () => [],
    loadChildrenAlongRevealPath: async () => undefined,
    loadChildrenForNode: async () => undefined,
    nextTick: async () => undefined,
    openNodeIds,
    queuePersistExpandedNodeIds: vi.fn(),
    queuePersistScrollTopPx: vi.fn(),
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData,
    treeMountKey: ref(0),
    watch
  })
  wiring.markNodeOpen('world-1')
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  wiring.markNodeClosed('placement-1', placement)
  await wiring.restoreUiStateFromStore()
  await wiring.revealPendingPath()
  const detach = wiring.attachScrollPersist()
  detach()
  wiring.onUnmountedCleanup()
})

test('Test that createProjectHierarchyTreeSessionSubWiring calls bridge APIs for lazy load and move', async () => {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const listPlacementDocumentChildren = vi.fn(async () => ({
    items: [
      {
        displayName: 'Bridge doc',
        hasChildren: false,
        id: 'doc-bridge',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 0
      },
      {
        displayName: 'Bridge doc 2',
        hasChildren: false,
        id: 'doc-bridge-2',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 1
      }
    ]
  }))
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)
  window.faContentBridgeAPIs = {
    projectContent: {
      listPlacementDocumentChildren,
      reindexDocumentSiblingsInHierarchy
    }
  } as never
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(sessionRefs.isTreeDragActive),
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandPostCommitGuard: sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    getPreferredLanguageCode: () => 'en-US',
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined)
    },
    isTreeDragActive: sessionRefs.isTreeDragActive,
    nextTick: async () => undefined,
    openNodeIds: sessionRefs.openNodeIds,
    pendingRevealPath: ref([]),
    ref,
    suppressTreeEmit: sessionRefs.suppressTreeEmit,
    treeComponentRef: sessionRefs.treeComponentRef,
    treeData,
    treeMountKey: sessionRefs.treeMountKey,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch,
    worlds: ref([sampleWorld])
  })
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  await subWiring.lazyLoadWiring.loadChildrenForNode(placement)
  expect(listPlacementDocumentChildren).toHaveBeenCalledWith({
    placementId: 'placement-1'
  })
  subWiring.dndWiring.onBeforeDragStart({
    data: buildDocumentNode({
      documentId: 'doc-bridge',
      id: 'doc-bridge'
    })
  })
  const loadedPlacement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  loadedPlacement.children.reverse()
  subWiring.dndWiring.onTreeAfterDrop()
  await vi.runAllTimersAsync()
  expect(reindexDocumentSiblingsInHierarchy).toHaveBeenCalled()
})

test('Test that commitProjectHierarchyTreeDraggedDocumentMove refreshes when bucket missing', async () => {
  const refreshLayout = vi.fn(async () => undefined)
  await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'missing-doc',
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => undefined),
    refreshLayout,
    resyncTreeDataFromLayout: vi.fn(),
    treeData: []
  })
  expect(refreshLayout).toHaveBeenCalled()
})

test('Test that scheduleProjectHierarchyTreeDragCommit uses empty snapshot when drag snapshot missing', async () => {
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  scheduleProjectHierarchyTreeDragCommit(buildScheduleDragCommitTestDeps({
    dragExpandedSnapshot: () => null,
    restoreExpandedSnapshot
  }))
  await vi.runAllTimersAsync()
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith(
    [],
    PROJECT_HIERARCHY_TREE_DRAG_EXPAND_SNAPSHOT_RESTORE_OPTIONS
  )
  expect(restoreExpandedSnapshot).toHaveBeenCalledTimes(2)
})

test('Test that scheduleProjectHierarchyTreeDragCommit skips when already scheduled', () => {
  const dragCommitPending = ref(true)
  const dragCommitScheduled = ref(true)
  scheduleProjectHierarchyTreeDragCommit(buildScheduleDragCommitTestDeps({
    dragCommitPending,
    dragCommitScheduled,
    suppressTreeEmit: ref(true)
  }))
  expect(dragCommitScheduled.value).toBe(true)
})

test('Test that scheduleProjectHierarchyTreeDragCommit logs nextTick failures', async () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  scheduleProjectHierarchyTreeDragCommit(buildScheduleDragCommitTestDeps({
    nextTick: async () => {
      throw new Error('tick failed')
    }
  }))
  await vi.runAllTimersAsync()
  expect(errorSpy).toHaveBeenCalled()
  errorSpy.mockRestore()
})

test('Test that restoreProjectHierarchyTreeUiState keeps latent descendant ids when world row is collapsed', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set<string>())
  const queuePersistExpandedNodeIds = vi.fn()
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  await restoreProjectHierarchyTreeUiState({
    getExpandedNodeIds: () => ['group-1', 'placement-1'],
    getScrollTopPx: () => 0,
    getTreeRef: () => treeRef,
    getTreeScrollHost: () => null,
    getWorlds: () => [sampleWorld],
    loadChildrenAlongRevealPath: async () => undefined,
    nextTick: async () => undefined,
    onExpandedNodeIdsChange: queuePersistExpandedNodeIds,
    openNodeIds,
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData
  })
  expect([...openNodeIds.value].sort()).toEqual(['group-1', 'placement-1'])
  expect(queuePersistExpandedNodeIds).toHaveBeenCalledWith(['group-1', 'placement-1'])
  expect(treeRef.openNodeAndParents).not.toHaveBeenCalled()
})

test('Test that restoreProjectHierarchyTreeUiState keeps collapsed placements when one placement is persisted', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set<string>())
  const queuePersistExpandedNodeIds = vi.fn()
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  await restoreProjectHierarchyTreeUiState({
    getExpandedNodeIds: () => ['world-1', 'placement-2'],
    getScrollTopPx: () => 0,
    getTreeRef: () => treeRef,
    getTreeScrollHost: () => null,
    getWorlds: () => [sampleWorld],
    loadChildrenAlongRevealPath: async () => undefined,
    nextTick: async () => undefined,
    onExpandedNodeIdsChange: queuePersistExpandedNodeIds,
    openNodeIds,
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData
  })
  expect(queuePersistExpandedNodeIds).toHaveBeenCalledWith(['world-1', 'placement-2'])
  expect(treeRef.openNodeAndParents).toHaveBeenCalledTimes(2)
})

test('Test that restoreProjectHierarchyTreeUiState keeps latent placement ids under collapsed groups', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set<string>())
  const queuePersistExpandedNodeIds = vi.fn()
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  await restoreProjectHierarchyTreeUiState({
    getExpandedNodeIds: () => ['world-1', 'placement-1'],
    getScrollTopPx: () => 0,
    getTreeRef: () => treeRef,
    getTreeScrollHost: () => null,
    getWorlds: () => [sampleWorld],
    loadChildrenAlongRevealPath: async () => undefined,
    nextTick: async () => undefined,
    onExpandedNodeIdsChange: queuePersistExpandedNodeIds,
    openNodeIds,
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData
  })
  expect(queuePersistExpandedNodeIds).toHaveBeenCalledWith(['world-1', 'placement-1'])
  expect(treeRef.openNodeAndParents).toHaveBeenCalledTimes(1)
})

test('Test that restoreProjectHierarchyTreeUiState skips missing expanded node ids', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set<string>())
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  await restoreProjectHierarchyTreeUiState({
    getExpandedNodeIds: () => ['world-1', 'missing-node'],
    getScrollTopPx: () => 0,
    getTreeRef: () => treeRef,
    getTreeScrollHost: () => null,
    getWorlds: () => [],
    loadChildrenAlongRevealPath: async () => undefined,
    nextTick: async () => undefined,
    onExpandedNodeIdsChange: vi.fn(),
    openNodeIds,
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData
  })
  expect(treeRef.openNodeAndParents).toHaveBeenCalledTimes(1)
})

test('Test that remountProjectHierarchyTreeAndRestoreExpandedSnapshot restores snapshot after quiet period', async () => {
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  let tickCount = 0
  await remountProjectHierarchyTreeAndRestoreExpandedSnapshot({
    expandedNodeIds: ['world-1'],
    nextTick: async () => {
      tickCount += 1
    },
    restoreExpandedSnapshot,
    waitBeforeRemount: async () => undefined
  })
  expect(tickCount).toBe(2)
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith(['world-1'], undefined)
})

test('Test that restoreProjectHierarchyTreeExpandedSnapshot reapplies he-tree open state twice without closeAll', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set<string>())
  const queuePersistExpandedNodeIds = vi.fn()
  const flushDeferredTreeRevisionPublish = vi.fn()
  const loadChildrenForNode = vi.fn(async () => undefined)
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  await restoreProjectHierarchyTreeExpandedSnapshot(buildRestoreExpandedSnapshotTestDeps({
    expandedNodeIds: ['world-1'],
    flushDeferredTreeRevisionPublish,
    getTreeRef: () => treeRef,
    loadChildrenForNode,
    onExpandedNodeIdsChange: queuePersistExpandedNodeIds,
    openNodeIds,
    treeData
  }))
  expect(flushDeferredTreeRevisionPublish).toHaveBeenCalledTimes(1)
  expect(treeRef.closeAll).not.toHaveBeenCalled()
  expect(treeRef.openNodeAndParents).toHaveBeenCalledTimes(3)
  expect(queuePersistExpandedNodeIds).toHaveBeenCalledWith(['world-1'])
})

test('Test that restoreProjectHierarchyTreeExpandedSnapshot preloads children before reopening', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const loadChildrenForNode = vi.fn(async () => undefined)
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  await restoreProjectHierarchyTreeExpandedSnapshot(buildRestoreExpandedSnapshotTestDeps({
    expandedNodeIds: ['world-1', 'group-1', 'placement-1'],
    getTreeRef: () => treeRef,
    loadChildrenForNode,
    treeData
  }))
  expect(loadChildrenForNode).toHaveBeenCalled()
})

test('Test that restoreProjectHierarchyTreeExpandedSnapshot skips stale expanded node ids', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  await restoreProjectHierarchyTreeExpandedSnapshot(buildRestoreExpandedSnapshotTestDeps({
    expandedNodeIds: ['missing-node'],
    getTreeRef: () => treeRef,
    treeData
  }))
  expect(treeRef.openNodeAndParents).not.toHaveBeenCalled()
})

test('Test that createProjectHierarchyTreeLazyLoadWiring defers tree revision publish while drag expand UI is frozen', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const initialTree = treeData.value
  const listPlacementDocumentChildren = vi.fn(async () => ({
    items: [
      {
        displayName: 'Doc defer',
        hasChildren: false,
        id: 'doc-defer',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 0
      }
    ]
  }))
  const wiring = createProjectHierarchyTreeLazyLoadWiring({
    getPreferredLanguageCode: () => 'en-US',
    listPlacementDocumentChildren,
    nextTick: async () => undefined,
    onAfterTreeRevisionPublished: vi.fn(),
    shouldDeferTreeRevisionPublish: () => true,
    suppressTreeEmit: ref(false),
    treeData
  })
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  await wiring.loadChildrenForNode(placement)
  expect(treeData.value).toBe(initialTree)
  await wiring.flushDeferredTreeRevisionPublish()
  expect(treeData.value).not.toBe(initialTree)
})

test('Test that createProjectHierarchyTreeLazyLoadWiring flush is no-op without deferred publish', () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const wiring = createProjectHierarchyTreeLazyLoadWiring({
    getPreferredLanguageCode: () => 'en-US',
    listPlacementDocumentChildren: vi.fn(async () => ({
      items: []
    })),
    nextTick: async () => undefined,
    onAfterTreeRevisionPublished: vi.fn(),
    shouldDeferTreeRevisionPublish: () => false,
    suppressTreeEmit: ref(false),
    treeData
  })
  const before = treeData.value
  wiring.flushDeferredTreeRevisionPublish()
  expect(treeData.value).toBe(before)
})

test('Test that createProjectHierarchyTreeLazyLoadWiring loads nested document children', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const children = mapHierarchyDocumentChildrenToTreeNodes({
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
  mergeLoadedChildrenIntoNode(tree, 'placement-1', children)
  const treeData = ref(tree)
  const listPlacementDocumentChildren = vi.fn(async (
    input: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => {
    if (input.parentDocumentId === 'doc-parent') {
      return {
        items: [
          {
            displayName: 'Child doc',
            hasChildren: false,
            id: 'doc-child',
            parentDocumentId: 'doc-parent',
            placementId: 'placement-1',
            sortOrder: 0
          }
        ]
      }
    }
    return {
      items: []
    }
  })
  const wiring = createProjectHierarchyTreeLazyLoadWiring({
    getPreferredLanguageCode: () => 'en-US',
    listPlacementDocumentChildren,
    nextTick: async () => undefined,
    onAfterTreeRevisionPublished: vi.fn(),
    shouldDeferTreeRevisionPublish: () => false,
    suppressTreeEmit: ref(false),
    treeData
  })
  const parent = findProjectHierarchyTreeNodeById(treeData.value, 'doc-parent')!
  await wiring.loadChildrenForNode(parent)
  expect(findProjectHierarchyTreeNodeById(treeData.value, 'doc-child')?.label).toBe('Child doc')
})

test('Test that placement collapse and reopen reloads multinested document descendants', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set([
    'world-1',
    'group-1',
    'doc-08',
    'doc-09',
    'doc-new'
  ]))
  const listPlacementDocumentChildren = vi.fn(async (
    input: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => {
    if (input.parentDocumentId === 'doc-09') {
      return {
        items: [
          {
            displayName: 'New building',
            hasChildren: false,
            id: 'doc-new',
            parentDocumentId: 'doc-09',
            placementId: 'placement-1',
            sortOrder: 0
          }
        ]
      }
    }
    if (input.parentDocumentId === 'doc-08') {
      return {
        items: [
          {
            displayName: 'Test Document - Buildings 09',
            hasChildren: true,
            id: 'doc-09',
            parentDocumentId: 'doc-08',
            placementId: 'placement-1',
            sortOrder: 0
          }
        ]
      }
    }
    return {
      items: [
        {
          displayName: 'Test Document - Buildings 08',
          hasChildren: true,
          id: 'doc-08',
          parentDocumentId: null,
          placementId: 'placement-1',
          sortOrder: 0
        }
      ]
    }
  })
  const lazyLoadWiring = createProjectHierarchyTreeLazyLoadWiring({
    getPreferredLanguageCode: () => 'en-US',
    listPlacementDocumentChildren,
    nextTick: async () => undefined,
    onAfterTreeRevisionPublished: vi.fn(),
    shouldDeferTreeRevisionPublish: () => false,
    suppressTreeEmit: ref(false),
    treeData
  })
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  markProjectHierarchyTreeNodeClosed({
    node: placement,
    nodeId: placement.id,
    openNodeIds,
    queuePersistExpandedNodeIds: vi.fn(),
    treeData
  })
  expect(placement.children).toEqual([])
  expect(placement.childrenLoaded).toBe(false)
  await runProjectHierarchyTreeSessionExpandOpen({
    flushDeferredTreeRevisionPublish: lazyLoadWiring.flushDeferredTreeRevisionPublish,
    loadChildrenForNode: lazyLoadWiring.loadChildrenForNode,
    markNodeOpen: (nodeId) => {
      markProjectHierarchyTreeNodeOpen({
        nodeId,
        openNodeIds,
        queuePersistExpandedNodeIds: vi.fn(),
        treeData
      })
    },
    node: placement,
    reapplyLatentDescendantExpandState: async () => {
      await reapplyProjectHierarchyTreeLatentDescendantExpandState({
        getTreeRef: () => null,
        loadChildrenAlongRevealPath: lazyLoadWiring.loadChildrenAlongRevealPath,
        openNodeIds,
        treeData
      })
    },
    treeRef: null
  })
  expect(findProjectHierarchyTreeNodeById(treeData.value, 'doc-new')?.label).toBe('New building')
})

test('Test that group then placement collapse and reopen keeps multinested expand ids', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set([
    'world-1',
    'group-1',
    'placement-1',
    'doc-08',
    'doc-09',
    'doc-new'
  ]))
  const listPlacementDocumentChildren = vi.fn(async (
    input: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => {
    if (input.parentDocumentId === 'doc-09') {
      return {
        items: [
          {
            displayName: 'New building',
            hasChildren: false,
            id: 'doc-new',
            parentDocumentId: 'doc-09',
            placementId: 'placement-1',
            sortOrder: 0
          }
        ]
      }
    }
    if (input.parentDocumentId === 'doc-08') {
      return {
        items: [
          {
            displayName: 'Test Document - Buildings 09',
            hasChildren: true,
            id: 'doc-09',
            parentDocumentId: 'doc-08',
            placementId: 'placement-1',
            sortOrder: 0
          }
        ]
      }
    }
    return {
      items: [
        {
          displayName: 'Test Document - Buildings 08',
          hasChildren: true,
          id: 'doc-08',
          parentDocumentId: null,
          placementId: 'placement-1',
          sortOrder: 0
        }
      ]
    }
  })
  const lazyLoadWiring = createProjectHierarchyTreeLazyLoadWiring({
    getPreferredLanguageCode: () => 'en-US',
    listPlacementDocumentChildren,
    nextTick: async () => undefined,
    onAfterTreeRevisionPublished: vi.fn(),
    shouldDeferTreeRevisionPublish: () => false,
    suppressTreeEmit: ref(false),
    treeData
  })
  const reapplyLatentDescendantExpandState = async () => {
    await reapplyProjectHierarchyTreeLatentDescendantExpandState({
      getTreeRef: () => null,
      loadChildrenAlongRevealPath: lazyLoadWiring.loadChildrenAlongRevealPath,
      openNodeIds,
      treeData
    })
  }
  const markNodeOpen = (nodeId: string) => {
    markProjectHierarchyTreeNodeOpen({
      nodeId,
      openNodeIds,
      queuePersistExpandedNodeIds: vi.fn(),
      treeData
    })
  }
  const group = findProjectHierarchyTreeNodeById(treeData.value, 'group-1')!
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  markProjectHierarchyTreeNodeClosed({
    node: group,
    nodeId: group.id,
    openNodeIds,
    queuePersistExpandedNodeIds: vi.fn(),
    treeData
  })
  expect(openNodeIds.value.has('group-1')).toBe(false)
  expect(openNodeIds.value.has('placement-1')).toBe(true)
  expect(openNodeIds.value.has('doc-new')).toBe(true)
  await runProjectHierarchyTreeSessionExpandOpen({
    flushDeferredTreeRevisionPublish: lazyLoadWiring.flushDeferredTreeRevisionPublish,
    loadChildrenForNode: lazyLoadWiring.loadChildrenForNode,
    markNodeOpen,
    node: group,
    reapplyLatentDescendantExpandState,
    treeRef: null
  })
  markProjectHierarchyTreeNodeClosed({
    node: placement,
    nodeId: placement.id,
    openNodeIds,
    queuePersistExpandedNodeIds: vi.fn(),
    treeData
  })
  expect(placement.children).toEqual([])
  expect(openNodeIds.value.has('doc-new')).toBe(true)
  await runProjectHierarchyTreeSessionExpandOpen({
    flushDeferredTreeRevisionPublish: lazyLoadWiring.flushDeferredTreeRevisionPublish,
    loadChildrenForNode: lazyLoadWiring.loadChildrenForNode,
    markNodeOpen,
    node: placement,
    reapplyLatentDescendantExpandState,
    treeRef: null
  })
  expect(findProjectHierarchyTreeNodeById(treeData.value, 'doc-new')?.label).toBe('New building')
  expect(openNodeIds.value.has('doc-08')).toBe(true)
  expect(openNodeIds.value.has('doc-09')).toBe(true)
})

test('Test that restoreProjectHierarchyTreeExpandedSnapshot skips missing preload nodes', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const loadChildrenForNode = vi.fn(async () => undefined)
  const originalFind = projectHierarchyTreeExpandState.findProjectHierarchyTreeNodeById
  const findSpy = vi.spyOn(projectHierarchyTreeExpandState, 'findProjectHierarchyTreeNodeById')
  findSpy.mockImplementation((nodes, nodeId) => {
    if (nodeId === 'group-1') {
      return null
    }
    return originalFind(nodes, nodeId)
  })
  await restoreProjectHierarchyTreeExpandedSnapshot(buildRestoreExpandedSnapshotTestDeps({
    expandedNodeIds: ['world-1', 'group-1', 'placement-1'],
    getTreeRef: () => ({
      closeAll: vi.fn(),
      openNodeAndParents: vi.fn()
    }),
    loadChildrenForNode,
    treeData
  }))
  expect(loadChildrenForNode).toHaveBeenCalled()
  findSpy.mockRestore()
})

test('Test that expanded restore order helpers sort and collect lazy-load ids', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(sortProjectHierarchyTreeExpandedNodeIdsForRestore(tree, ['placement-1', 'world-1'])).toEqual([
    'world-1',
    'placement-1'
  ])
  expect(sortProjectHierarchyTreeExpandedNodeIdsForRestore(tree, ['placement-2', 'group-1'])).toEqual([
    'group-1',
    'placement-2'
  ])
  expect(sortProjectHierarchyTreeExpandedNodeIdsForRestore(tree, ['missing-b', 'missing-a'])).toEqual([
    'missing-a',
    'missing-b'
  ])
  expect(collectProjectHierarchyTreeLazyLoadIdsAlongExpandedPaths(tree, ['placement-1'])).toEqual([
    'world-1',
    'group-1',
    'placement-1'
  ])
  expect(collectProjectHierarchyTreeLazyLoadIdsAlongExpandedPaths(tree, ['group-1', 'world-1'])).toEqual([
    'world-1',
    'group-1'
  ])
})

test('Test that restoreProjectHierarchyTreeExpandedSnapshot skips open state when tree ref missing', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const loadChildrenForNode = vi.fn(async () => undefined)
  const flushDeferredTreeRevisionPublish = vi.fn()
  await restoreProjectHierarchyTreeExpandedSnapshot(buildRestoreExpandedSnapshotTestDeps({
    expandedNodeIds: ['world-1', 'group-1', 'placement-1'],
    flushDeferredTreeRevisionPublish,
    getTreeRef: () => null,
    loadChildrenForNode,
    treeData
  }))
  expect(loadChildrenForNode).toHaveBeenCalled()
  expect(flushDeferredTreeRevisionPublish).toHaveBeenCalledTimes(1)
})

test('Test that restoreProjectHierarchyTreeExpandedSnapshot tolerates missing tree ref during open apply', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  let getTreeRefCalls = 0
  await restoreProjectHierarchyTreeExpandedSnapshot(buildRestoreExpandedSnapshotTestDeps({
    expandedNodeIds: ['world-1'],
    getTreeRef: () => {
      getTreeRefCalls += 1
      if (getTreeRefCalls === 1) {
        return treeRef
      }
      if (getTreeRefCalls === 2) {
        return null
      }
      return treeRef
    },
    treeData
  }))
  expect(treeRef.closeAll).not.toHaveBeenCalled()
  expect(treeRef.openNodeAndParents).toHaveBeenCalledTimes(1)
})

test('Test that reapplyProjectHierarchyTreeHeTreeOpenState reopens persisted rows on he-tree', () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set(['world-1', 'group-1', 'placement-1']))
  const openNodeAndParents = vi.fn()
  reapplyProjectHierarchyTreeHeTreeOpenState({
    getTreeRef: () => ({
      closeAll: vi.fn(),
      openNodeAndParents
    }),
    openNodeIds,
    treeData
  })
  expect(openNodeAndParents).toHaveBeenCalledTimes(3)
})

test('Test that syncProjectHierarchyTreeOpenSetToPersist queues latent descendant ids under collapsed world', () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set(['group-1', 'placement-1']))
  const queuePersistExpandedNodeIds = vi.fn()
  syncProjectHierarchyTreeOpenSetToPersist({
    openNodeIds,
    queuePersistExpandedNodeIds,
    treeData
  })
  expect(queuePersistExpandedNodeIds).toHaveBeenCalledWith(['group-1', 'placement-1'])
})

test('Test that syncProjectHierarchyTreeOpenSetToPersist queues expanded ids', () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set(['world-1']))
  const queuePersistExpandedNodeIds = vi.fn()
  syncProjectHierarchyTreeOpenSetToPersist({
    openNodeIds,
    queuePersistExpandedNodeIds,
    treeData
  })
  expect(queuePersistExpandedNodeIds).toHaveBeenCalledWith(['world-1'])
})

test('Test that createProjectHierarchyTreeSessionWiring returns tree API', async () => {
  const { createProjectHierarchyTreeSessionWiring } = await import('../projectHierarchyTreeSessionWiring')
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([])
  const api = createProjectHierarchyTreeSessionWiring({
    S_FaActiveProject: () => ({
      activeProject: null,
      hasActiveProject: false
    }),
    computed,
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    dragContext: {
      dragNode: null
    },
    hierarchyStore: {
      clearPendingDocumentRefreshIds: vi.fn(),
      clearPendingHierarchyNodeRefreshIds: vi.fn(),
      clearPendingRevealPath: vi.fn(),
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined),
      refreshUiState: vi.fn(async () => undefined),
      resetOnProjectClose: vi.fn()
    },
    nextTick: async () => undefined,
    onDocumentOpenRequest: vi.fn(),
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    pendingDocumentRefreshIds: ref([]),
    pendingHierarchyNodeRefreshIds: ref([]),
    pendingRevealPath: ref([]),
    ref,
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    treeData,
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch: vi.fn(),
    layoutRefreshGeneration: ref(0),
    worlds: ref([])
  })
  expect(api.treeData).toBe(treeData)
  expect(api.onNodeClick).toBeTypeOf('function')
})

test('Test that createProjectHierarchyTreeSessionSubWiring handles missing bridge APIs', async () => {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  window.faContentBridgeAPIs = {
    projectContent: {}
  } as never as never
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(sessionRefs.isTreeDragActive),
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandPostCommitGuard: sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    getPreferredLanguageCode: () => 'en-US',
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined)
    },
    isTreeDragActive: sessionRefs.isTreeDragActive,
    nextTick: async () => undefined,
    openNodeIds: sessionRefs.openNodeIds,
    pendingRevealPath: ref([]),
    ref,
    suppressTreeEmit: sessionRefs.suppressTreeEmit,
    treeComponentRef: sessionRefs.treeComponentRef,
    treeData,
    treeMountKey: sessionRefs.treeMountKey,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch,
    worlds: ref([sampleWorld])
  })
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  await subWiring.lazyLoadWiring.loadChildrenForNode(placement)
  subWiring.dndWiring.onBeforeDragStart({
    data: buildDocumentNode()
  })
  subWiring.dndWiring.onTreeAfterDrop()
  await vi.runAllTimersAsync()
})

test('Test that restoreProjectHierarchyTreeUiState skips missing nodes during restore', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set<string>())
  const loadChildrenAlongRevealPath = vi.fn(async () => undefined)
  const findSpy = vi.spyOn(projectHierarchyTreeExpandState, 'findProjectHierarchyTreeNodeById').mockReturnValue(null)
  await restoreProjectHierarchyTreeUiState({
    getExpandedNodeIds: () => ['world-1'],
    getScrollTopPx: () => 0,
    getTreeRef: () => ({
      closeAll: vi.fn(),
      openNodeAndParents: vi.fn()
    }),
    getTreeScrollHost: () => null,
    getWorlds: () => [],
    loadChildrenAlongRevealPath,
    nextTick: async () => undefined,
    onExpandedNodeIdsChange: vi.fn(),
    openNodeIds,
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData
  })
  expect(loadChildrenAlongRevealPath).toHaveBeenCalledWith(['world-1'])
  findSpy.mockRestore()
})

test('Test that restoreProjectHierarchyTreeUiState loads children when tree ref missing', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const openNodeIds = ref(new Set<string>())
  const loadChildrenAlongRevealPath = vi.fn(async () => undefined)
  await restoreProjectHierarchyTreeUiState({
    getExpandedNodeIds: () => ['world-1'],
    getScrollTopPx: () => 0,
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    getWorlds: () => [sampleWorld],
    loadChildrenAlongRevealPath,
    nextTick: async () => undefined,
    onExpandedNodeIdsChange: vi.fn(),
    openNodeIds,
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData
  })
  expect(loadChildrenAlongRevealPath).toHaveBeenCalledWith(['world-1'])
})

test('Test that revealProjectHierarchyTreePendingPath skips missing nodes in path', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  await revealProjectHierarchyTreePendingPath({
    getPendingRevealPath: () => ['world-1', 'missing-node', 'placement-1'],
    getTreeRef: () => treeRef,
    getTreeScrollHost: () => null,
    loadChildrenAlongRevealPath: async () => undefined,
    markNodeOpen: vi.fn(),
    nextTick: async () => undefined,
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData
  })
  expect(treeRef.openNodeAndParents).toHaveBeenCalled()
})

test('Test that revealProjectHierarchyTreePendingPath scrolls focused row into view', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  const row = document.createElement('div')
  row.setAttribute('data-test-hierarchy-node-id', 'placement-1')
  row.scrollIntoView = vi.fn()
  tree.appendChild(row)
  host.appendChild(tree)
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  await revealProjectHierarchyTreePendingPath({
    getPendingRevealPath: () => ['world-1', 'placement-1'],
    getTreeRef: () => treeRef,
    getTreeScrollHost: () => host,
    loadChildrenAlongRevealPath: async () => undefined,
    markNodeOpen: vi.fn(),
    nextTick: async () => undefined,
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData
  })
  expect(row.scrollIntoView).toHaveBeenCalled()
})

test('Test that createProjectHierarchyTreeDnDWiring ignores document nodes without documentId', () => {
  const isTreeDragActive = ref(false)
  const dragExpandUiFrozen = ref(false)
  const wiring = createProjectHierarchyTreeDnDWiring(buildProjectHierarchyTreeDnDWiringTestDeps({
    dragExpandUiFrozen,
    isTreeDragActive
  }))
  wiring.onBeforeDragStart({
    data: buildDocumentNode({
      documentId: null
    })
  })
  expect(isTreeDragActive.value).toBe(false)
  expect(dragExpandUiFrozen.value).toBe(false)
})

test('Test that createProjectHierarchyTreeDnDWiring ignores non-document drag starts', () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([])
  const isTreeDragActive = ref(false)
  const wiring = createProjectHierarchyTreeDnDWiring(buildProjectHierarchyTreeDnDWiringTestDeps({
    isTreeDragActive,
    suppressTreeEmit: ref(true),
    treeData
  }))
  wiring.onBeforeDragStart({
    data: placementNode()
  })
  expect(isTreeDragActive.value).toBe(false)
  wiring.onTreeDataUpdate([])
  wiring.onTreeDragEndCleanup()
})

test('Test that createUseProjectHierarchyTree composes hierarchy session wiring', async () => {
  const { createUseProjectHierarchyTree } = await import('../createUseProjectHierarchyTree')
  const { watch } = await import('vue')
  const hierarchyStore = {
    clearPendingDocumentRefreshIds: vi.fn(),
    clearPendingRevealPath: vi.fn(),
    flushUiStatePersist: vi.fn(),
    queuePersistExpandedNodeIds: vi.fn(),
    queuePersistScrollTopPx: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
    refreshUiState: vi.fn(async () => undefined),
    resetOnProjectClose: vi.fn()
  }
  const pendingDocumentRefreshIds = ref<string[]>([])
  const pendingRevealPath = ref(['world-1'])
  const routePath = ref('/home/document/doc-a')
  const useTree = createUseProjectHierarchyTree({
    S_FaActiveProject: (() => ({
      activeProject: {
        filePath: 'C:\\a.faproject',
        id: 'project-a',
        name: 'Project A'
      },
      hasActiveProject: true
    })) as never,
    S_FaOpenedDocuments: (() => ({
      createTemporaryDocument: vi.fn(async () => 'temp-doc')
    })) as never,
    S_FaProjectHierarchyTree: (() => hierarchyStore) as never,
    S_FaUserSettings: (() => ({
      settings: {
        languageCode: 'en-US'
      }
    })) as never,
    computed,
    dragContext: {
      dragNode: null
    } as never,
    nextTick: async () => undefined,
    onMounted: (hook) => hook(),
    onUnmounted: (hook) => hook(),
    ref,
    resolveFaDocumentWorkspaceRouteDocumentId: (path) => {
      return path.startsWith('/home/document/') ? path.slice('/home/document/'.length) : null
    },
    runFaAction: vi.fn(),
    storeToRefs: ((store: { flushUiStatePersist?: unknown }) => {
      return {
        pendingDocumentRefreshIds,
        pendingHierarchyNodeRefreshIds: ref<string[]>([]),
        pendingRevealPath,
        layoutRefreshGeneration: ref(0),
        treeData: ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])),
        uiState: ref({
          expandedNodeIds: [],
          schemaVersion: 1,
          scrollTopPx: 0
        }),
        worlds: ref([sampleWorld])
      }
    }) as never,
    useRoute: () => ({
      path: routePath.value
    }),
    watch
  })
  const api = useTree({
    onDocumentOpenRequest: vi.fn()
  })
  expect(api.activeDocumentId.value).toBe('doc-a')
  expect(api.onNodeOpen).toBeTypeOf('function')
  expect(hierarchyStore.flushUiStatePersist).toHaveBeenCalled()
  pendingRevealPath.value = ['world-1', 'placement-1']
  await vi.waitFor(() => {
    expect(hierarchyStore.clearPendingRevealPath).toHaveBeenCalled()
  })
})

test('Test that createUseProjectHierarchyTree treats missing route path as non-document workspace', async () => {
  const { createUseProjectHierarchyTree } = await import('../createUseProjectHierarchyTree')
  const { watch } = await import('vue')
  const hierarchyStore = {
    clearPendingDocumentRefreshIds: vi.fn(),
    clearPendingRevealPath: vi.fn(),
    flushUiStatePersist: vi.fn(),
    queuePersistExpandedNodeIds: vi.fn(),
    queuePersistScrollTopPx: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
    refreshUiState: vi.fn(async () => undefined),
    resetOnProjectClose: vi.fn()
  }
  const useTree = createUseProjectHierarchyTree({
    S_FaActiveProject: (() => ({
      activeProject: {
        filePath: 'C:\\a.faproject',
        id: 'project-a',
        name: 'Project A'
      },
      hasActiveProject: true
    })) as never,
    S_FaOpenedDocuments: (() => ({
      createTemporaryDocument: vi.fn(async () => 'temp-doc')
    })) as never,
    S_FaProjectHierarchyTree: (() => hierarchyStore) as never,
    S_FaUserSettings: (() => ({
      settings: {
        languageCode: 'en-US'
      }
    })) as never,
    computed,
    dragContext: {
      dragNode: null
    } as never,
    nextTick: async () => undefined,
    onMounted: (hook) => hook(),
    onUnmounted: (hook) => hook(),
    ref,
    resolveFaDocumentWorkspaceRouteDocumentId: () => null,
    runFaAction: vi.fn(),
    storeToRefs: (() => ({
      pendingDocumentRefreshIds: ref<string[]>([]),
      pendingHierarchyNodeRefreshIds: ref<string[]>([]),
      pendingRevealPath: ref<string[]>([]),
      layoutRefreshGeneration: ref(0),
      treeData: ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])),
      uiState: ref({
        expandedNodeIds: [],
        schemaVersion: 1,
        scrollTopPx: 0
      }),
      worlds: ref([sampleWorld])
    })) as never,
    useRoute: () => ({}),
    watch
  })
  const api = useTree({
    onDocumentOpenRequest: vi.fn()
  })
  expect(api.activeDocumentId.value).toBeNull()
})

test('Test that createUseProjectHierarchyTree falls back to en-US when user settings are missing', async () => {
  const { createUseProjectHierarchyTree } = await import('../createUseProjectHierarchyTree')
  const { watch } = await import('vue')
  const createTemporaryDocument = vi.fn(async () => 'temp-doc')
  const hierarchyStore = {
    clearPendingDocumentRefreshIds: vi.fn(),
    clearPendingRevealPath: vi.fn(),
    flushUiStatePersist: vi.fn(),
    queuePersistExpandedNodeIds: vi.fn(),
    queuePersistScrollTopPx: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
    refreshUiState: vi.fn(async () => undefined),
    resetOnProjectClose: vi.fn()
  }
  const useTree = createUseProjectHierarchyTree({
    S_FaActiveProject: (() => ({
      activeProject: {
        filePath: 'C:\\a.faproject',
        id: 'project-a',
        name: 'Project A'
      },
      hasActiveProject: true
    })) as never,
    S_FaOpenedDocuments: (() => ({
      createTemporaryDocument
    })) as never,
    S_FaProjectHierarchyTree: (() => hierarchyStore) as never,
    S_FaUserSettings: (() => ({
      settings: null
    })) as never,
    computed,
    dragContext: {
      dragNode: null
    } as never,
    nextTick: async () => undefined,
    onMounted: (hook) => hook(),
    onUnmounted: (hook) => hook(),
    ref,
    resolveFaDocumentWorkspaceRouteDocumentId: () => null,
    runFaAction: vi.fn(),
    storeToRefs: (() => ({
      pendingDocumentRefreshIds: ref<string[]>([]),
      pendingHierarchyNodeRefreshIds: ref<string[]>([]),
      pendingRevealPath: ref<string[]>([]),
      layoutRefreshGeneration: ref(0),
      treeData: ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])),
      uiState: ref({
        expandedNodeIds: [],
        schemaVersion: 1,
        scrollTopPx: 0
      }),
      worlds: ref([sampleWorld])
    })) as never,
    useRoute: () => ({
      path: '/home'
    }),
    watch
  })
  const api = useTree({
    onDocumentOpenRequest: vi.fn()
  })
  api.onNodeClick({
    children: [],
    data: {
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
      titlePluralTranslations: { 'en-US': 'Characters' },
      titleSingularTranslations: { 'en-US': 'Character' },
      worldColor: '#336699',
      worldId: 'world-1'
    }
  })
  expect(createTemporaryDocument).toHaveBeenCalledWith(expect.objectContaining({
    displayName: 'New character'
  }))
})

test('Test that createProjectHierarchyTreeSessionSubWiring delegates UI state store writes', async () => {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const queuePersistExpandedNodeIds = vi.fn()
  const queuePersistScrollTopPx = vi.fn()
  const flushUiStatePersist = vi.fn()
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(sessionRefs.isTreeDragActive),
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandPostCommitGuard: sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    getPreferredLanguageCode: () => 'en-US',
    hierarchyStore: {
      flushUiStatePersist,
      queuePersistExpandedNodeIds,
      queuePersistScrollTopPx,
      refreshLayout: vi.fn(async () => undefined)
    },
    isTreeDragActive: sessionRefs.isTreeDragActive,
    nextTick: async () => undefined,
    openNodeIds: sessionRefs.openNodeIds,
    pendingRevealPath: ref(['world-1']),
    ref,
    suppressTreeEmit: sessionRefs.suppressTreeEmit,
    treeComponentRef: sessionRefs.treeComponentRef,
    treeData,
    treeMountKey: sessionRefs.treeMountKey,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    uiState: ref({
      expandedNodeIds: ['world-1'],
      schemaVersion: 1,
      scrollTopPx: 4
    }),
    watch,
    worlds: ref([sampleWorld])
  })
  subWiring.uiStateWiring.markNodeOpen('world-1')
  expect(queuePersistExpandedNodeIds).toHaveBeenCalled()
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  host.appendChild(tree)
  sessionRefs.treeScrollHostRef.value = host
  const detach = subWiring.uiStateWiring.attachScrollPersist()
  tree.scrollTop = 10
  tree.dispatchEvent(new Event('scroll'))
  expect(queuePersistScrollTopPx).toHaveBeenCalledWith(10)
  detach()
  subWiring.uiStateWiring.onUnmountedCleanup()
  expect(flushUiStatePersist).toHaveBeenCalled()
})

test('Test that createProjectHierarchyTreeSessionSubWiring propagates move failures', async () => {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  window.faContentBridgeAPIs = {
    projectContent: {
      listPlacementDocumentChildren: vi.fn(async () => ({
        items: [
          {
            displayName: 'Doc move',
            hasChildren: false,
            id: 'doc-move',
            parentDocumentId: null,
            placementId: 'placement-1',
            sortOrder: 0
          }
        ]
      })),
      reindexDocumentSiblingsInHierarchy: vi.fn(async () => {
        throw new Error('move failed')
      })
    }
  } as never
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(sessionRefs.isTreeDragActive),
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandPostCommitGuard: sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    getPreferredLanguageCode: () => 'en-US',
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined)
    },
    isTreeDragActive: sessionRefs.isTreeDragActive,
    nextTick: async () => undefined,
    openNodeIds: sessionRefs.openNodeIds,
    pendingRevealPath: ref([]),
    ref,
    suppressTreeEmit: sessionRefs.suppressTreeEmit,
    treeComponentRef: sessionRefs.treeComponentRef,
    treeData,
    treeMountKey: sessionRefs.treeMountKey,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch,
    worlds: ref([sampleWorld])
  })
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  await subWiring.lazyLoadWiring.loadChildrenForNode(placement)
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  subWiring.dndWiring.onBeforeDragStart({
    data: buildDocumentNode({
      documentId: 'doc-move',
      id: 'doc-move'
    })
  })
  subWiring.dndWiring.onTreeAfterDrop()
  await vi.runAllTimersAsync()
  errorSpy.mockRestore()
})

test('Test that scheduleProjectHierarchyTreeDragCommit persists after suppress emit clears', async () => {
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)
  const dragExpandUiFrozen = ref(true)
  const suppressTreeEmit = ref(true)
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placementChildren = mapHierarchyDocumentChildrenToTreeNodes({
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
  mergeLoadedChildrenIntoNode(tree, 'placement-1', placementChildren)
  let tickCount = 0
  scheduleProjectHierarchyTreeDragCommit(buildScheduleDragCommitTestDeps({
    draggedDocumentId: () => 'doc-1',
    dragExpandUiFrozen,
    reindexDocumentSiblingsInHierarchy,
    nextTick: async () => {
      tickCount += 1
      if (tickCount >= 2) {
        suppressTreeEmit.value = false
      }
    },
    suppressTreeEmit,
    treeData: ref(tree)
  }))
  await vi.runAllTimersAsync()
  expect(reindexDocumentSiblingsInHierarchy).toHaveBeenCalled()
  expect(dragExpandUiFrozen.value).toBe(false)
})

test('Test that commitProjectHierarchyTreeDraggedDocumentMove ignores documents without placementId', async () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const children = mapHierarchyDocumentChildrenToTreeNodes({
    items: [
      {
        displayName: 'Doc bad',
        hasChildren: false,
        id: 'doc-bad',
        parentDocumentId: null,
        placementId: 'placement-1',
        sortOrder: 0
      }
    ],
    placementIcon: 'mdi-account',
    worldColor: '#000',
    worldId: 'world-1'
  })
  const badChild = {
    ...children[0]!,
    placementId: null
  }
  mergeLoadedChildrenIntoNode(tree, 'placement-1', [badChild])
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)
  await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-bad',
    reindexDocumentSiblingsInHierarchy,
    refreshLayout: vi.fn(async () => undefined),
    resyncTreeDataFromLayout: vi.fn(),
    treeData: tree
  })
  expect(reindexDocumentSiblingsInHierarchy).not.toHaveBeenCalled()
})

test('Test that lazy load reveal path skips missing node ids', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const listPlacementDocumentChildren = vi.fn(async () => ({
    items: []
  }))
  const wiring = createProjectHierarchyTreeLazyLoadWiring({
    getPreferredLanguageCode: () => 'en-US',
    listPlacementDocumentChildren,
    nextTick: async () => undefined,
    onAfterTreeRevisionPublished: vi.fn(),
    shouldDeferTreeRevisionPublish: () => false,
    suppressTreeEmit: ref(false),
    treeData
  })
  await wiring.loadChildrenAlongRevealPath(['missing-node'])
  expect(listPlacementDocumentChildren).not.toHaveBeenCalled()
})

test('Test that sync wiring patches labels when topology is unchanged', () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const wiring = createProjectHierarchyTreeSyncWiring({
    getPreferredLanguageCode: () => 'en-US',
    getWorlds: () => [
      {
        ...sampleWorld,
        displayName: 'Patched world'
      }
    ],
    nextTick: async () => undefined,
    suppressTreeEmit: ref(false),
    treeData
  })
  const priorTopology = mapProjectHierarchyTreeToTopologyKey(treeData.value)
  wiring.resyncTreeDataFromLayout()
  expect(mapProjectHierarchyTreeToTopologyKey(treeData.value)).toBe(priorTopology)
  expect(treeData.value[0]?.label).toBe('Patched world')
})

test('Test that createProjectHierarchyTreeSyncWiring rebuilds skeleton when topology changes', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const suppressTreeEmit = ref(false)
  const wiring = createProjectHierarchyTreeSyncWiring({
    getPreferredLanguageCode: () => 'en-US',
    getWorlds: () => [
      {
        ...sampleWorld,
        groups: [],
        placements: [sampleWorld.placements[1]!]
      }
    ],
    nextTick: async () => undefined,
    suppressTreeEmit,
    treeData
  })
  wiring.resyncTreeDataFromLayout()
  expect(suppressTreeEmit.value).toBe(true)
  await vi.waitFor(() => {
    expect(suppressTreeEmit.value).toBe(false)
  })
  expect(treeData.value[0]?.children).toHaveLength(1)
  expect(treeData.value[0]?.children[0]?.nodeKind).toBe('templatePlacement')
})

test('Test that createProjectHierarchyTreeLazyLoadWiring loads empty template placements and injects add-new', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const listPlacementDocumentChildren = vi.fn(async () => ({
    items: []
  }))
  const wiring = createProjectHierarchyTreeLazyLoadWiring({
    getPreferredLanguageCode: () => 'en-US',
    listPlacementDocumentChildren,
    nextTick: async () => undefined,
    onAfterTreeRevisionPublished: vi.fn(),
    shouldDeferTreeRevisionPublish: () => false,
    suppressTreeEmit: ref(false),
    treeData
  })
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-2')!
  await wiring.loadChildrenForNode(placement)
  expect(listPlacementDocumentChildren).toHaveBeenCalledWith({
    placementId: 'placement-2'
  })
  expect(placement.children).toHaveLength(1)
  expect(placement.children[0]?.nodeKind).toBe('addNewDocument')
  placement.childrenLoaded = true
  await wiring.loadChildrenForNode(placement)
  expect(listPlacementDocumentChildren).toHaveBeenCalledTimes(1)
})

test('Test that createProjectHierarchyTreeLazyLoadWiring tolerates merge misses and missing reveal nodes', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const initialTree = treeData.value
  const listPlacementDocumentChildren = vi.fn(async () => ({
    items: [
      {
        displayName: 'Doc nested',
        hasChildren: false,
        id: 'doc-nested',
        parentDocumentId: 'doc-parent',
        placementId: 'placement-1',
        sortOrder: 0
      }
    ]
  }))
  const wiring = createProjectHierarchyTreeLazyLoadWiring({
    getPreferredLanguageCode: () => 'en-US',
    listPlacementDocumentChildren,
    nextTick: async () => undefined,
    onAfterTreeRevisionPublished: vi.fn(),
    shouldDeferTreeRevisionPublish: () => false,
    suppressTreeEmit: ref(false),
    treeData
  })
  const orphanPlacement = {
    ...findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!,
    id: 'missing-placement',
    childrenLoaded: false,
    hasChildren: true
  }
  await wiring.loadChildrenForNode(orphanPlacement)
  const orphanDocument = buildDocumentNode({
    childrenLoaded: false,
    documentId: 'doc-parent',
    hasChildren: true,
    id: 'missing-document'
  })
  await wiring.loadChildrenForNode(orphanDocument)
  await wiring.loadChildrenAlongRevealPath(['missing-node'])
  expect(treeData.value).toBe(initialTree)
  expect(listPlacementDocumentChildren).toHaveBeenCalledTimes(2)
})

test('Test that wireProjectHierarchyTreeSessionLifecycle hydrates active project on mount', () => {
  const hydrateTreeSession = vi.fn(async () => undefined)
  wireProjectHierarchyTreeSessionLifecycle({
    S_FaActiveProject: () => ({
      activeProject: {
        id: 'project-a'
      },
      hasActiveProject: true
    }),
    clearPendingRevealPath: vi.fn(),
    flushUiStatePersist: vi.fn(),
    hydrateTreeSession,
    layoutRefreshGeneration: ref(0),
    shouldDeferWorldsExpandRestore: () => false,
    onMounted: (hook) => {
      hook()
    },
    onUnmounted: vi.fn(),
    openNodeIds: ref(new Set<string>()),
    pendingRevealPath: ref([]),
    resetOnProjectClose: vi.fn(),
    resyncTreeDataFromLayout: vi.fn(),
    restoreExpandedSnapshot: vi.fn(async () => undefined),
    revealPendingPath: vi.fn(async () => undefined),
    teardown: vi.fn(),
    treeData: ref([]),
    watch: vi.fn(),
    worlds: ref([])
  })
  expect(hydrateTreeSession).toHaveBeenCalled()
})

test('Test that projectHierarchyTree_manager exports useProjectHierarchyTree composable', async () => {
  const { useProjectHierarchyTree } = await import('../projectHierarchyTree_manager')
  expect(useProjectHierarchyTree).toBeTypeOf('function')
})

test('Test that createProjectHierarchyTreeSessionSubWiring reflects drag state in root class list', () => {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(sessionRefs.isTreeDragActive),
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandPostCommitGuard: sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    getPreferredLanguageCode: () => 'en-US',
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined)
    },
    isTreeDragActive: sessionRefs.isTreeDragActive,
    nextTick: async () => undefined,
    openNodeIds: sessionRefs.openNodeIds,
    pendingRevealPath: ref([]),
    ref,
    suppressTreeEmit: sessionRefs.suppressTreeEmit,
    treeComponentRef: sessionRefs.treeComponentRef,
    treeData: ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])),
    treeMountKey: sessionRefs.treeMountKey,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch,
    worlds: ref([sampleWorld])
  })
  sessionRefs.isTreeDragActive.value = true
  expect(subWiring.treeRootClassList.value).toEqual({
    'projectHierarchyTree--listDragging': true
  })
})

test('Test that restoreProjectHierarchyTreeUiState restores scrollTop on tree host', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  host.appendChild(tree)
  await restoreProjectHierarchyTreeUiState({
    getExpandedNodeIds: () => [],
    getScrollTopPx: () => 42,
    getTreeRef: () => ({
      closeAll: vi.fn(),
      openNodeAndParents: vi.fn()
    }),
    getTreeScrollHost: () => host,
    getWorlds: () => [sampleWorld],
    loadChildrenAlongRevealPath: async () => undefined,
    nextTick: async () => undefined,
    onExpandedNodeIdsChange: vi.fn(),
    openNodeIds: ref(new Set<string>()),
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData
  })
  expect(tree.scrollTop).toBe(42)
})

test('Test that createProjectHierarchyTreeSessionSubWiring restores UI state via store getters', async () => {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const pendingRevealPath = ref(['world-1', 'placement-1'])
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  host.appendChild(tree)
  const openNodeAndParents = vi.fn()
  sessionRefs.treeComponentRef.value = {
    closeAll: vi.fn(),
    openNodeAndParents
  }
  sessionRefs.treeScrollHostRef.value = host
  window.faContentBridgeAPIs = {
    projectContent: {
      listPlacementDocumentChildren: vi.fn(async () => ({
        items: []
      }))
    }
  } as never
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(sessionRefs.isTreeDragActive),
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandPostCommitGuard: sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    getPreferredLanguageCode: () => 'en-US',
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined)
    },
    isTreeDragActive: sessionRefs.isTreeDragActive,
    nextTick: async () => undefined,
    openNodeIds: sessionRefs.openNodeIds,
    pendingRevealPath,
    ref,
    suppressTreeEmit: sessionRefs.suppressTreeEmit,
    treeComponentRef: sessionRefs.treeComponentRef,
    treeData,
    treeMountKey: sessionRefs.treeMountKey,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    uiState: ref({
      expandedNodeIds: ['world-1'],
      schemaVersion: 1,
      scrollTopPx: 15
    }),
    watch,
    worlds: ref([sampleWorld])
  })
  await subWiring.uiStateWiring.restoreUiStateFromStore()
  await subWiring.uiStateWiring.revealPendingPath()
  expect(openNodeAndParents).toHaveBeenCalled()
})

test('Test that createProjectHierarchyTreeSessionWiring invokes lifecycle store callbacks', async () => {
  const { watch } = await import('vue')
  const { createProjectHierarchyTreeSessionWiring } = await import('../projectHierarchyTreeSessionWiring')
  const hierarchyStore = {
    clearPendingDocumentRefreshIds: vi.fn(),
    clearPendingHierarchyNodeRefreshIds: vi.fn(),
    clearPendingRevealPath: vi.fn(),
    flushUiStatePersist: vi.fn(),
    queuePersistExpandedNodeIds: vi.fn(),
    queuePersistScrollTopPx: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
    refreshUiState: vi.fn(async () => undefined),
    resetOnProjectClose: vi.fn()
  }
  createProjectHierarchyTreeSessionWiring({
    S_FaActiveProject: () => ({
      activeProject: null,
      hasActiveProject: false
    }),
    computed,
    createTemporaryDocument: vi.fn(async () => 'temp-doc'),
    dragContext: {
      dragNode: null
    },
    hierarchyStore,
    nextTick: async () => undefined,
    onDocumentOpenRequest: vi.fn(),
    onMounted: (hook) => hook(),
    onUnmounted: (hook) => hook(),
    pendingDocumentRefreshIds: ref([]),
    pendingHierarchyNodeRefreshIds: ref([]),
    pendingRevealPath: ref([]),
    ref,
    resolvePreferredLanguageCode: () => 'en-US',
    runFaAction: vi.fn(),
    treeData: ref([]),
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch,
    layoutRefreshGeneration: ref(0),
    worlds: ref([])
  })
  expect(hierarchyStore.resetOnProjectClose).toHaveBeenCalled()
  expect(hierarchyStore.flushUiStatePersist).toHaveBeenCalled()
})

test('Test that createProjectHierarchyTreeSessionSubWiring handles missing preload APIs', async () => {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  window.faContentBridgeAPIs = {
    projectContent: {}
  } as never
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(sessionRefs.isTreeDragActive),
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandPostCommitGuard: sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    getPreferredLanguageCode: () => 'en-US',
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined)
    },
    isTreeDragActive: sessionRefs.isTreeDragActive,
    nextTick: async () => undefined,
    openNodeIds: sessionRefs.openNodeIds,
    pendingRevealPath: ref([]),
    ref,
    suppressTreeEmit: sessionRefs.suppressTreeEmit,
    treeComponentRef: sessionRefs.treeComponentRef,
    treeData,
    treeMountKey: sessionRefs.treeMountKey,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch,
    worlds: ref([sampleWorld])
  })
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  await subWiring.lazyLoadWiring.loadChildrenForNode(placement)
  expect(placement.childrenLoaded).toBe(true)
  mergeLoadedChildrenIntoNode(treeData.value, 'placement-1', [
    buildDocumentNode({
      documentId: 'doc-missing-api',
      id: 'doc-missing-api'
    })
  ])
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  subWiring.dndWiring.onBeforeDragStart({
    data: buildDocumentNode({
      documentId: 'doc-missing-api',
      id: 'doc-missing-api'
    })
  })
  subWiring.dndWiring.onTreeAfterDrop()
  await vi.runAllTimersAsync()
  errorSpy.mockRestore()
})

test('Test that revealProjectHierarchyTreePendingPath returns early for empty path', async () => {
  const treeRef = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  await revealProjectHierarchyTreePendingPath({
    getPendingRevealPath: () => [],
    getTreeRef: () => treeRef,
    getTreeScrollHost: () => null,
    loadChildrenAlongRevealPath: async () => undefined,
    markNodeOpen: vi.fn(),
    nextTick: async () => undefined,
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData: ref([])
  })
  expect(treeRef.openNodeAndParents).not.toHaveBeenCalled()
})

test('Test that revealProjectHierarchyTreePendingPath returns when tree ref missing', async () => {
  const loadChildrenAlongRevealPath = vi.fn(async () => undefined)
  await revealProjectHierarchyTreePendingPath({
    getPendingRevealPath: () => ['world-1'],
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    loadChildrenAlongRevealPath,
    markNodeOpen: vi.fn(),
    nextTick: async () => undefined,
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData: ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  })
  expect(loadChildrenAlongRevealPath).not.toHaveBeenCalled()
})

test('Test that revealProjectHierarchyTreePendingPath skips scroll when focus row missing', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  host.appendChild(tree)
  await revealProjectHierarchyTreePendingPath({
    getPendingRevealPath: () => ['world-1', 'placement-1'],
    getTreeRef: () => ({
      closeAll: vi.fn(),
      openNodeAndParents: vi.fn()
    }),
    getTreeScrollHost: () => host,
    loadChildrenAlongRevealPath: async () => undefined,
    markNodeOpen: vi.fn(),
    nextTick: async () => undefined,
    requestAnimationFrame: (callback: () => void) => {
      callback()
      return 1
    },
    treeData
  })
})

/**
 * he-tree roving tabindex keeps one .tree-node at tabindex 0; guard forces tab order skip.
 */
test('Test that clearProjectHierarchyTreeHeTreeNodeTabIndex forces he-tree rows out of tab order', async () => {
  const { clearProjectHierarchyTreeHeTreeNodeTabIndexForTests } = await import(
    '../projectHierarchyTreeHeTreeNodeTabIndexWiring'
  )
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  const row = document.createElement('div')
  row.className = 'tree-node'
  row.tabIndex = 0
  tree.appendChild(row)
  host.appendChild(tree)

  clearProjectHierarchyTreeHeTreeNodeTabIndexForTests(host)

  expect(row.tabIndex).toBe(-1)
})

test('Test that drag model settle waits for post-drop model-value revision', () => {
  const dragCommitPending = ref(false)
  const dragCommitScheduled = ref(false)
  const dragDropCommitted = ref(false)
  const isTreeDragActive = ref(false)
  const session = createProjectHierarchyTreeDragSessionState({
    dragCommitPending,
    dragCommitScheduled,
    dragDropCommitted,
    isTreeDragActive
  })
  session.resetDragModelValueRevisionForDragStart()
  session.incrementDragModelValueRevision()
  session.captureDragModelValueRevisionAtDrop()
  expect(session.readDragModelValueSettledForCommit()).toBe(false)
  session.incrementDragModelValueRevision()
  expect(session.readDragModelValueSettledForCommit()).toBe(true)
})

test('Test that readProjectHierarchyTreeHeTreeLiveData reads getData from he-tree ref', async () => {
  const { readProjectHierarchyTreeHeTreeLiveData } = await import('../projectHierarchyTreeHeTreeLiveDataWiring')
  const liveTree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(readProjectHierarchyTreeHeTreeLiveData(null)).toBeNull()
  expect(readProjectHierarchyTreeHeTreeLiveData({
    closeAll: () => undefined,
    openNodeAndParents: () => undefined
  })).toBeNull()
  expect(readProjectHierarchyTreeHeTreeLiveData({
    closeAll: () => undefined,
    getData: () => liveTree,
    openNodeAndParents: () => undefined
  })).toEqual(liveTree)
})

test('Test that readProjectHierarchyTreeDragSiblingOrderFromDom reads sibling order from he-tree rows', async () => {
  const { readProjectHierarchyTreeDragSiblingOrderFromDom } = await import(
    '../projectHierarchyTreeDragSiblingDomOrderWiring'
  )
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const placement = treeData[0]?.children[0]
  expect(placement).toBeDefined()
  const docA = buildDocumentNode({
    documentId: 'doc-a',
    id: 'doc-a',
    label: 'Doc A'
  })
  const docB = buildDocumentNode({
    documentId: 'doc-b',
    id: 'doc-b',
    label: 'Doc B'
  })
  const docC = buildDocumentNode({
    documentId: 'doc-c',
    id: 'doc-c',
    label: 'Doc C'
  })
  if (placement !== undefined) {
    placement.children = [docA, docB, docC]
    placement.childrenLoaded = true
  }
  const host = document.createElement('div')
  host.setAttribute('data-test-locator', 'projectHierarchyTree-host')
  const treeRoot = document.createElement('div')
  treeRoot.className = 'projectHierarchyTree'
  const appendDocumentRow = (documentId: string, label: string): void => {
    const treeNode = document.createElement('div')
    treeNode.className = 'tree-node'
    const row = document.createElement('div')
    row.className = 'projectHierarchyTree__nodeRow projectHierarchyTree__nodeRow--document'
    const nodeRoot = document.createElement('div')
    nodeRoot.setAttribute('data-test-hierarchy-node-id', documentId)
    const labelElement = document.createElement('span')
    labelElement.textContent = label
    nodeRoot.appendChild(labelElement)
    row.appendChild(nodeRoot)
    treeNode.appendChild(row)
    treeRoot.appendChild(treeNode)
  }
  appendDocumentRow('doc-c', 'Doc C')
  appendDocumentRow('doc-a', 'Doc A')
  appendDocumentRow('doc-b', 'Doc B')
  host.appendChild(treeRoot)
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => host,
    movedDocumentId: 'doc-a',
    treeData
  })).toEqual(['doc-c', 'doc-a', 'doc-b'])
})

test('Test that createProjectHierarchyTreeSessionEarlyWiring arms document row drag hold timers', async () => {
  vi.useFakeTimers()
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const host = document.createElement('div')
  sessionRefs.treeScrollHostRef.value = host
  const row = document.createElement('div')
  host.appendChild(row)
  const earlyWiring = createProjectHierarchyTreeSessionEarlyWiring({
    getPreferredLanguageCode: () => 'en-US',
    computed,
    dragContext: {
      dragNode: {
        data: buildDocumentNode()
      }
    },
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined)
    },
    nextTick: async () => undefined,
    onUnmounted: vi.fn(),
    pendingRevealPath: ref([]),
    ref,
    treeData,
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch,
    worlds: ref([sampleWorld])
  })
  const commitSpy = vi.spyOn(
    earlyWiring.subWiring.dndWiring,
    'commitAllowedDocumentRowDragSessionStart'
  )
  earlyWiring.documentRowDragHoldWiring.handleDocumentRowPointerDown({
    button: 0,
    currentTarget: row
  } as unknown as PointerEvent)
  vi.advanceTimersByTime(PROJECT_HIERARCHY_TREE_DOCUMENT_ROW_DRAG_HOLD_DELAY_MS)
  earlyWiring.documentRowDragHoldWiring.handleTreeDragStartCapture({} as DragEvent)
  await Promise.resolve()
  expect(commitSpy).toHaveBeenCalledOnce()
  earlyWiring.documentRowDragHoldWiring.handleDocumentRowPointerDown({
    button: 0,
    currentTarget: row
  } as unknown as PointerEvent)
  earlyWiring.documentRowDragHoldWiring.clearHoldSession()
  vi.useRealTimers()
})

test('Test that createProjectHierarchyTreeDnDHandlers commitAllowedDocumentRowDragSessionStart runs before drag start', () => {
  const dragCommitPending = ref(false)
  const dragDropCommitted = ref(false)
  const dragExpandPostCommitGuard = ref(false)
  const dragExpandUiFrozen = ref(false)
  const isTreeDragActive = ref(false)
  const suppressTreeEmit = ref(false)
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const draggedDocumentId = {
    current: null as string | null
  }
  const dragExpandedSnapshot = {
    current: null as string[] | null
  }
  const dragCancelWiring = createProjectHierarchyTreeDragCancelWiring(buildProjectHierarchyTreeDragCancelTestDeps({
    dragCommitPending,
    dragDropCommitted,
    dragExpandPostCommitGuard,
    dragExpandUiFrozen
  }))
  const handlers = createProjectHierarchyTreeDnDHandlers({
    clearDragSessionFlags: vi.fn(),
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(isTreeDragActive),
    dragCancelWiring,
    dragCommitPending,
    dragCommitScheduled: ref(false),
    dragDropCommitted,
    dragExpandPostCommitGuard,
    dragExpandUiFrozen,
    draggedDocumentId: {
      get: () => draggedDocumentId.current,
      set: (value) => {
        draggedDocumentId.current = value
      }
    },
    dragExpandedSnapshot: {
      get: () => dragExpandedSnapshot.current,
      set: (value) => {
        dragExpandedSnapshot.current = value
      }
    },
    dragSiblingOrderSnapshot: {
      get: () => null,
      set: () => undefined
    },
    captureDragModelValueRevisionAtDrop: vi.fn(),
    captureDragParentDocumentIdAtDragStart: vi.fn(),
    captureDragSiblingOrderAtDragStart: vi.fn(),
    incrementDragModelValueRevision: vi.fn(),
    readDragParentDocumentIdAtDragStart: () => null,
    readDragSiblingOrderAtDragStart: () => null,
    readDragModelValueSettledForCommit: () => true,
    resetDragModelValueRevisionForDragStart: vi.fn(),
    flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
    flushUiStatePersist: vi.fn(),
    isTreeDragActive,
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    loadChildrenForNode: vi.fn(async () => undefined),
    markNodeClosed: vi.fn(),
    markNodeOpen: vi.fn(),
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => undefined),
    nextTick: async () => undefined,
    reapplyHeTreeOpenState: vi.fn(),
    reapplyLatentDescendantExpandState: vi.fn(async () => undefined),
    openNodeIds: ref(new Set(['world-1'])),
    queuePersistExpandedNodeIds: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
    refreshNodeChildrenFromDatabase: vi.fn(async () => undefined),
    removeDragCancelListeners: vi.fn(),
    resyncTreeDataFromLayout: vi.fn(),
    restoreExpandedSnapshot: vi.fn(async () => undefined),
    suppressTreeEmit,
    treeData
  })
  handlers.commitAllowedDocumentRowDragSessionStart({
    dragNode: {
      data: buildDocumentNode()
    }
  })
  expect(draggedDocumentId.current).toBe('doc-a')
  expect(handlers.getDragExpandedSnapshotNodeIds()).toEqual(['world-1'])
})

test('Test that createProjectHierarchyTreeSessionSubWiring restoreUiStateFromStore applies persisted scrollTop', async () => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(performance.now())
    return 1
  })
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  host.appendChild(tree)
  sessionRefs.treeComponentRef.value = {
    closeAll: vi.fn(),
    openNodeAndParents: vi.fn()
  }
  sessionRefs.treeScrollHostRef.value = host
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(sessionRefs.isTreeDragActive),
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandPostCommitGuard: sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    getPreferredLanguageCode: () => 'en-US',
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined)
    },
    isTreeDragActive: sessionRefs.isTreeDragActive,
    nextTick: async () => undefined,
    openNodeIds: sessionRefs.openNodeIds,
    pendingRevealPath: ref([]),
    ref,
    suppressTreeEmit: sessionRefs.suppressTreeEmit,
    treeComponentRef: sessionRefs.treeComponentRef,
    treeData,
    treeMountKey: sessionRefs.treeMountKey,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 88
    }),
    watch,
    worlds: ref([sampleWorld])
  })
  await subWiring.uiStateWiring.restoreUiStateFromStore()
  expect(tree.scrollTop).toBe(88)
  vi.unstubAllGlobals()
})

test('Test that createProjectHierarchyTreeSessionSubWiring restoreExpandedSnapshot flushes deferred tree revision publish', async () => {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const publishSpy = vi.spyOn(
    projectHierarchyTreeExpandState,
    'publishProjectHierarchyTreeRootRevision'
  )
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(sessionRefs.isTreeDragActive),
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandPostCommitGuard: sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    getPreferredLanguageCode: () => 'en-US',
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined)
    },
    isTreeDragActive: sessionRefs.isTreeDragActive,
    nextTick: async () => undefined,
    openNodeIds: sessionRefs.openNodeIds,
    pendingRevealPath: ref([]),
    ref,
    suppressTreeEmit: sessionRefs.suppressTreeEmit,
    treeComponentRef: sessionRefs.treeComponentRef,
    treeData,
    treeMountKey: sessionRefs.treeMountKey,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    uiState: ref({
      expandedNodeIds: ['world-1'],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch,
    worlds: ref([sampleWorld])
  })
  sessionRefs.dragExpandUiFrozen.value = true
  await subWiring.lazyLoadWiring.loadChildrenForNode(
    findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  )
  sessionRefs.dragExpandUiFrozen.value = false
  await subWiring.uiStateWiring.restoreExpandedSnapshot(['world-1'])
  expect(publishSpy).toHaveBeenCalled()
  publishSpy.mockRestore()
})

test('Test that createProjectHierarchyTreeSessionSubWiring refreshNodeChildrenFromDatabase reloads node children', async () => {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const listPlacementDocumentChildren = vi.fn(async () => ({
    items: [{
      displayName: 'Reloaded doc',
      hasChildren: false,
      id: 'doc-reload',
      parentDocumentId: null,
      placementId: 'placement-1',
      sortOrder: 0
    }]
  }))
  window.faContentBridgeAPIs = {
    projectContent: {
      listPlacementDocumentChildren
    }
  } as never
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(sessionRefs.isTreeDragActive),
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandPostCommitGuard: sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    getPreferredLanguageCode: () => 'en-US',
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined)
    },
    isTreeDragActive: sessionRefs.isTreeDragActive,
    nextTick: async () => undefined,
    openNodeIds: sessionRefs.openNodeIds,
    pendingRevealPath: ref([]),
    ref,
    suppressTreeEmit: sessionRefs.suppressTreeEmit,
    treeComponentRef: sessionRefs.treeComponentRef,
    treeData,
    treeMountKey: sessionRefs.treeMountKey,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch,
    worlds: ref([sampleWorld])
  })
  await subWiring.lazyLoadWiring.refreshNodeChildrenFromDatabase('placement-1')
  expect(listPlacementDocumentChildren).toHaveBeenCalledWith({
    placementId: 'placement-1'
  })
})

test('Test that bindProjectHierarchyTreeHeTreeNodeTabIndexGuard syncs tabindex on host mutations', async () => {
  const treeScrollHostRef = ref<HTMLElement | null>(null)
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  const row = document.createElement('div')
  row.className = 'tree-node'
  row.tabIndex = 0
  tree.appendChild(row)
  host.appendChild(tree)
  treeScrollHostRef.value = host
  const unmountHooks: Array<() => void> = []
  bindProjectHierarchyTreeHeTreeNodeTabIndexGuard({
    onUnmounted: (hook) => {
      unmountHooks.push(hook)
    },
    treeScrollHostRef,
    watch
  })
  await Promise.resolve()
  expect(row.tabIndex).toBe(-1)
  row.tabIndex = 0
  tree.appendChild(document.createElement('div'))
  await Promise.resolve()
  expect(row.tabIndex).toBe(-1)
  for (const hook of unmountHooks) {
    hook()
  }
})

test('Test that bindProjectHierarchyTreeSessionPendingRefresh delegates store clear callbacks', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const pendingDocumentRefreshIds = ref<string[]>([])
  const pendingHierarchyNodeRefreshIds = ref<string[]>([])
  const clearPendingDocumentRefreshIds = vi.fn(() => {
    pendingDocumentRefreshIds.value = []
  })
  const clearPendingHierarchyNodeRefreshIds = vi.fn(() => {
    pendingHierarchyNodeRefreshIds.value = []
  })
  bindProjectHierarchyTreeSessionPendingRefresh({
    hierarchyStore: {
      clearPendingDocumentRefreshIds,
      clearPendingHierarchyNodeRefreshIds
    },
    pendingDocumentRefreshIds,
    pendingHierarchyNodeRefreshIds,
    refreshNodeChildrenFromDatabase: vi.fn(async () => undefined),
    treeData,
    watch
  })
  pendingDocumentRefreshIds.value = ['doc-a']
  pendingHierarchyNodeRefreshIds.value = ['placement-1']
  await Promise.resolve()
  await Promise.resolve()
  expect(clearPendingDocumentRefreshIds).toHaveBeenCalledOnce()
  expect(clearPendingHierarchyNodeRefreshIds).toHaveBeenCalledOnce()
})

test('Test that bindProjectHierarchyTreeSessionLifecycle evaluates worlds expand defer during drag', async () => {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const earlyWiring = createProjectHierarchyTreeSessionEarlyWiring({
    getPreferredLanguageCode: () => 'en-US',
    computed,
    dragContext: {
      dragNode: null
    },
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined)
    },
    nextTick: async () => undefined,
    onUnmounted: vi.fn(),
    pendingRevealPath: ref([]),
    ref,
    treeData,
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch,
    worlds: ref([sampleWorld])
  })
  sessionRefs.dragCommitPending.value = true
  const mountedHooks: Array<() => void> = []
  const worlds = ref([sampleWorld])
  bindProjectHierarchyTreeSessionLifecycle({
    S_FaActiveProject: () => ({
      activeProject: { id: 'project-1' },
      hasActiveProject: true
    }),
    clearPendingRevealPath: vi.fn(),
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragExpandPostCommitGuard: sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    flushUiStatePersist: vi.fn(),
    getDragExpandedSnapshotNodeIds: earlyWiring.subWiring.dndWiring.getDragExpandedSnapshotNodeIds,
    hydrateTreeSession: vi.fn(async () => undefined),
    layoutRefreshGeneration: ref(0),
    onMounted: (hook) => {
      mountedHooks.push(hook)
    },
    onUnmounted: vi.fn(),
    openNodeIds: sessionRefs.openNodeIds,
    pendingRevealPath: ref([]),
    resetOnProjectClose: vi.fn(),
    resyncTreeDataFromLayout: vi.fn(),
    restoreExpandedSnapshot: vi.fn(async () => undefined),
    revealPendingPath: vi.fn(async () => undefined),
    teardown: vi.fn(),
    treeData: ref([]),
    watch,
    worlds
  })
  mountedHooks[0]?.()
  worlds.value = [...worlds.value]
  await Promise.resolve()
})

test('Test that createProjectHierarchyTreeDnDHandlers ignores null drag nodes and unarmed holds', () => {
  const draggedDocumentId = {
    current: 'doc-a' as string | null
  }
  const handlers = createProjectHierarchyTreeDnDHandlers({
    clearDragSessionFlags: vi.fn(),
    documentRowDragHoldWiring: {
      clearHoldSession: vi.fn(),
      getIsDragHoldArmed: () => false,
      handleDocumentRowPointerDown: vi.fn(),
      handleTreeDragStartCapture: vi.fn(),
      markDragStartedFromHold: vi.fn()
    },
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(ref(false)),
    dragCancelWiring: createProjectHierarchyTreeDragCancelWiring(buildProjectHierarchyTreeDragCancelTestDeps()),
    dragCommitPending: ref(false),
    dragCommitScheduled: ref(false),
    dragDropCommitted: ref(false),
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    draggedDocumentId: {
      get: () => draggedDocumentId.current,
      set: (value) => {
        draggedDocumentId.current = value
      }
    },
    dragExpandedSnapshot: {
      get: () => null,
      set: () => undefined
    },
    dragSiblingOrderSnapshot: {
      get: () => null,
      set: () => undefined
    },
    captureDragModelValueRevisionAtDrop: vi.fn(),
    captureDragParentDocumentIdAtDragStart: vi.fn(),
    captureDragSiblingOrderAtDragStart: vi.fn(),
    incrementDragModelValueRevision: vi.fn(),
    readDragParentDocumentIdAtDragStart: () => null,
    readDragSiblingOrderAtDragStart: () => null,
    readDragModelValueSettledForCommit: () => true,
    resetDragModelValueRevisionForDragStart: vi.fn(),
    flushDeferredTreeRevisionPublish: vi.fn(async () => undefined),
    flushUiStatePersist: vi.fn(),
    isTreeDragActive: ref(false),
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    loadChildrenForNode: vi.fn(async () => undefined),
    markNodeClosed: vi.fn(),
    markNodeOpen: vi.fn(),
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => undefined),
    nextTick: async () => undefined,
    reapplyHeTreeOpenState: vi.fn(),
    reapplyLatentDescendantExpandState: vi.fn(async () => undefined),
    openNodeIds: ref(new Set()),
    queuePersistExpandedNodeIds: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
    refreshNodeChildrenFromDatabase: vi.fn(async () => undefined),
    removeDragCancelListeners: vi.fn(),
    resyncTreeDataFromLayout: vi.fn(),
    restoreExpandedSnapshot: vi.fn(async () => undefined),
    suppressTreeEmit: ref(false),
    treeData: ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  })
  handlers.commitAllowedDocumentRowDragSessionStart({
    dragNode: null
  })
  handlers.onBeforeDragStart({
    data: buildDocumentNode()
  })
  expect(draggedDocumentId.current).toBe('doc-a')
})

test('Test that applyProjectHierarchyTreeHeTreeModelValueUpdate rejects escaped document rows', async () => {
  const { applyProjectHierarchyTreeHeTreeModelValueUpdate } = await import('../projectHierarchyTreeDnDModelValueUpdateWiring')
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const escapedTree = [{
    ...treeData.value[0]!,
    children: [buildDocumentNode({
      documentId: 'doc-escaped',
      id: 'doc-escaped'
    })]
  }]
  applyProjectHierarchyTreeHeTreeModelValueUpdate({
    dragCommitPending: ref(false),
    dragDropCommitted: ref(false),
    draggedDocumentId: {
      get: () => 'doc-escaped'
    },
    dragSiblingOrderSnapshot: {
      get: () => null,
      set: vi.fn()
    },
    incrementDragModelValueRevision: vi.fn(),
    isTreeDragActive: ref(true),
    suppressTreeEmit: ref(false),
    treeData
  }, escapedTree)
  expect(treeData.value).not.toEqual(escapedTree)
})

test('Test that readProjectHierarchyTreeHeTreeLiveData rejects non-array getData results', async () => {
  const { readProjectHierarchyTreeHeTreeLiveData } = await import('../projectHierarchyTreeHeTreeLiveDataWiring')
  expect(readProjectHierarchyTreeHeTreeLiveData({
    closeAll: () => undefined,
    getData: () => ({ not: 'array' } as unknown as I_faProjectHierarchyTreeHeTreeNode[]),
    openNodeAndParents: () => undefined
  })).toBeNull()
})

test('Test that tryOpenHeTreeNodeAndParents handles StatNotFoundError and rethrows others', async () => {
  const { isHeTreeStatNotFoundError, tryOpenHeTreeNodeAndParents } = await import('../projectHierarchyTreeHeTreeOpenSafeWiring')
  const statOpen = {
    open: true
  }
  expect(isHeTreeStatNotFoundError(new Error('missing'))).toBe(false)
  const statNotFound = new Error('missing stat')
  statNotFound.name = 'StatNotFoundError'
  expect(isHeTreeStatNotFoundError(statNotFound)).toBe(true)
  expect(tryOpenHeTreeNodeAndParents({
    node: buildDocumentNode(),
    statOpen,
    treeRef: {
      closeAll: () => undefined,
      openNodeAndParents: () => {
        throw statNotFound
      }
    }
  })).toBe(false)
  expect(statOpen.open).toBe(false)
  expect(() => tryOpenHeTreeNodeAndParents({
    node: buildDocumentNode(),
    treeRef: {
      closeAll: () => undefined,
      openNodeAndParents: () => {
        throw new Error('boom')
      }
    }
  })).toThrow('boom')
})

test('Test that handleProjectHierarchyTreeOpenIconClick closes rows without open icons', async () => {
  const { handleProjectHierarchyTreeOpenIconClick } = await import('../projectHierarchyTreeHeTreeOpenSafeWiring')
  const onNodeClose = vi.fn()
  const node = buildDocumentNode({
    childrenLoaded: true,
    documentId: 'doc-leaf',
    hasChildren: false,
    id: 'doc-leaf'
  })
  const stat = {
    children: [],
    open: true
  }
  await handleProjectHierarchyTreeOpenIconClick({
    getOpenIconPointerWasOpen: () => null,
    node,
    onNodeClose,
    onNodeOpen: vi.fn(async () => undefined),
    setOpenIconPointerWasOpen: vi.fn(),
    stat
  })
  expect(onNodeClose).toHaveBeenCalledWith({ data: node })
  expect(stat.open).toBe(false)
})

test('Test that collectProjectHierarchyTreeLiveExpandStateFromDom reads collapsed and expanded rows', async () => {
  const {
    collectProjectHierarchyTreeLiveExpandStateFromDom,
    resolveProjectHierarchyTreeScrollHostForDomRead
  } = await import('../projectHierarchyTreeLiveExpandDomWiring')
  expect(collectProjectHierarchyTreeLiveExpandStateFromDom(null)).toEqual({
    collapsedVisibleNodeIds: [],
    expandedNodeIds: [],
    rowCount: 0,
    scrollHostPresent: false
  })
  const host = document.createElement('div')
  host.setAttribute('data-test-locator', 'projectHierarchyTree-host')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  const appendRow = (nodeId: string, expanded: boolean): void => {
    const row = document.createElement('div')
    row.className = 'projectHierarchyTree__nodeRow'
    const nodeRoot = document.createElement('div')
    nodeRoot.setAttribute('data-test-hierarchy-node-id', nodeId)
    row.appendChild(nodeRoot)
    const icon = document.createElement('span')
    icon.setAttribute('data-test-locator', 'projectHierarchyTree-openIcon')
    if (expanded) {
      icon.classList.add('projectHierarchyTree__openIcon--open')
    }
    row.appendChild(icon)
    tree.appendChild(row)
  }
  appendRow('world-1', true)
  appendRow('group-1', false)
  const orphanRow = document.createElement('div')
  orphanRow.className = 'projectHierarchyTree__nodeRow'
  tree.appendChild(orphanRow)
  host.appendChild(tree)
  document.body.appendChild(host)
  expect(resolveProjectHierarchyTreeScrollHostForDomRead(null)).toBe(host)
  const state = collectProjectHierarchyTreeLiveExpandStateFromDom(host)
  expect(state.expandedNodeIds).toEqual(['world-1'])
  expect(state.collapsedVisibleNodeIds).toEqual(['group-1'])
  expect(state.rowCount).toBe(3)
  host.remove()
})

test('Test that runProjectHierarchyTreePostDragExpandCloseGuard suppresses ancestor snapshot closes', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const treeData = ref(tree)
  const markNodeClosed = vi.fn()
  const world = tree[0]!
  runProjectHierarchyTreePostDragExpandCloseGuard({
    dragExpandPostCommitGuard: () => false,
    getDragExpandedSnapshotNodeIds: () => ['placement-1'],
    markNodeClosed,
    node: world,
    nodeId: 'world-1',
    treeData
  })
  expect(markNodeClosed).not.toHaveBeenCalled()
})

test('Test that createProjectHierarchyTreeSessionDnDSubWiring throws when reindex API missing', async () => {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  window.faContentBridgeAPIs = {
    projectContent: {
      listPlacementDocumentChildren: vi.fn(async () => ({
        items: [{
          displayName: 'Doc api missing',
          hasChildren: false,
          id: 'doc-api-missing',
          parentDocumentId: null,
          placementId: 'placement-1',
          sortOrder: 0
        }, {
          displayName: 'Doc api missing 2',
          hasChildren: false,
          id: 'doc-api-missing-2',
          parentDocumentId: null,
          placementId: 'placement-1',
          sortOrder: 1
        }]
      }))
    }
  } as never
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(sessionRefs.isTreeDragActive),
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandPostCommitGuard: sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    getPreferredLanguageCode: () => 'en-US',
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined)
    },
    isTreeDragActive: sessionRefs.isTreeDragActive,
    nextTick: async () => undefined,
    openNodeIds: sessionRefs.openNodeIds,
    pendingRevealPath: ref([]),
    ref,
    suppressTreeEmit: sessionRefs.suppressTreeEmit,
    treeComponentRef: sessionRefs.treeComponentRef,
    treeData,
    treeMountKey: sessionRefs.treeMountKey,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch,
    worlds: ref([sampleWorld])
  })
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  await subWiring.lazyLoadWiring.loadChildrenForNode(placement)
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  subWiring.dndWiring.onBeforeDragStart({
    data: buildDocumentNode({
      documentId: 'doc-api-missing',
      id: 'doc-api-missing'
    })
  })
  const loadedPlacement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  loadedPlacement.children.reverse()
  subWiring.dndWiring.onTreeAfterDrop()
  await vi.runAllTimersAsync()
  expect(errorSpy).toHaveBeenCalled()
  errorSpy.mockRestore()
})

test('Test that bindProjectHierarchyTreeHeTreeNodeTabIndexGuard blurs focused tree nodes', async () => {
  const treeScrollHostRef = ref<HTMLElement | null>(null)
  const unmountHooks: Array<() => void> = []
  bindProjectHierarchyTreeHeTreeNodeTabIndexGuard({
    onUnmounted: (hook) => {
      unmountHooks.push(hook)
    },
    treeScrollHostRef,
    watch
  })
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  const row = document.createElement('div')
  row.className = 'tree-node'
  row.tabIndex = 0
  tree.appendChild(row)
  host.appendChild(tree)
  treeScrollHostRef.value = host
  await Promise.resolve()
  row.tabIndex = 0
  tree.appendChild(document.createElement('div'))
  await Promise.resolve()
  expect(row.tabIndex).toBe(-1)
  for (const hook of unmountHooks) {
    hook()
  }
})

test('Test that createProjectHierarchyTreeExpandRowClickRouting ignores world open icon handlers', async () => {
  const { createProjectHierarchyTreeExpandRowClickRouting } = await import('../projectHierarchyTreeExpandRowClickRoutingWiring')
  const onNodeOpenIconClick = vi.fn(async () => undefined)
  const onNodeOpenIconPointerDown = vi.fn()
  const routing = createProjectHierarchyTreeExpandRowClickRouting({
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(ref(false)),
    onNodeOpenIconClick,
    onNodeOpenIconPointerDown
  })
  const worldNode = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])[0]!
  const stat = {
    children: [{}],
    open: false
  }
  await routing.onNonWorldOpenIconClick(worldNode, stat)
  routing.onNonWorldOpenIconPointerDown(worldNode, stat)
  expect(onNodeOpenIconClick).not.toHaveBeenCalled()
  expect(onNodeOpenIconPointerDown).not.toHaveBeenCalled()
})

test('Test that cloneProjectHierarchyTreeLoadedNodeForPublish shallow-clones unloaded child rows', async () => {
  const { cloneProjectHierarchyTreeLoadedNodeForPublish } = await import('../../functions/projectHierarchyTreeCloneLoadedNodeForPublish')
  const parent = buildDocumentNode({
    children: [buildDocumentNode({
      childrenLoaded: false,
      documentId: 'doc-child',
      id: 'doc-child'
    })],
    childrenLoaded: true,
    documentId: 'doc-parent',
    hasChildren: true,
    id: 'doc-parent'
  })
  const cloned = cloneProjectHierarchyTreeLoadedNodeForPublish(parent)
  expect(cloned.children[0]).not.toBe(parent.children[0])
  expect(cloned.children[0]?.children).toEqual([])
})

test('Test that createProjectHierarchyTreeExpandRowClickRouting routes group and placement row clicks', async () => {
  const { createProjectHierarchyTreeExpandRowClickRouting } = await import('../projectHierarchyTreeExpandRowClickRoutingWiring')
  const onNodeOpenIconClick = vi.fn(async () => undefined)
  const routing = createProjectHierarchyTreeExpandRowClickRouting({
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(ref(false)),
    onNodeOpenIconClick,
    onNodeOpenIconPointerDown: vi.fn()
  })
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const groupNode = tree[0]!.children[0]!
  const placementNode = groupNode.children[0]!
  const stat = {
    children: [{}],
    open: false
  }
  const stopPropagation = vi.fn()
  await routing.onWorldNodeRowClick(groupNode, stat, {
    clientX: 10,
    clientY: 10,
    stopPropagation
  } as unknown as MouseEvent)
  expect(onNodeOpenIconClick).toHaveBeenCalledWith(groupNode, stat)
  onNodeOpenIconClick.mockClear()
  routing.onWorldNodeRowPointerDown(placementNode, stat, {
    stopPropagation
  } as unknown as PointerEvent)
  expect(stopPropagation).toHaveBeenCalled()
})

test('Test that createProjectHierarchyTreeExpandRowClickRouting skips leaf document row clicks', async () => {
  const { createProjectHierarchyTreeExpandRowClickRouting } = await import('../projectHierarchyTreeExpandRowClickRoutingWiring')
  const onNodeOpenIconClick = vi.fn(async () => undefined)
  const routing = createProjectHierarchyTreeExpandRowClickRouting({
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(ref(false)),
    onNodeOpenIconClick,
    onNodeOpenIconPointerDown: vi.fn()
  })
  const leafDocument = buildDocumentNode({
    childrenLoaded: true,
    documentId: 'doc-leaf',
    hasChildren: false,
    id: 'doc-leaf'
  })
  const stat = {
    children: [],
    open: false
  }
  await routing.onWorldNodeRowClick(leafDocument, stat, {
    clientX: 10,
    clientY: 10,
    stopPropagation: vi.fn()
  } as unknown as MouseEvent)
  expect(onNodeOpenIconClick).not.toHaveBeenCalled()
})

test('Test that clearProjectHierarchyTreeHeTreeNodeTabIndex no-ops without host or tree root', async () => {
  const { clearProjectHierarchyTreeHeTreeNodeTabIndexForTests } = await import('../projectHierarchyTreeHeTreeNodeTabIndexWiring')
  clearProjectHierarchyTreeHeTreeNodeTabIndexForTests(null)
  const host = document.createElement('div')
  clearProjectHierarchyTreeHeTreeNodeTabIndexForTests(host)
})

test('Test that bindProjectHierarchyTreeHeTreeNodeTabIndexGuard blurs focused tree nodes', async () => {
  const { clearProjectHierarchyTreeHeTreeNodeTabIndexForTests } = await import('../projectHierarchyTreeHeTreeNodeTabIndexWiring')
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  const row = document.createElement('div')
  row.className = 'tree-node'
  row.tabIndex = 0
  tree.appendChild(row)
  host.appendChild(tree)
  row.focus()
  clearProjectHierarchyTreeHeTreeNodeTabIndexForTests(host)
  expect(row.tabIndex).toBe(-1)
})

test('Test that runProjectHierarchyTreePostDragExpandCloseGuard suppresses snapshot node closes', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const treeData = ref(tree)
  const markNodeClosed = vi.fn()
  const placement = findProjectHierarchyTreeNodeById(tree, 'placement-1')!
  runProjectHierarchyTreePostDragExpandCloseGuard({
    dragExpandPostCommitGuard: () => false,
    getDragExpandedSnapshotNodeIds: () => ['placement-1'],
    markNodeClosed,
    node: placement,
    nodeId: 'placement-1',
    treeData
  })
  expect(markNodeClosed).not.toHaveBeenCalled()
})

test('Test that collectProjectHierarchyTreeLiveExpandedNodeIdsFromDom delegates to expand state reader', async () => {
  const { collectProjectHierarchyTreeLiveExpandedNodeIdsFromDom, collectProjectHierarchyTreeLiveExpandStateFromDom } = await import('../projectHierarchyTreeLiveExpandDomWiring')
  expect(collectProjectHierarchyTreeLiveExpandedNodeIdsFromDom(null)).toEqual([])
  const host = document.createElement('div')
  host.setAttribute('data-test-locator', 'projectHierarchyTree-host')
  const treeRoot = document.createElement('div')
  treeRoot.className = 'projectHierarchyTree'
  const rowWithoutIcon = document.createElement('div')
  rowWithoutIcon.className = 'projectHierarchyTree__nodeRow'
  const nodeRoot = document.createElement('div')
  nodeRoot.setAttribute('data-test-hierarchy-node-id', 'row-no-icon')
  rowWithoutIcon.appendChild(nodeRoot)
  treeRoot.appendChild(rowWithoutIcon)
  host.appendChild(treeRoot)
  expect(collectProjectHierarchyTreeLiveExpandStateFromDom(host)).toEqual({
    collapsedVisibleNodeIds: [],
    expandedNodeIds: [],
    rowCount: 1,
    scrollHostPresent: true
  })
})

test('Test that runProjectHierarchyTreePostDragExpandCloseGuard closes nodes outside drag snapshot', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const treeData = ref(tree)
  const markNodeClosed = vi.fn()
  const group = tree[0]!.children[0]!
  runProjectHierarchyTreePostDragExpandCloseGuard({
    dragExpandPostCommitGuard: () => false,
    getDragExpandedSnapshotNodeIds: () => null,
    markNodeClosed,
    node: group,
    nodeId: 'group-1',
    treeData
  })
  expect(markNodeClosed).toHaveBeenCalledWith('group-1', group)
})

test('Test that runProjectHierarchyTreePostDragExpandCloseGuard closes nodes when drag snapshot is empty', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const treeData = ref(tree)
  const markNodeClosed = vi.fn()
  const group = tree[0]!.children[0]!
  runProjectHierarchyTreePostDragExpandCloseGuard({
    dragExpandPostCommitGuard: () => false,
    getDragExpandedSnapshotNodeIds: () => [],
    markNodeClosed,
    node: group,
    nodeId: 'group-1',
    treeData
  })
  expect(markNodeClosed).toHaveBeenCalledWith('group-1', group)
})

test('Test that createProjectHierarchyTreeExpandRowClickRouting forwards drag hold for draggable document rows', async () => {
  const { createProjectHierarchyTreeExpandRowClickRouting } = await import('../projectHierarchyTreeExpandRowClickRoutingWiring')
  const dragHoldWiring = createTestDocumentRowDragHoldWiring()
  const handleDocumentRowPointerDown = vi.spyOn(dragHoldWiring, 'handleDocumentRowPointerDown')
  const routing = createProjectHierarchyTreeExpandRowClickRouting({
    documentRowDragHoldWiring: dragHoldWiring,
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(ref(false)),
    onNodeOpenIconClick: vi.fn(async () => undefined),
    onNodeOpenIconPointerDown: vi.fn()
  })
  const draggableDocument = buildDocumentNode({
    childrenLoaded: true,
    documentId: 'doc-drag',
    hasChildren: false,
    id: 'doc-drag'
  })
  const stat = {
    children: [],
    open: false
  }
  routing.onWorldNodeRowPointerDown(draggableDocument, stat, {
    stopPropagation: vi.fn()
  } as unknown as PointerEvent)
  expect(handleDocumentRowPointerDown).toHaveBeenCalled()
})

test('Test that createProjectHierarchyTreeExpandRowClickRouting toggles expandable document rows on matching click', async () => {
  const { createProjectHierarchyTreeExpandRowClickRouting } = await import('../projectHierarchyTreeExpandRowClickRoutingWiring')
  const onNodeOpenIconClick = vi.fn(async () => undefined)
  const gesture = createProjectHierarchyTreeDocumentRowExpandClickGestureWiring({
    isTreeDragActive: ref(false)
  })
  const routing = createProjectHierarchyTreeExpandRowClickRouting({
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: gesture,
    onNodeOpenIconClick,
    onNodeOpenIconPointerDown: vi.fn()
  })
  const expandableDocument = buildDocumentNode({
    childrenLoaded: true,
    documentId: 'doc-expand-toggle',
    hasChildren: true,
    id: 'doc-expand-toggle'
  })
  const stat = {
    children: [{}],
    open: false
  }
  const stopPropagation = vi.fn()
  routing.onWorldNodeRowPointerDown(expandableDocument, stat, {
    clientX: 10,
    clientY: 10,
    stopPropagation
  } as unknown as PointerEvent)
  await routing.onWorldNodeRowClick(expandableDocument, stat, {
    clientX: 10,
    clientY: 10,
    stopPropagation
  } as unknown as MouseEvent)
  expect(onNodeOpenIconClick).toHaveBeenCalledWith(expandableDocument, stat)
  expect(stopPropagation).toHaveBeenCalled()
})

test('Test that runProjectHierarchyTreePostDragExpandCloseGuard ignores unknown snapshot node ids', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const treeData = ref(tree)
  const markNodeClosed = vi.fn()
  const group = tree[0]!.children[0]!
  runProjectHierarchyTreePostDragExpandCloseGuard({
    dragExpandPostCommitGuard: () => false,
    getDragExpandedSnapshotNodeIds: () => ['missing-node-id'],
    markNodeClosed,
    node: group,
    nodeId: 'group-1',
    treeData
  })
  expect(markNodeClosed).toHaveBeenCalledWith('group-1', group)
})

test('Test that createProjectHierarchyTreeExpandRowClickRouting ignores unknown node kinds and world open-icon handlers', async () => {
  const { createProjectHierarchyTreeExpandRowClickRouting } = await import('../projectHierarchyTreeExpandRowClickRoutingWiring')
  const onNodeOpenIconClick = vi.fn(async () => undefined)
  const onNodeOpenIconPointerDown = vi.fn()
  const routing = createProjectHierarchyTreeExpandRowClickRouting({
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(ref(false)),
    onNodeOpenIconClick,
    onNodeOpenIconPointerDown
  })
  const unknownNode = buildDocumentNode({
    documentId: null,
    id: 'unknown-node',
    nodeKind: 'document'
  })
  Object.assign(unknownNode, { nodeKind: 'unknown-kind' })
  const stat = {
    children: [],
    open: false
  }
  await routing.onWorldNodeRowClick(unknownNode, stat, {
    clientX: 10,
    clientY: 10,
    stopPropagation: vi.fn()
  } as unknown as MouseEvent)
  const worldNode = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])[0]!
  await routing.onNonWorldOpenIconClick(worldNode, stat)
  routing.onNonWorldOpenIconPointerDown(worldNode, stat)
  expect(onNodeOpenIconClick).not.toHaveBeenCalled()
  expect(onNodeOpenIconPointerDown).not.toHaveBeenCalled()
})

test('Test that createProjectHierarchyTreeExpandRowClickRouting forwards non-world open-icon handlers for group nodes', async () => {
  const { createProjectHierarchyTreeExpandRowClickRouting } = await import('../projectHierarchyTreeExpandRowClickRoutingWiring')
  const onNodeOpenIconClick = vi.fn(async () => undefined)
  const onNodeOpenIconPointerDown = vi.fn()
  const routing = createProjectHierarchyTreeExpandRowClickRouting({
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: createTestDocumentRowExpandClickGesture(ref(false)),
    onNodeOpenIconClick,
    onNodeOpenIconPointerDown
  })
  const groupNode = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])[0]!.children[0]!
  const stat = {
    children: [{}],
    open: false
  }
  await routing.onNonWorldOpenIconClick(groupNode, stat)
  routing.onNonWorldOpenIconPointerDown(groupNode, stat)
  expect(onNodeOpenIconClick).toHaveBeenCalledWith(groupNode, stat)
  expect(onNodeOpenIconPointerDown).toHaveBeenCalledWith(stat)
})

test('Test that createProjectHierarchyTreeExpandRowClickRouting skips document row click when gesture blocks toggle', async () => {
  const { createProjectHierarchyTreeExpandRowClickRouting } = await import('../projectHierarchyTreeExpandRowClickRoutingWiring')
  const onNodeOpenIconClick = vi.fn(async () => undefined)
  const gesture = createProjectHierarchyTreeDocumentRowExpandClickGestureWiring({
    isTreeDragActive: ref(false)
  })
  const routing = createProjectHierarchyTreeExpandRowClickRouting({
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: gesture,
    onNodeOpenIconClick,
    onNodeOpenIconPointerDown: vi.fn()
  })
  const expandableDocument = buildDocumentNode({
    childrenLoaded: true,
    documentId: 'doc-expand',
    hasChildren: true,
    id: 'doc-expand'
  })
  const stat = {
    children: [{}],
    open: false
  }
  await routing.onWorldNodeRowClick(expandableDocument, stat, {
    clientX: 10,
    clientY: 10,
    stopPropagation: vi.fn()
  } as unknown as MouseEvent)
  expect(onNodeOpenIconClick).not.toHaveBeenCalled()
  gesture.beginDocumentRowGesture({
    clientX: 10,
    clientY: 10
  })
  await routing.onWorldNodeRowClick(expandableDocument, stat, {
    clientX: 20,
    clientY: 20,
    stopPropagation: vi.fn()
  } as unknown as MouseEvent)
  expect(onNodeOpenIconClick).not.toHaveBeenCalled()
})

test('Test that runProjectHierarchyTreePostDragExpandCloseGuard returns early while post-commit guard active', () => {
  const tree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const treeData = ref(tree)
  const markNodeClosed = vi.fn()
  const group = tree[0]!.children[0]!
  runProjectHierarchyTreePostDragExpandCloseGuard({
    dragExpandPostCommitGuard: () => true,
    getDragExpandedSnapshotNodeIds: () => null,
    markNodeClosed,
    node: group,
    nodeId: 'group-1',
    treeData
  })
  expect(markNodeClosed).not.toHaveBeenCalled()
})

test('Test that createProjectHierarchyTreeExpandRowClickRouting begins document row gesture on pointer down', async () => {
  const { createProjectHierarchyTreeExpandRowClickRouting } = await import('../projectHierarchyTreeExpandRowClickRoutingWiring')
  const gesture = createProjectHierarchyTreeDocumentRowExpandClickGestureWiring({
    isTreeDragActive: ref(false)
  })
  const beginDocumentRowGesture = vi.spyOn(gesture, 'beginDocumentRowGesture')
  const routing = createProjectHierarchyTreeExpandRowClickRouting({
    documentRowDragHoldWiring: createTestDocumentRowDragHoldWiring(),
    documentRowExpandClickGesture: gesture,
    onNodeOpenIconClick: vi.fn(async () => undefined),
    onNodeOpenIconPointerDown: vi.fn()
  })
  const expandableDocument = buildDocumentNode({
    childrenLoaded: true,
    documentId: 'doc-expand',
    hasChildren: true,
    id: 'doc-expand'
  })
  const stat = {
    children: [{}],
    open: false
  }
  routing.onWorldNodeRowPointerDown(expandableDocument, stat, {
    stopPropagation: vi.fn()
  } as unknown as PointerEvent)
  expect(beginDocumentRowGesture).toHaveBeenCalled()
})

test('Test that clearProjectHierarchyTreeHeTreeNodeTabIndex skips non-HTML tree nodes and already disabled tabindex', async () => {
  const { clearProjectHierarchyTreeHeTreeNodeTabIndexForTests } = await import('../projectHierarchyTreeHeTreeNodeTabIndexWiring')
  const host = document.createElement('div')
  const tree = document.createElement('div')
  tree.className = 'projectHierarchyTree'
  const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svgNode.classList.add('tree-node')
  const disabledRow = document.createElement('div')
  disabledRow.className = 'tree-node'
  disabledRow.tabIndex = -1
  tree.appendChild(svgNode)
  tree.appendChild(disabledRow)
  host.appendChild(tree)
  clearProjectHierarchyTreeHeTreeNodeTabIndexForTests(host)
  expect(disabledRow.tabIndex).toBe(-1)
})

test('Test that bindProjectHierarchyTreeHeTreeNodeTabIndexGuard disconnects when host cleared', async () => {
  const treeScrollHostRef = ref<HTMLElement | null>(document.createElement('div'))
  const unmountHooks: Array<() => void> = []
  bindProjectHierarchyTreeHeTreeNodeTabIndexGuard({
    onUnmounted: (hook) => {
      unmountHooks.push(hook)
    },
    treeScrollHostRef,
    watch
  })
  await Promise.resolve()
  treeScrollHostRef.value = null
  await Promise.resolve()
  unmountHooks.forEach((hook) => hook())
})
