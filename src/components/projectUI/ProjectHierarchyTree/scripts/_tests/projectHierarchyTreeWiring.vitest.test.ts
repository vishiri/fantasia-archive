/** @vitest-environment jsdom */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { computed, ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  mapHierarchyDocumentChildrenToTreeNodes,
  mapWorkspaceLayoutToHierarchyTreeSkeleton,
  patchHierarchyTreeSkeletonLabelsInPlace
} from '../../functions/mapWorkspaceLayoutToHierarchyTreeSkeleton'
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
  mergeLoadedChildrenIntoNode,
  pruneProjectHierarchyTreeExpandedNodeIdsToAncestors,
  publishProjectHierarchyTreeRootRevision
} from '../../functions/projectHierarchyTreeExpandState'
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
import { createProjectHierarchyTreeLazyLoadWiring } from '../projectHierarchyTreeLazyLoadWiring'
import {
  commitProjectHierarchyTreeDraggedDocumentMove,
  findProjectHierarchyTreeDocumentParentBucket
} from '../projectHierarchyTreeDnDCommitWiring'
import { createProjectHierarchyTreeSessionHandlersWiring } from '../projectHierarchyTreeSessionHandlersWiring'
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
import {
  attachProjectHierarchyTreeScrollPersist,
  markProjectHierarchyTreeNodeClosed,
  markProjectHierarchyTreeNodeOpen,
  restoreProjectHierarchyTreeUiState,
  revealProjectHierarchyTreePendingPath,
  reapplyProjectHierarchyTreeHeTreeOpenState,
  syncProjectHierarchyTreeOpenSetToPersist
} from '../projectHierarchyTreeUiStateWiring'
import { wireProjectHierarchyTreeSessionLifecycle } from '../projectHierarchyTreeSessionWatchWiring'

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

function buildProjectHierarchyTreeDnDWiringTestDeps (
  overrides: Partial<Parameters<typeof createProjectHierarchyTreeDnDWiring>[0]> = {}
): Parameters<typeof createProjectHierarchyTreeDnDWiring>[0] {
  return {
    bumpTreeMountKey: vi.fn(),
    dragCommitPending: ref(false),
    dragCommitScheduled: ref(false),
    dragDropCommitted: ref(false),
    dragExpandUiFrozen: ref(false),
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    isTreeDragActive: ref(false),
    loadChildrenForNode: vi.fn(async () => undefined),
    markNodeClosed: vi.fn(),
    markNodeOpen: vi.fn(),
    moveDocumentInHierarchy: vi.fn(async () => undefined),
    nextTick: async () => undefined,
    openNodeIds: ref(new Set<string>()),
    queuePersistExpandedNodeIds: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
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
    bumpTreeMountKey: vi.fn(),
    clearDragSessionFlags: vi.fn(),
    dragCommitPending: ref(true),
    dragDropCommitted: ref(false),
    dragExpandUiFrozen: ref(true),
    dragExpandedSnapshot: () => ['world-1'],
    nextTick: async () => undefined,
    removeDragCancelListeners: vi.fn(),
    resyncTreeDataFromLayout: vi.fn(),
    restoreExpandedSnapshot: vi.fn(async () => undefined),
    ...overrides
  }
}

function buildScheduleDragCommitTestDeps (
  overrides: Partial<Parameters<typeof scheduleProjectHierarchyTreeDragCommit>[0]> = {}
): Parameters<typeof scheduleProjectHierarchyTreeDragCommit>[0] {
  return {
    bumpTreeMountKey: vi.fn(),
    dragCommitPending: ref(true),
    dragCommitScheduled: ref(false),
    dragExpandUiFrozen: ref(false),
    dragExpandedSnapshot: () => ['world-1'],
    draggedDocumentId: () => null,
    getTreeRef: () => null,
    loadChildrenForNode: vi.fn(async () => undefined),
    markNodeClosed: vi.fn(),
    markNodeOpen: vi.fn(),
    moveDocumentInHierarchy: vi.fn(async () => undefined),
    nextTick: async () => undefined,
    refreshLayout: vi.fn(async () => undefined),
    removeDragCancelListeners: vi.fn(),
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
            nickname: 'Maps'
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

test('Test that markProjectHierarchyTreeNodeClosed prunes descendant open ids', () => {
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
  expect([...openNodeIds.value]).toEqual(['world-1'])
  expect(queuePersistExpandedNodeIds).toHaveBeenCalledWith(['world-1'])
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
  })).toBe(true)
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
    getWorlds: () => [],
    nextTick: async () => undefined,
    suppressTreeEmit,
    treeData
  })
  wiring.resyncTreeDataFromLayout()
  expect(treeData.value).toEqual([])

  const wiringWithWorlds = createProjectHierarchyTreeSyncWiring({
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
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree, 'placement-1', children)
  const moveDocumentInHierarchy = vi.fn(async () => undefined)
  const refreshLayout = vi.fn(async () => undefined)
  const resyncTreeDataFromLayout = vi.fn()
  await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-1',
    moveDocumentInHierarchy,
    refreshLayout,
    resyncTreeDataFromLayout,
    treeData: tree
  })
  expect(moveDocumentInHierarchy).toHaveBeenCalled()
  expect(refreshLayout).not.toHaveBeenCalled()
  expect(findProjectHierarchyTreeDocumentParentBucket(tree, 'doc-1')?.parentDocumentId).toBeNull()
  await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: null,
    moveDocumentInHierarchy,
    refreshLayout,
    resyncTreeDataFromLayout,
    treeData: tree
  })
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  moveDocumentInHierarchy.mockRejectedValueOnce(new Error('fail'))
  await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-1',
    moveDocumentInHierarchy,
    refreshLayout,
    resyncTreeDataFromLayout,
    treeData: tree
  })
  expect(resyncTreeDataFromLayout).toHaveBeenCalled()
  expect(refreshLayout).toHaveBeenCalled()
  errorSpy.mockRestore()
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
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree, 'doc-parent', nestedChildren)
  const result = await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-child',
    moveDocumentInHierarchy: vi.fn(async () => undefined),
    refreshLayout: vi.fn(async () => undefined),
    resyncTreeDataFromLayout: vi.fn(),
    treeData: tree
  })
  expect(result).toEqual({
    committed: true,
    emptiedParentDocumentIds: [],
    nestParentDocumentId: 'doc-parent'
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
    moveDocumentInHierarchy: vi.fn(async () => undefined),
    refreshLayout: vi.fn(async () => undefined),
    resyncTreeDataFromLayout: vi.fn(),
    treeData: tree
  })
  expect(result).toEqual({
    committed: true,
    emptiedParentDocumentIds: ['doc-parent'],
    nestParentDocumentId: null
  })
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
    worldColor: '#000',
    worldId: 'world-1'
  })
  mergeLoadedChildrenIntoNode(tree.value, 'placement-1', placementChildren)
  const openNodeAndParents = vi.fn()
  const markNodeOpen = vi.fn()
  const loadChildrenForNode = vi.fn(async () => undefined)
  await openProjectHierarchyTreeNestParentAfterDragDrop({
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
  expect(loadChildrenForNode).toHaveBeenCalledTimes(1)
  expect(markNodeOpen).toHaveBeenCalledWith('doc-parent')
  expect(openNodeAndParents).toHaveBeenCalledTimes(1)
})

test('Test that session handlers wiring emits document clicks', async () => {
  const treeComponentRef = ref<I_faProjectHierarchyTreeHeTreeInstance | null>(null)
  const treeScrollHostRef = ref<HTMLElement | null>(null)
  const onDocumentClick = vi.fn()
  const wiring = createProjectHierarchyTreeSessionHandlersWiring({
    dragContext: {
      dragNode: null
    },
    dragExpandUiFrozen: ref(false),
    lazyLoadWiring: {
      loadChildrenForNode: async () => undefined
    },
    onDocumentClick,
    suppressTreeEmit: ref(false),
    treeComponentRef,
    treeData: ref([]),
    treeScrollHostRef,
    uiStateWiring: {
      markNodeClosed: vi.fn(),
      markNodeOpen: vi.fn()
    }
  })
  wiring.onNodeClick({
    data: buildDocumentNode()
  })
  expect(onDocumentClick).toHaveBeenCalledWith('doc-a')
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
  const clearDragSessionFlags = vi.fn()
  const removeDragCancelListeners = vi.fn()
  const resyncTreeDataFromLayout = vi.fn()
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  const dragExpandUiFrozen = ref(true)
  const wiring = createProjectHierarchyTreeDragCancelWiring(buildProjectHierarchyTreeDragCancelTestDeps({
    clearDragSessionFlags,
    dragExpandUiFrozen,
    removeDragCancelListeners,
    resyncTreeDataFromLayout,
    restoreExpandedSnapshot
  }))
  wiring.finishDragSessionWithoutCommit()
  for (let tick = 0; tick < 8; tick += 1) {
    await Promise.resolve()
  }
  expect(removeDragCancelListeners).toHaveBeenCalled()
  expect(resyncTreeDataFromLayout).toHaveBeenCalled()
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith(['world-1'])
  expect(dragExpandUiFrozen.value).toBe(false)
  expect(clearDragSessionFlags).toHaveBeenCalled()
})

test('Test that createProjectHierarchyTreeDragCancelWiring restores empty snapshot when drag snapshot missing', async () => {
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  const wiring = createProjectHierarchyTreeDragCancelWiring(buildProjectHierarchyTreeDragCancelTestDeps({
    dragExpandedSnapshot: () => null,
    restoreExpandedSnapshot
  }))
  wiring.finishDragSessionWithoutCommit()
  for (let tick = 0; tick < 8; tick += 1) {
    await Promise.resolve()
  }
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith([])
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
  const dragCancelWiring = createProjectHierarchyTreeDragCancelWiring(buildProjectHierarchyTreeDragCancelTestDeps({
    clearDragSessionFlags,
    dragCommitPending,
    dragDropCommitted,
    dragExpandUiFrozen,
    removeDragCancelListeners
  }))
  const handlers = createProjectHierarchyTreeDnDHandlers({
    bumpTreeMountKey: vi.fn(),
    clearDragSessionFlags,
    dragCancelWiring,
    dragCommitPending,
    dragCommitScheduled,
    dragDropCommitted,
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
    isTreeDragActive,
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    loadChildrenForNode: vi.fn(async () => undefined),
    markNodeClosed: vi.fn(),
    markNodeOpen: vi.fn(),
    moveDocumentInHierarchy: vi.fn(async () => undefined),
    nextTick: async () => undefined,
    openNodeIds: ref(new Set(['world-1'])),
    queuePersistExpandedNodeIds: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
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
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  scheduleProjectHierarchyTreeDragCommit(buildScheduleDragCommitTestDeps({
    dragCommitPending,
    dragExpandUiFrozen,
    restoreExpandedSnapshot
  }))
  await vi.runAllTimersAsync()
  expect(dragCommitPending.value).toBe(false)
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith(['world-1'])
  expect(dragExpandUiFrozen.value).toBe(false)
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
    shouldDeferWorldsExpandRestore: () => false,
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    openNodeIds: ref(new Set(['world-1'])),
    pendingRevealPath: ref([]),
    resetOnProjectClose,
    resyncTreeDataFromLayout: vi.fn(),
    restoreUiStateFromStore: vi.fn(async () => undefined),
    revealPendingPath: vi.fn(async () => undefined),
    teardown: vi.fn(),
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
    shouldDeferWorldsExpandRestore: () => false,
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    openNodeIds: ref(new Set<string>()),
    pendingRevealPath,
    resetOnProjectClose: vi.fn(),
    resyncTreeDataFromLayout: vi.fn(),
    restoreUiStateFromStore: vi.fn(async () => undefined),
    revealPendingPath,
    teardown: vi.fn(),
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
    dragContext: {
      dragNode: null
    },
    dragExpandUiFrozen,
    lazyLoadWiring: {
      loadChildrenForNode
    },
    onDocumentClick: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: ref(null),
    treeData: ref([]),
    treeScrollHostRef: ref(null),
    uiStateWiring: {
      markNodeClosed,
      markNodeOpen
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

test('Test that wireProjectHierarchyTreeSessionLifecycle skips restore while drag expand UI is frozen', async () => {
  const resyncTreeDataFromLayout = vi.fn()
  const restoreUiStateFromStore = vi.fn(async () => undefined)
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
    shouldDeferWorldsExpandRestore: () => true,
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    openNodeIds: ref(new Set<string>()),
    pendingRevealPath: ref([]),
    resetOnProjectClose: vi.fn(),
    resyncTreeDataFromLayout,
    restoreUiStateFromStore,
    revealPendingPath: vi.fn(async () => undefined),
    teardown: vi.fn(),
    watch,
    worlds
  })
  worlds.value = [{
    ...sampleWorld,
    displayName: 'World B'
  }]
  await Promise.resolve()
  expect(resyncTreeDataFromLayout).toHaveBeenCalled()
  expect(restoreUiStateFromStore).not.toHaveBeenCalled()
})

test('Test that wireProjectHierarchyTreeSessionLifecycle watches project and worlds', async () => {
  const hydrateTreeSession = vi.fn(async () => undefined)
  const teardown = vi.fn()
  const resetOnProjectClose = vi.fn()
  const resyncTreeDataFromLayout = vi.fn()
  const restoreUiStateFromStore = vi.fn(async () => undefined)
  const flushUiStatePersist = vi.fn()
  const clearPendingRevealPath = vi.fn()
  const revealPendingPath = vi.fn(async () => undefined)
  const onMounted = vi.fn((hook: () => void) => hook())
  const onUnmounted = vi.fn((hook: () => void) => hook())
  const worlds = ref([sampleWorld])
  const openNodeIds = ref(new Set<string>())
  const pendingRevealPath = ref(['world-1'])
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
    shouldDeferWorldsExpandRestore: () => false,
    onMounted,
    onUnmounted,
    openNodeIds,
    pendingRevealPath,
    resetOnProjectClose,
    resyncTreeDataFromLayout,
    restoreUiStateFromStore,
    revealPendingPath,
    teardown,
    watch,
    worlds
  })
  worlds.value = [...worlds.value]
  await vi.runAllTimersAsync()
  expect(hydrateTreeSession).toHaveBeenCalled()
  expect(resyncTreeDataFromLayout).toHaveBeenCalled()
  expect(restoreUiStateFromStore).toHaveBeenCalled()
})

test('Test that createProjectHierarchyTreeSessionSubWiring builds tree session deps', () => {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
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
    treeData
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
      }
    ]
  }))
  const moveDocumentInHierarchy = vi.fn(async () => undefined)
  window.faContentBridgeAPIs = {
    projectContent: {
      listPlacementDocumentChildren,
      moveDocumentInHierarchy
    }
  } as never
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
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
  subWiring.dndWiring.onTreeAfterDrop()
  await vi.runAllTimersAsync()
  expect(moveDocumentInHierarchy).toHaveBeenCalled()
})

test('Test that commitProjectHierarchyTreeDraggedDocumentMove refreshes when bucket missing', async () => {
  const refreshLayout = vi.fn(async () => undefined)
  await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'missing-doc',
    moveDocumentInHierarchy: vi.fn(async () => undefined),
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
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith([])
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

test('Test that restoreProjectHierarchyTreeUiState drops orphan placement ids under collapsed groups', async () => {
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
  expect(queuePersistExpandedNodeIds).toHaveBeenCalledWith(['world-1'])
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

test('Test that remountProjectHierarchyTreeAndRestoreExpandedSnapshot bumps key before restore', async () => {
  const bumpTreeMountKey = vi.fn()
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  let tickCount = 0
  await remountProjectHierarchyTreeAndRestoreExpandedSnapshot({
    bumpTreeMountKey,
    expandedNodeIds: ['world-1'],
    nextTick: async () => {
      tickCount += 1
    },
    restoreExpandedSnapshot
  })
  expect(bumpTreeMountKey).toHaveBeenCalledTimes(1)
  expect(tickCount).toBe(4)
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith(['world-1'])
})

test('Test that restoreProjectHierarchyTreeExpandedSnapshot closes he-tree then reopens snapshot ids twice', async () => {
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
  expect(treeRef.closeAll).toHaveBeenCalledTimes(2)
  expect(treeRef.openNodeAndParents).toHaveBeenCalledTimes(2)
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
  expect(treeRef.closeAll).toHaveBeenCalledTimes(1)
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
    dragContext: {
      dragNode: null
    },
    hierarchyStore: {
      clearPendingRevealPath: vi.fn(),
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined),
      refreshUiState: vi.fn(async () => undefined),
      resetOnProjectClose: vi.fn()
    },
    nextTick: async () => undefined,
    onDocumentClick: vi.fn(),
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    pendingRevealPath: ref([]),
    ref,
    treeData,
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch: vi.fn(),
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
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
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
  expect(loadChildrenAlongRevealPath).not.toHaveBeenCalled()
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
    clearPendingRevealPath: vi.fn(),
    flushUiStatePersist: vi.fn(),
    queuePersistExpandedNodeIds: vi.fn(),
    queuePersistScrollTopPx: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
    refreshUiState: vi.fn(async () => undefined),
    resetOnProjectClose: vi.fn()
  }
  const pendingRevealPath = ref(['world-1'])
  const useTree = createUseProjectHierarchyTree({
    S_FaActiveProject: (() => ({
      activeProject: {
        filePath: 'C:\\a.faproject',
        id: 'project-a',
        name: 'Project A'
      },
      hasActiveProject: true
    })) as never,
    S_FaProjectHierarchyTree: (() => hierarchyStore) as never,
    computed,
    dragContext: {
      dragNode: null
    } as never,
    nextTick: async () => undefined,
    onMounted: (hook) => hook(),
    onUnmounted: (hook) => hook(),
    ref,
    storeToRefs: (() => ({
      pendingRevealPath,
      treeData: ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])),
      uiState: ref({
        expandedNodeIds: [],
        schemaVersion: 1,
        scrollTopPx: 0
      }),
      worlds: ref([sampleWorld])
    })) as never,
    watch
  })
  const api = useTree({
    onDocumentClick: vi.fn()
  })
  expect(api.onNodeOpen).toBeTypeOf('function')
  expect(hierarchyStore.flushUiStatePersist).toHaveBeenCalled()
  pendingRevealPath.value = ['world-1', 'placement-1']
  await vi.waitFor(() => {
    expect(hierarchyStore.clearPendingRevealPath).toHaveBeenCalled()
  })
})

test('Test that createProjectHierarchyTreeSessionSubWiring delegates UI state store writes', async () => {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const queuePersistExpandedNodeIds = vi.fn()
  const queuePersistScrollTopPx = vi.fn()
  const flushUiStatePersist = vi.fn()
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
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
      moveDocumentInHierarchy: vi.fn(async () => {
        throw new Error('move failed')
      })
    }
  } as never
  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed,
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
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

test('Test that scheduleProjectHierarchyTreeDragCommit skips commit when suppress emit is set', async () => {
  const moveDocumentInHierarchy = vi.fn(async () => undefined)
  const dragExpandUiFrozen = ref(true)
  scheduleProjectHierarchyTreeDragCommit(buildScheduleDragCommitTestDeps({
    dragExpandUiFrozen,
    moveDocumentInHierarchy,
    suppressTreeEmit: ref(true)
  }))
  await vi.runAllTimersAsync()
  expect(moveDocumentInHierarchy).not.toHaveBeenCalled()
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
    worldColor: '#000',
    worldId: 'world-1'
  })
  const badChild = {
    ...children[0]!,
    placementId: null
  }
  mergeLoadedChildrenIntoNode(tree, 'placement-1', [badChild])
  const moveDocumentInHierarchy = vi.fn(async () => undefined)
  await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-bad',
    moveDocumentInHierarchy,
    refreshLayout: vi.fn(async () => undefined),
    resyncTreeDataFromLayout: vi.fn(),
    treeData: tree
  })
  expect(moveDocumentInHierarchy).not.toHaveBeenCalled()
})

test('Test that lazy load reveal path skips missing node ids', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const listPlacementDocumentChildren = vi.fn(async () => ({
    items: []
  }))
  const wiring = createProjectHierarchyTreeLazyLoadWiring({
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

test('Test that createProjectHierarchyTreeLazyLoadWiring skips nodes without children', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const listPlacementDocumentChildren = vi.fn(async () => ({
    items: []
  }))
  const wiring = createProjectHierarchyTreeLazyLoadWiring({
    listPlacementDocumentChildren,
    nextTick: async () => undefined,
    onAfterTreeRevisionPublished: vi.fn(),
    shouldDeferTreeRevisionPublish: () => false,
    suppressTreeEmit: ref(false),
    treeData
  })
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-2')!
  await wiring.loadChildrenForNode(placement)
  expect(listPlacementDocumentChildren).not.toHaveBeenCalled()
  placement.childrenLoaded = true
  await wiring.loadChildrenForNode(placement)
  expect(listPlacementDocumentChildren).not.toHaveBeenCalled()
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
    shouldDeferWorldsExpandRestore: () => false,
    onMounted: (hook) => {
      hook()
    },
    onUnmounted: vi.fn(),
    openNodeIds: ref(new Set<string>()),
    pendingRevealPath: ref([]),
    resetOnProjectClose: vi.fn(),
    resyncTreeDataFromLayout: vi.fn(),
    restoreUiStateFromStore: vi.fn(async () => undefined),
    revealPendingPath: vi.fn(async () => undefined),
    teardown: vi.fn(),
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
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
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
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
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
    dragContext: {
      dragNode: null
    },
    hierarchyStore,
    nextTick: async () => undefined,
    onDocumentClick: vi.fn(),
    onMounted: (hook) => hook(),
    onUnmounted: (hook) => hook(),
    pendingRevealPath: ref([]),
    ref,
    treeData: ref([]),
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch,
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
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
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
