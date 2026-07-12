/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'
import type { Ref, WatchCallback, WatchOptions, WatchSource, watch as watchFn } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { mapWorkspaceLayoutToHierarchyTreeSkeleton } from '../../functions/mapWorkspaceLayoutToHierarchyTreeSkeleton'
import { findProjectHierarchyTreeNodeById } from '../../functions/projectHierarchyTreeExpandState'
import { mergeLoadedChildrenIntoNode } from '../../functions/projectHierarchyTreeMergeLoadedChildren'
import {
  cloneProjectHierarchyTreeLoadedNodeForPublish,
  replaceProjectHierarchyTreeNodeByIdInPlace
} from '../../functions/projectHierarchyTreeCloneLoadedNodeForPublish'
import { syncProjectHierarchyTreeSiblingOrderFromHeTreeGetData } from '../projectHierarchyTreeDragGetDataSiblingSyncWiring'
import { finalizeProjectHierarchyTreeDragCommitAfterPersist } from '../projectHierarchyTreeDnDCommitAfterPersistWiring'
import { createProjectHierarchyTreeDragSessionState } from '../projectHierarchyTreeDragSessionStateWiring'
import { createProjectHierarchyTreeDroppableHandlers } from '../projectHierarchyTreeDroppableHandlerWiring'
import { createProjectHierarchyTreeSessionExpandHandlersWiring } from '../projectHierarchyTreeSessionExpandHandlersWiring'
import { createProjectHierarchyTreeDocumentRowDragHoldSession } from '../projectHierarchyTreeDocumentRowDragHoldSessionWiring'
import { createProjectHierarchyTreeDocumentRowDragHoldDragStartHandler } from '../projectHierarchyTreeDocumentRowDragHoldDragStartHandlerWiring'
import { bindProjectHierarchyTreeDocumentRowDragHoldDragStartCapture } from '../projectHierarchyTreeDocumentRowDragHoldBindWiring'
import { createProjectHierarchyTreeBeforeDragOpenWiring } from '../projectHierarchyTreeBeforeDragOpenWiring'
import {
  applyProjectHierarchyTreeTreeNodeKindClass,
  clearProjectHierarchyTreeTreeNodeKindClass
} from '../projectHierarchyTreeTreeNodeKindClassWiring'
import { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from '../projectHierarchyTreeDocumentRowExpandClickGestureWiring'
import { openProjectHierarchyTreeNestParentAfterDragDrop } from '../projectHierarchyTreeNestParentOpenWiring'
import {
  finalizeProjectHierarchyTreeDragSiblingOrderSnapshot,
  resolveProjectHierarchyTreeDragSiblingOrderSnapshot
} from '../projectHierarchyTreeDragSiblingOrderSnapshotWiring'
import {
  appendOrRefreshProjectHierarchyTreeAddNewDocumentNode,
  isProjectHierarchyTreeAddNewDocumentNode
} from '../projectHierarchyTreeAddNewDocumentNode'

const dragContextState = vi.hoisted(() => ({
  startInfo: undefined as {
    indexBeforeDrop: number
    parent: {
      children: unknown[]
      data: I_faProjectHierarchyTreeHeTreeNode
    } | null
    tree: Record<string, unknown>
  } | undefined,
  targetInfo: undefined as {
    indexBeforeDrop: number
    parent: {
      children: unknown[]
      data: I_faProjectHierarchyTreeHeTreeNode
    } | null
    tree: Record<string, unknown>
  } | undefined
}))

function createMockWatchForBindTest (): typeof watchFn {
  const watchHandle = {
    pause: () => undefined,
    resume: () => undefined,
    stop: () => undefined
  }
  const mockWatch = (
    source: WatchSource<HTMLElement | null>,
    callback: WatchCallback<HTMLElement | null, HTMLElement | null | undefined>,
    options?: WatchOptions
  ) => {
    if (options?.immediate === true) {
      callback((source as Ref<HTMLElement | null>).value, undefined, () => undefined)
    }
    return watchHandle
  }
  return mockWatch as typeof watchFn
}

vi.mock('@he-tree/vue', () => ({
  dragContext: dragContextState
}))

import {
  computeProjectHierarchyTreeDragSiblingOrderFromHeTreeDropContext,
  readProjectHierarchyTreeDragSiblingOrderFromHeTreeParentStats,
  resolveProjectHierarchyTreeDragDropTargetParentDocumentId,
  resolveProjectHierarchyTreeDragSiblingOrderSnapshotParentDocumentId
} from '../projectHierarchyTreeDragPostDropOrderWiring'
import {
  loadProjectHierarchyTreeNodeChildren,
  refreshProjectHierarchyTreeNodeChildrenFromDatabase
} from '../projectHierarchyTreeLazyLoadChildrenWiring'
import { persistProjectHierarchyTreeDraggedDocumentMove } from '../projectHierarchyTreeDnDCommitPersistWiring'
import { syncProjectHierarchyTreeSiblingOrderAfterDrop } from '../projectHierarchyTreeDragAfterDropSiblingOrderSyncWiring'
import {
  prepareProjectHierarchyTreeDragCommitOrderSnapshot,
  readProjectHierarchyTreeDragSiblingOrderFromGetData
} from '../projectHierarchyTreeDragCommitOrderCaptureWiring'
import {
  resolveProjectHierarchyTreeDragSiblingOrderAfterDrop,
  resolveProjectHierarchyTreeDragSiblingOrderAtDragStart
} from '../projectHierarchyTreeDragSiblingOrderResolveWiring'
import { resolveProjectHierarchyTreeDragCommitOrderFallback } from '../projectHierarchyTreeDragCommitOrderFallbackWiring'
import { applyProjectHierarchyTreeSiblingOrderToTreeData } from '../projectHierarchyTreeSiblingOrderPatchWiring'

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
      titlePluralTranslations: {},
      titleSingularTranslations: {},
      id: 'placement-1',
      nickname: 'Heroes',
      rootSortOrder: null,
      worldId: 'world-1'
    }
  ],
  sortOrder: 0
}

function buildDocumentNode (
  overrides: Partial<I_faProjectHierarchyTreeHeTreeNode> = {}
): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: true,
    documentId: 'doc-a',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-a',
    label: 'Doc A',
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#000',
    worldId: 'world-1',
    ...overrides
  }
}

function seedPlacementDocuments (treeData: I_faProjectHierarchyTreeHeTreeNode[]): void {
  const placement = findProjectHierarchyTreeNodeById(treeData, 'placement-1')
  if (placement === null) {
    return
  }
  placement.children = [
    buildDocumentNode({
      documentId: 'doc-a',
      id: 'doc-a',
      label: 'Doc A'
    }),
    buildDocumentNode({
      documentId: 'doc-b',
      id: 'doc-b',
      label: 'Doc B'
    }),
    buildDocumentNode({
      documentId: 'doc-c',
      id: 'doc-c',
      label: 'Doc C'
    })
  ]
  placement.childrenLoaded = true
}

test('Test that syncProjectHierarchyTreeSiblingOrderFromHeTreeGetData patches treeData from getData', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const liveTree = structuredClone(treeData)
  const placement = liveTree[0]?.children[0]
  if (placement !== undefined) {
    placement.children = [
      buildDocumentNode({
        documentId: 'doc-c',
        id: 'doc-c',
        label: 'Doc C'
      }),
      buildDocumentNode({
        documentId: 'doc-a',
        id: 'doc-a',
        label: 'Doc A'
      }),
      buildDocumentNode({
        documentId: 'doc-b',
        id: 'doc-b',
        label: 'Doc B'
      })
    ]
  }
  const nullDrag = syncProjectHierarchyTreeSiblingOrderFromHeTreeGetData({
    draggedDocumentId: null,
    getTreeRef: () => null,
    treeData
  })
  expect(nullDrag.patched).toBe(false)
  const missingRef = syncProjectHierarchyTreeSiblingOrderFromHeTreeGetData({
    draggedDocumentId: 'doc-a',
    getTreeRef: () => null,
    treeData
  })
  expect(missingRef.patched).toBe(false)
  const synced = syncProjectHierarchyTreeSiblingOrderFromHeTreeGetData({
    draggedDocumentId: 'doc-a',
    getTreeRef: () => ({
      closeAll: () => undefined,
      getData: () => liveTree,
      openNodeAndParents: () => undefined
    }),
    treeData
  })
  expect(synced.patched).toBe(true)
  expect(synced.orderedDocumentIds).toEqual(['doc-c', 'doc-a', 'doc-b'])
})

test('Test that drag post-drop order wiring reads he-tree parent stats and drop context', () => {
  dragContextState.targetInfo = undefined
  expect(readProjectHierarchyTreeDragSiblingOrderFromHeTreeParentStats()).toBeNull()
  const docA = buildDocumentNode({
    documentId: 'doc-a',
    id: 'doc-a'
  })
  const docB = buildDocumentNode({
    documentId: 'doc-b',
    id: 'doc-b'
  })
  dragContextState.targetInfo = {
    indexBeforeDrop: 1,
    parent: {
      children: [
        { data: docB },
        { data: docA }
      ],
      data: findProjectHierarchyTreeNodeById(
        mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]),
        'placement-1'
      )!
    },
    tree: {}
  }
  expect(readProjectHierarchyTreeDragSiblingOrderFromHeTreeParentStats()).toEqual(['doc-b', 'doc-a'])
  dragContextState.startInfo = {
    indexBeforeDrop: 0,
    parent: dragContextState.targetInfo?.parent ?? null,
    tree: {}
  }
  ;(dragContextState.targetInfo as { indexBeforeDrop: number }).indexBeforeDrop = 1
  expect(computeProjectHierarchyTreeDragSiblingOrderFromHeTreeDropContext({
    dragStartOrderedDocumentIds: ['doc-a', 'doc-b', 'doc-c'],
    movedDocumentId: 'doc-a'
  })).toEqual(['doc-b', 'doc-a', 'doc-c'])
  expect(computeProjectHierarchyTreeDragSiblingOrderFromHeTreeDropContext({
    dragStartOrderedDocumentIds: null,
    movedDocumentId: 'doc-a'
  })).toBeNull()
  dragContextState.startInfo = undefined
  dragContextState.targetInfo = undefined
})

test('Test that drop target parent document id resolves from he-tree dragContext', () => {
  dragContextState.targetInfo = undefined
  expect(resolveProjectHierarchyTreeDragDropTargetParentDocumentId()).toEqual({ resolved: false })
  const parentDoc = buildDocumentNode({
    documentId: 'doc-parent',
    hasChildren: true,
    id: 'doc-parent',
    label: 'Parent'
  })
  dragContextState.targetInfo = {
    indexBeforeDrop: 0,
    parent: {
      children: [{
        data: buildDocumentNode({
          documentId: 'doc-child',
          id: 'doc-child'
        })
      }],
      data: parentDoc
    },
    tree: {}
  }
  expect(resolveProjectHierarchyTreeDragDropTargetParentDocumentId()).toEqual({
    parentDocumentId: 'doc-parent',
    resolved: true
  })
  expect(resolveProjectHierarchyTreeDragSiblingOrderSnapshotParentDocumentId({
    treeDataParentDocumentId: null
  })).toBe('doc-parent')
  dragContextState.targetInfo = undefined
})

test('Test that syncProjectHierarchyTreeSiblingOrderAfterDrop uses drop target parent when treeData lags', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const parentDoc = buildDocumentNode({
    childrenLoaded: false,
    documentId: 'doc-parent',
    hasChildren: true,
    id: 'doc-parent',
    label: 'Parent'
  })
  const placement = findProjectHierarchyTreeNodeById(treeData, 'placement-1')
  expect(placement).not.toBeNull()
  if (placement !== null) {
    placement.children.push(parentDoc)
  }
  dragContextState.targetInfo = {
    indexBeforeDrop: 0,
    parent: {
      children: [{
        data: buildDocumentNode({
          documentId: 'doc-c',
          id: 'doc-c'
        })
      }],
      data: parentDoc
    },
    tree: {}
  }
  const synced = syncProjectHierarchyTreeSiblingOrderAfterDrop({
    dragStartOrderedDocumentIds: ['doc-a', 'doc-b', 'doc-c'],
    draggedDocumentId: 'doc-c',
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    setDragSiblingOrderSnapshot: () => undefined,
    treeData
  })
  expect(synced.snapshot?.parentDocumentId).toBe('doc-parent')
  dragContextState.targetInfo = undefined
})

test('Test that persistProjectHierarchyTreeDraggedDocumentMove uses snapshot parent for nest open id', async () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const result = await persistProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-c',
    dragCommitSuppressWaitAttempts: 0,
    dragCommitSuppressWaitReady: true,
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-c'],
      parentDocumentId: 'doc-parent',
      placementId: 'placement-1'
    },
    modelSettleAttempts: 0,
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => undefined),
    refreshLayout: vi.fn(async () => undefined),
    resyncTreeDataFromLayout: vi.fn(),
    suppressTreeEmit: false,
    treeData
  })
  expect(result.nestParentDocumentId).toBe('doc-parent')
})

test('Test that resolveProjectHierarchyTreeDragCommitOrderFallback prefers dom sibling order', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const host = document.createElement('div')
  host.setAttribute('data-test-locator', 'projectHierarchyTree-host')
  const treeRoot = document.createElement('div')
  treeRoot.className = 'projectHierarchyTree'
  const appendRow = (documentId: string): void => {
    const treeNode = document.createElement('div')
    treeNode.className = 'tree-node'
    const row = document.createElement('div')
    row.className = 'projectHierarchyTree__nodeRow projectHierarchyTree__nodeRow--document'
    const nodeRoot = document.createElement('div')
    nodeRoot.setAttribute('data-test-hierarchy-node-id', documentId)
    row.appendChild(nodeRoot)
    treeNode.appendChild(row)
    treeRoot.appendChild(treeNode)
  }
  appendRow('doc-c')
  appendRow('doc-a')
  appendRow('doc-b')
  host.appendChild(treeRoot)
  const fallback = resolveProjectHierarchyTreeDragCommitOrderFallback({
    dragSiblingOrderAtDragStart: ['doc-a', 'doc-b', 'doc-c'],
    draggedDocumentId: 'doc-a',
    getTreeRef: () => null,
    getTreeScrollHost: () => host,
    treeData,
    treeDataSnapshot: {
      orderedDocumentIds: ['doc-a', 'doc-b', 'doc-c'],
      parentDocumentId: null,
      placementId: 'placement-1'
    }
  })
  expect(fallback.orderSource).toBe('dom')
  expect(fallback.commitSnapshot?.orderedDocumentIds).toEqual(['doc-c', 'doc-a', 'doc-b'])
})

test('Test that lazy load children wiring refreshes placement and nested document rows', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  placement.childrenLoaded = true
  const publishTreeRevision = vi.fn(async () => undefined)
  const listPlacementDocumentChildren = vi.fn(async (input) => ({
    items: input.parentDocumentId === undefined
      ? [{
          displayName: 'Doc fresh',
          hasChildren: false,
          id: 'doc-fresh',
          parentDocumentId: null,
          placementId: 'placement-1',
          sortOrder: 0
        }]
      : [{
          displayName: 'Nested',
          hasChildren: false,
          id: 'doc-nested',
          parentDocumentId: 'doc-parent',
          placementId: 'placement-1',
          sortOrder: 0
        }]
  }))
  await refreshProjectHierarchyTreeNodeChildrenFromDatabase({
    listPlacementDocumentChildren,
    nodeId: 'missing-node',
    preferredLanguageCode: 'en-US',
    publishTreeRevision,
    treeData
  })
  expect(listPlacementDocumentChildren).not.toHaveBeenCalled()
  await refreshProjectHierarchyTreeNodeChildrenFromDatabase({
    listPlacementDocumentChildren,
    nodeId: 'placement-1',
    preferredLanguageCode: 'en-US',
    publishTreeRevision,
    treeData
  })
  expect(publishTreeRevision).toHaveBeenCalledWith('templatePlacement', 'placement-1')
  const parentDocument = buildDocumentNode({
    childrenLoaded: false,
    documentId: 'doc-parent',
    hasChildren: true,
    id: 'doc-parent'
  })
  mergeLoadedChildrenIntoNode(treeData.value, 'placement-1', [parentDocument])
  await loadProjectHierarchyTreeNodeChildren({
    listPlacementDocumentChildren,
    node: parentDocument,
    preferredLanguageCode: 'en-US',
    publishTreeRevision,
    treeData
  })
  expect(listPlacementDocumentChildren).toHaveBeenCalledWith({
    parentDocumentId: 'doc-parent',
    placementId: 'placement-1'
  })
})

test('Test that refreshProjectHierarchyTreeNodeChildrenFromDatabase keeps loaded nested document rows', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const parentDocument = buildDocumentNode({
    children: [buildDocumentNode({
      documentId: 'doc-nested',
      id: 'doc-nested',
      label: 'Nested doc'
    })],
    childrenLoaded: true,
    documentId: 'doc-parent',
    hasChildren: true,
    id: 'doc-parent',
    label: 'Parent doc'
  })
  mergeLoadedChildrenIntoNode(treeData.value, 'placement-1', [
    buildDocumentNode({
      documentId: 'doc-sibling',
      id: 'doc-sibling',
      label: 'Sibling saved'
    }),
    parentDocument
  ])
  const publishTreeRevision = vi.fn(async () => undefined)
  const listPlacementDocumentChildren = vi.fn(async () => ({
    items: [{
      displayName: 'Sibling saved',
      hasChildren: false,
      id: 'doc-sibling',
      parentDocumentId: null,
      placementId: 'placement-1',
      sortOrder: 0
    }, {
      displayName: 'Parent doc',
      hasChildren: true,
      id: 'doc-parent',
      parentDocumentId: null,
      placementId: 'placement-1',
      sortOrder: 1
    }]
  }))
  await refreshProjectHierarchyTreeNodeChildrenFromDatabase({
    listPlacementDocumentChildren,
    nodeId: 'placement-1',
    preferredLanguageCode: 'en-US',
    publishTreeRevision,
    treeData
  })
  const parentAfter = findProjectHierarchyTreeNodeById(treeData.value, 'doc-parent')
  expect(parentAfter?.children.map((child) => child.id)).toEqual(['doc-nested'])
})

test('Test that persistProjectHierarchyTreeDraggedDocumentMove reindexes sibling order snapshot', async () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const reindexDocumentSiblingsInHierarchy = vi.fn(async () => undefined)
  const result = await persistProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-a',
    dragCommitSuppressWaitAttempts: 0,
    dragCommitSuppressWaitReady: true,
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-c', 'doc-a', 'doc-b'],
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    modelSettleAttempts: 0,
    reindexDocumentSiblingsInHierarchy,
    refreshLayout: vi.fn(async () => undefined),
    resyncTreeDataFromLayout: vi.fn(),
    suppressTreeEmit: false,
    treeData
  })
  expect(result.committed).toBe(true)
  expect(reindexDocumentSiblingsInHierarchy).toHaveBeenCalledWith({
    movedDocumentId: 'doc-a',
    orderedDocumentIds: ['doc-c', 'doc-a', 'doc-b'],
    parentDocumentId: null,
    placementId: 'placement-1'
  })
})

test('Test that clone loaded node for publish deep-clones nested loaded children', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const placement = findProjectHierarchyTreeNodeById(treeData, 'placement-1')!
  const nestedChild = buildDocumentNode({
    children: [buildDocumentNode({
      documentId: 'doc-nested',
      id: 'doc-nested'
    })],
    childrenLoaded: true,
    documentId: 'doc-parent',
    hasChildren: true,
    id: 'doc-parent'
  })
  placement.children = [nestedChild]
  const cloned = cloneProjectHierarchyTreeLoadedNodeForPublish(placement)
  expect(cloned.children[0]?.children).not.toBe(nestedChild.children)
  expect(replaceProjectHierarchyTreeNodeByIdInPlace(treeData, 'missing', placement)).toBe(false)
  expect(replaceProjectHierarchyTreeNodeByIdInPlace(treeData, 'placement-1', cloned)).toBe(true)
})

test('Test that drag sibling order resolve and after-drop sync capture commit snapshot', () => {
  dragContextState.startInfo = undefined
  dragContextState.targetInfo = undefined
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const atDragStart = resolveProjectHierarchyTreeDragSiblingOrderAtDragStart({
    documentId: 'doc-a',
    getTreeRef: () => ({
      closeAll: () => undefined,
      getData: () => treeData,
      openNodeAndParents: () => undefined
    }),
    getTreeScrollHost: () => null,
    treeData
  })
  expect(atDragStart.orderedDocumentIds).toEqual(['doc-a', 'doc-b', 'doc-c'])
  let snapshot: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null = null
  const afterDrop = syncProjectHierarchyTreeSiblingOrderAfterDrop({
    dragStartOrderedDocumentIds: ['doc-a', 'doc-b', 'doc-c'],
    draggedDocumentId: 'doc-a',
    getTreeRef: () => ({
      closeAll: () => undefined,
      getData: () => treeData,
      openNodeAndParents: () => undefined
    }),
    getTreeScrollHost: () => null,
    setDragSiblingOrderSnapshot: (value) => {
      snapshot = value
    },
    treeData
  })
  expect(afterDrop.snapshot).not.toBeNull()
  expect(snapshot).not.toBeNull()
  const afterDropResolved = resolveProjectHierarchyTreeDragSiblingOrderAfterDrop({
    documentId: 'doc-a',
    dragStartOrderedDocumentIds: ['doc-a', 'doc-b', 'doc-c'],
    getTreeRef: () => ({
      closeAll: () => undefined,
      getData: () => treeData,
      openNodeAndParents: () => undefined
    }),
    getTreeScrollHost: () => null,
    treeData
  })
  expect(afterDropResolved.orderedDocumentIds).toEqual(['doc-a', 'doc-b', 'doc-c'])
  const prepared = prepareProjectHierarchyTreeDragCommitOrderSnapshot({
    dragSiblingOrderAtDragStart: ['doc-a', 'doc-b', 'doc-c'],
    draggedDocumentId: 'doc-a',
    existingDragSiblingOrderSnapshot: snapshot,
    getDataOrderReady: true,
    getDataSettleAttempts: 0,
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    setDragSiblingOrderSnapshot: vi.fn(),
    treeData
  })
  expect(prepared?.orderedDocumentIds).toEqual(['doc-a', 'doc-b', 'doc-c'])
  expect(readProjectHierarchyTreeDragSiblingOrderFromGetData({
    documentId: 'doc-a',
    getTreeRef: () => ({
      closeAll: () => undefined,
      getData: () => treeData,
      openNodeAndParents: () => undefined
    })
  })).toEqual(['doc-a', 'doc-b', 'doc-c'])
})

test('Test that finalizeProjectHierarchyTreeDragCommitAfterPersist merges nest parent into expanded snapshot restore', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  seedPlacementDocuments(treeData.value)
  mergeLoadedChildrenIntoNode(treeData.value, 'placement-1', [
    buildDocumentNode({
      childrenLoaded: false,
      documentId: 'doc-parent',
      hasChildren: true,
      id: 'doc-parent',
      label: 'Parent'
    })
  ])
  const flushUiStatePersist = vi.fn()
  const queuePersistExpandedNodeIds = vi.fn()
  const openNodeIds = ref(new Set(['world-1', 'group-1', 'placement-1', 'doc-parent']))
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  await finalizeProjectHierarchyTreeDragCommitAfterPersist({
    clearDragSessionFlags: vi.fn(),
    commitResult: {
      committed: true,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: 'doc-parent',
      reloadChildrenNodeId: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    expandedSnapshot: ['world-1', 'placement-1'],
    expandedSnapshotSet: new Set(['world-1', 'placement-1']),
    flushDeferredTreeRevisionPublish: vi.fn(),
    flushUiStatePersist,
    getTreeRef: () => ({
      closeAll: () => undefined,
      openNodeAndParents: () => undefined
    }),
    loadChildrenForNode: vi.fn(async () => undefined),
    markNodeClosed: vi.fn(),
    nextTick: async () => undefined,
    openNodeIds,
    queuePersistExpandedNodeIds,
    reapplyHeTreeOpenState: vi.fn(),
    reapplyLatentDescendantExpandState: vi.fn(async () => undefined),
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    },
    restoreExpandedSnapshot,
    treeData
  })
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith(
    ['world-1', 'placement-1', 'doc-parent'],
    expect.any(Object)
  )
  expect(restoreExpandedSnapshot).toHaveBeenCalledTimes(2)
  expect(queuePersistExpandedNodeIds).toHaveBeenCalled()
  expect(flushUiStatePersist).toHaveBeenCalled()
})

test('Test that finalizeProjectHierarchyTreeDragCommitAfterPersist skips nest persist sync when parent was expanded at drag start', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  seedPlacementDocuments(treeData.value)
  mergeLoadedChildrenIntoNode(treeData.value, 'placement-1', [
    buildDocumentNode({
      childrenLoaded: false,
      documentId: 'doc-parent',
      hasChildren: true,
      id: 'doc-parent',
      label: 'Parent'
    })
  ])
  const markNodeOpen = vi.fn()
  const flushUiStatePersist = vi.fn()
  const queuePersistExpandedNodeIds = vi.fn()
  const openNodeIds = ref(new Set(['world-1', 'placement-1', 'doc-parent']))
  await finalizeProjectHierarchyTreeDragCommitAfterPersist({
    clearDragSessionFlags: vi.fn(),
    commitResult: {
      committed: true,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: 'doc-parent',
      reloadChildrenNodeId: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    expandedSnapshot: ['world-1', 'placement-1', 'doc-parent'],
    expandedSnapshotSet: new Set(['world-1', 'placement-1', 'doc-parent']),
    flushDeferredTreeRevisionPublish: vi.fn(),
    flushUiStatePersist,
    getTreeRef: () => ({
      closeAll: () => undefined,
      openNodeAndParents: () => undefined
    }),
    loadChildrenForNode: vi.fn(async () => undefined),
    markNodeClosed: vi.fn(),
    nextTick: async () => undefined,
    openNodeIds,
    queuePersistExpandedNodeIds,
    reapplyHeTreeOpenState: vi.fn(),
    reapplyLatentDescendantExpandState: vi.fn(async () => undefined),
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    },
    restoreExpandedSnapshot: vi.fn(async () => undefined),
    treeData
  })
  expect(markNodeOpen).not.toHaveBeenCalled()
  expect(queuePersistExpandedNodeIds).toHaveBeenCalled()
})

test('Test that persistProjectHierarchyTreeDraggedDocumentMove resyncs after reindex failure', async () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const resyncTreeDataFromLayout = vi.fn()
  const refreshLayout = vi.fn(async () => undefined)
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const result = await persistProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-a',
    dragCommitSuppressWaitAttempts: 0,
    dragCommitSuppressWaitReady: true,
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-a', 'doc-b', 'doc-c'],
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    modelSettleAttempts: 0,
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => {
      throw new Error('reindex failed')
    }),
    refreshLayout,
    resyncTreeDataFromLayout,
    suppressTreeEmit: false,
    treeData
  })
  expect(result.committed).toBe(false)
  expect(resyncTreeDataFromLayout).toHaveBeenCalled()
  expect(refreshLayout).toHaveBeenCalled()
  errorSpy.mockRestore()
})

test('Test that resolveProjectHierarchyTreeDragCommitOrderFallback uses parentStats when dom missing', () => {
  dragContextState.startInfo = undefined
  dragContextState.targetInfo = undefined
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const docA = buildDocumentNode({
    documentId: 'doc-a',
    id: 'doc-a'
  })
  const docB = buildDocumentNode({
    documentId: 'doc-b',
    id: 'doc-b'
  })
  dragContextState.targetInfo = {
    indexBeforeDrop: 1,
    parent: {
      children: [
        {
          data: docB
        },
        {
          data: docA
        }
      ],
      data: findProjectHierarchyTreeNodeById(treeData, 'placement-1')!
    },
    tree: {}
  }
  const fallback = resolveProjectHierarchyTreeDragCommitOrderFallback({
    dragSiblingOrderAtDragStart: ['doc-a', 'doc-b', 'doc-c'],
    draggedDocumentId: 'doc-a',
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    treeData,
    treeDataSnapshot: {
      orderedDocumentIds: ['doc-a', 'doc-b', 'doc-c'],
      parentDocumentId: null,
      placementId: 'placement-1'
    }
  })
  expect(fallback.orderSource).toBe('parentStats')
  expect(fallback.commitSnapshot?.orderedDocumentIds).toEqual(['doc-b', 'doc-a'])
})

test('Test that resolveProjectHierarchyTreeDragCommitOrderFallback uses getData when dom and stats missing', () => {
  dragContextState.startInfo = undefined
  dragContextState.targetInfo = undefined
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const liveTree = structuredClone(treeData)
  const placement = liveTree[0]?.children[0]
  if (placement !== undefined) {
    placement.children = [
      buildDocumentNode({
        documentId: 'doc-c',
        id: 'doc-c',
        label: 'Doc C'
      }),
      buildDocumentNode({
        documentId: 'doc-a',
        id: 'doc-a',
        label: 'Doc A'
      }),
      buildDocumentNode({
        documentId: 'doc-b',
        id: 'doc-b',
        label: 'Doc B'
      })
    ]
  }
  const fallback = resolveProjectHierarchyTreeDragCommitOrderFallback({
    dragSiblingOrderAtDragStart: ['doc-a', 'doc-b', 'doc-c'],
    draggedDocumentId: 'doc-a',
    getTreeRef: () => ({
      closeAll: () => undefined,
      getData: () => liveTree,
      openNodeAndParents: () => undefined
    }),
    getTreeScrollHost: () => null,
    treeData,
    treeDataSnapshot: {
      orderedDocumentIds: ['doc-a', 'doc-b', 'doc-c'],
      parentDocumentId: null,
      placementId: 'placement-1'
    }
  })
  expect(fallback.orderSource).toBe('getData')
  expect(fallback.commitSnapshot?.orderedDocumentIds).toEqual(['doc-c', 'doc-a', 'doc-b'])
})

test('Test that prepareProjectHierarchyTreeDragCommitOrderSnapshot uses fallback resolver', () => {
  dragContextState.startInfo = {
    indexBeforeDrop: 0,
    parent: null,
    tree: {}
  }
  dragContextState.targetInfo = {
    indexBeforeDrop: 2,
    parent: null,
    tree: {}
  }
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const setSnapshot = vi.fn()
  const snapshot = prepareProjectHierarchyTreeDragCommitOrderSnapshot({
    dragSiblingOrderAtDragStart: ['doc-a', 'doc-b', 'doc-c'],
    draggedDocumentId: 'doc-a',
    existingDragSiblingOrderSnapshot: null,
    getDataOrderReady: true,
    getDataSettleAttempts: 0,
    getTreeRef: () => ({
      closeAll: () => undefined,
      getData: () => treeData,
      openNodeAndParents: () => undefined
    }),
    getTreeScrollHost: () => null,
    setDragSiblingOrderSnapshot: setSnapshot,
    treeData
  })
  expect(snapshot).not.toBeNull()
  expect(setSnapshot).toHaveBeenCalled()
})

test('Test that finalizeProjectHierarchyTreeDragCommitAfterPersist closes emptied parents outside snapshot', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  seedPlacementDocuments(treeData.value)
  const emptiedParent = buildDocumentNode({
    children: [],
    childrenLoaded: true,
    documentId: 'doc-empty',
    hasChildren: true,
    id: 'doc-empty',
    label: 'Empty parent'
  })
  mergeLoadedChildrenIntoNode(treeData.value, 'placement-1', [emptiedParent])
  const markNodeClosed = vi.fn()
  await finalizeProjectHierarchyTreeDragCommitAfterPersist({
    clearDragSessionFlags: vi.fn(),
    commitResult: {
      committed: true,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null,
      reloadChildrenNodeId: null
    },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    expandedSnapshot: ['world-1', 'placement-1'],
    expandedSnapshotSet: new Set(['world-1', 'placement-1']),
    flushDeferredTreeRevisionPublish: vi.fn(),
    flushUiStatePersist: vi.fn(),
    getTreeRef: () => null,
    loadChildrenForNode: vi.fn(async () => undefined),
    markNodeClosed,
    nextTick: async () => undefined,
    openNodeIds: ref(new Set(['world-1', 'placement-1'])),
    queuePersistExpandedNodeIds: vi.fn(),
    reapplyHeTreeOpenState: vi.fn(),
    reapplyLatentDescendantExpandState: vi.fn(async () => undefined),
    requestAnimationFrame: (callback) => {
      callback()
      return 1
    },
    restoreExpandedSnapshot: vi.fn(async () => undefined),
    treeData
  })
  expect(markNodeClosed).toHaveBeenCalledWith('doc-empty', expect.any(Object))
})

test('Test that syncProjectHierarchyTreeSiblingOrderAfterDrop returns early without dragged id', () => {
  const afterDrop = syncProjectHierarchyTreeSiblingOrderAfterDrop({
    dragStartOrderedDocumentIds: null,
    draggedDocumentId: null,
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    setDragSiblingOrderSnapshot: vi.fn(),
    treeData: []
  })
  expect(afterDrop.snapshot).toBeNull()
  expect(afterDrop.patched).toBe(false)
})

test('Test that createProjectHierarchyTreeDragSessionState exposes revision readers', () => {
  const session = createProjectHierarchyTreeDragSessionState({
    dragCommitPending: ref(true),
    dragCommitScheduled: ref(true),
    dragDropCommitted: ref(true),
    isTreeDragActive: ref(true)
  })
  session.resetDragModelValueRevisionForDragStart()
  expect(session.readDragModelValueRevision()).toBe(0)
  expect(session.readDragModelValueRevisionAtDragStart()).toBe(0)
  session.incrementDragModelValueRevision()
  session.captureDragModelValueRevisionAtDrop()
  expect(session.readDragModelValueRevisionAtDrop()).toBe(1)
  expect(session.readDragModelValueSettledForCommit()).toBe(false)
  session.incrementDragModelValueRevision()
  expect(session.readDragModelValueSettledForCommit()).toBe(true)
  session.clearDragSessionFlags()
  expect(session.readDragModelValueRevision()).toBe(0)
})

test('Test that resolveProjectHierarchyTreeDragSiblingOrderSnapshot rejects invalid document rows', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(resolveProjectHierarchyTreeDragSiblingOrderSnapshot(treeData, 'missing-doc')).toBeNull()
  seedPlacementDocuments(treeData)
  const invalidTree = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const invalidDoc = buildDocumentNode({
    documentId: 'doc-invalid',
    id: 'doc-invalid',
    placementId: null
  })
  mergeLoadedChildrenIntoNode(invalidTree, 'placement-1', [invalidDoc])
  expect(resolveProjectHierarchyTreeDragSiblingOrderSnapshot(invalidTree, 'doc-invalid')).toBeNull()
  let clearedSnapshot: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null = {
    orderedDocumentIds: ['doc-a'],
    parentDocumentId: null,
    placementId: 'placement-1'
  }
  expect(finalizeProjectHierarchyTreeDragSiblingOrderSnapshot({
    documentId: 'doc-a',
    setDragSiblingOrderSnapshot: (value) => {
      clearedSnapshot = value
    },
    treeNodes: treeData
  })?.orderedDocumentIds).toEqual(['doc-a', 'doc-b', 'doc-c'])
  expect(clearedSnapshot?.orderedDocumentIds).toEqual(['doc-a', 'doc-b', 'doc-c'])
})

test('Test that createProjectHierarchyTreeDroppableHandlers delegates to DnD policy', () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  seedPlacementDocuments(treeData.value)
  const documentNode = findProjectHierarchyTreeNodeById(treeData.value, 'doc-a')!
  const siblingNode = findProjectHierarchyTreeNodeById(treeData.value, 'doc-b')!
  const handlers = createProjectHierarchyTreeDroppableHandlers({
    dragContext: {
      dragNode: {
        data: documentNode
      }
    },
    treeData
  })
  expect(handlers.rootDroppableHandler()).toBe(false)
  expect(handlers.eachDroppableHandler({
    data: siblingNode
  })).toBe(true)
})

test('Test that createProjectHierarchyTreeSessionExpandHandlersWiring ignores close while frozen', () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  seedPlacementDocuments(treeData.value)
  const markNodeClosed = vi.fn()
  const wiring = createProjectHierarchyTreeSessionExpandHandlersWiring({
    documentRowDragHoldWiring: {
      clearHoldSession: vi.fn(),
      getIsDragHoldArmed: () => true,
      handleDocumentRowPointerDown: vi.fn(),
      handleTreeDragStartCapture: vi.fn(),
      markDragStartedFromHold: vi.fn()
    },
    documentRowExpandClickGesture: createProjectHierarchyTreeDocumentRowExpandClickGestureWiring({
      isTreeDragActive: ref(false)
    }),
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(true),
    getDragExpandedSnapshotNodeIds: () => null,
    lazyLoadWiring: {
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    suppressTreeEmit: ref(false),
    treeComponentRef: ref(null),
    treeData,
    uiStateWiring: {
      markNodeClosed,
      markNodeOpen: vi.fn(),
      reapplyLatentDescendantExpandState: vi.fn(async () => undefined)
    }
  })
  const documentNode = findProjectHierarchyTreeNodeById(treeData.value, 'doc-a')!
  wiring.onNodeClose({
    data: documentNode
  })
  expect(markNodeClosed).not.toHaveBeenCalled()
  wiring.onNodeOpen({
    data: documentNode
  })
})

test('Test that resolveProjectHierarchyTreeDragCommitOrderFallback uses computed order as last resort', () => {
  dragContextState.startInfo = {
    indexBeforeDrop: 0,
    parent: {
      children: [],
      data: findProjectHierarchyTreeNodeById(
        mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]),
        'placement-1'
      )!
    },
    tree: {}
  }
  dragContextState.targetInfo = {
    indexBeforeDrop: 2,
    parent: dragContextState.startInfo!.parent,
    tree: {}
  }
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const fallback = resolveProjectHierarchyTreeDragCommitOrderFallback({
    dragSiblingOrderAtDragStart: ['doc-a', 'doc-b', 'doc-c'],
    draggedDocumentId: 'doc-a',
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    treeData,
    treeDataSnapshot: {
      orderedDocumentIds: ['doc-a', 'doc-b', 'doc-c'],
      parentDocumentId: null,
      placementId: 'placement-1'
    }
  })
  expect(fallback.orderSource).toBe('computed')
  expect(fallback.commitSnapshot?.orderedDocumentIds).toEqual(['doc-b', 'doc-c', 'doc-a'])
  dragContextState.startInfo = undefined
  dragContextState.targetInfo = undefined
})

test('Test that document row drag hold session arms after delay and clears on pointer end', () => {
  vi.useFakeTimers()
  let allowedDragStart = false
  const session = createProjectHierarchyTreeDocumentRowDragHoldSession({
    dragHandleClassName: 'projectHierarchyTree__dragHandleArmed',
    holdDelayMs: 200,
    leftPointerDownClassName: 'projectHierarchyTree__leftPointerDownArmed',
    onAllowedDocumentRowDragStart: () => {
      allowedDragStart = true
    },
    windowClearTimeout: (timeoutId) => {
      window.clearTimeout(timeoutId)
    },
    windowSetTimeout: (handler, delayMs) => {
      return window.setTimeout(handler, delayMs)
    }
  })
  const row = document.createElement('div')
  session.handleDocumentRowPointerDown({
    button: 0,
    currentTarget: row,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn()
  } as unknown as PointerEvent)
  expect(row.classList.contains('projectHierarchyTree__dragHandleArmed')).toBe(true)
  expect(row.classList.contains('projectHierarchyTree__leftPointerDownArmed')).toBe(true)
  expect(session.getIsDragHoldArmed()).toBe(false)
  vi.advanceTimersByTime(200)
  expect(row.classList.contains('projectHierarchyTree__dragHandleArmed')).toBe(true)
  expect(session.getIsDragHoldArmed()).toBe(true)
  const allowedEvent = {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn()
  } as unknown as DragEvent
  session.handleTreeDragStartCapture(allowedEvent)
  expect(allowedEvent.preventDefault).not.toHaveBeenCalled()
  session.clearHoldSession()
  expect(session.getIsDragHoldArmed()).toBe(false)
  expect(allowedDragStart).toBe(false)
  vi.useRealTimers()
})

test('Test that document row drag hold drag start handler blocks before hold armed', async () => {
  const onAllowedDocumentRowDragStart = vi.fn()
  const handler = createProjectHierarchyTreeDocumentRowDragHoldDragStartHandler({
    getArmed: () => false,
    getIsPointerDownForHold: () => true,
    onAllowedDocumentRowDragStart
  })
  const blockedEvent = {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn()
  } as unknown as DragEvent
  handler.handleTreeDragStartCapture(blockedEvent)
  expect(blockedEvent.preventDefault).toHaveBeenCalled()
  expect(onAllowedDocumentRowDragStart).not.toHaveBeenCalled()
  const allowedHandler = createProjectHierarchyTreeDocumentRowDragHoldDragStartHandler({
    getArmed: () => true,
    getIsPointerDownForHold: () => true,
    onAllowedDocumentRowDragStart
  })
  allowedHandler.handleTreeDragStartCapture({
    preventDefault: vi.fn(),
    stopPropagation: vi.fn()
  } as unknown as DragEvent)
  await Promise.resolve()
  expect(onAllowedDocumentRowDragStart).toHaveBeenCalled()
})

test('Test that bindProjectHierarchyTreeDocumentRowDragHoldDragStartCapture attaches dragstart listener', () => {
  const host = document.createElement('div')
  const treeScrollHostRef = ref<HTMLElement | null>(host)
  const handleTreeDragStartCapture = vi.fn()
  const clearHoldSession = vi.fn()
  bindProjectHierarchyTreeDocumentRowDragHoldDragStartCapture({
    clearHoldSession,
    handleTreeDragStartCapture,
    onUnmounted: () => undefined,
    treeScrollHostRef,
    watch: createMockWatchForBindTest()
  })
  host.dispatchEvent(new Event('dragstart', {
    bubbles: true,
    cancelable: true
  }))
  expect(handleTreeDragStartCapture).toHaveBeenCalled()
})

test('Test that openProjectHierarchyTreeNestParentAfterDragDrop returns when parent missing', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const loadChildrenForNode = vi.fn(async () => undefined)
  await openProjectHierarchyTreeNestParentAfterDragDrop({
    flushDeferredTreeRevisionPublish: vi.fn(),
    getTreeRef: () => null,
    loadChildrenForNode,
    markNodeOpen: vi.fn(),
    nestParentDocumentId: 'missing-parent',
    nextTick: async () => undefined,
    treeData
  })
  expect(loadChildrenForNode).not.toHaveBeenCalled()
})

test('Test that before drag open lazy-loads document and template placement nodes only', async () => {
  const loadChildrenForNode = vi.fn(async () => undefined)
  const wiring = createProjectHierarchyTreeBeforeDragOpenWiring({
    lazyLoadWiring: { loadChildrenForNode }
  })
  await wiring.onBeforeDragOpen({
    data: {
      id: 'world-1',
      nodeKind: 'world'
    } as I_faProjectHierarchyTreeHeTreeNode
  })
  expect(loadChildrenForNode).not.toHaveBeenCalled()
  await wiring.onBeforeDragOpen({
    data: {
      id: 'doc-1',
      nodeKind: 'document'
    } as I_faProjectHierarchyTreeHeTreeNode
  })
  await wiring.onBeforeDragOpen({
    data: {
      id: 'place-1',
      nodeKind: 'templatePlacement'
    } as I_faProjectHierarchyTreeHeTreeNode
  })
  expect(loadChildrenForNode).toHaveBeenCalledTimes(2)
})

test('Test that tree node kind class wiring applies and clears he-tree row classes', () => {
  applyProjectHierarchyTreeTreeNodeKindClass(null, 'world')
  clearProjectHierarchyTreeTreeNodeKindClass(null)
  const treeNode = document.createElement('div')
  treeNode.classList.add('tree-node')
  const innerRow = document.createElement('div')
  treeNode.appendChild(innerRow)
  document.body.appendChild(treeNode)
  applyProjectHierarchyTreeTreeNodeKindClass(innerRow, 'group')
  expect(treeNode.classList.contains('projectHierarchyTree-treeNode--group')).toBe(true)
  clearProjectHierarchyTreeTreeNodeKindClass(innerRow)
  expect(treeNode.classList.contains('projectHierarchyTree-treeNode--group')).toBe(false)
  treeNode.remove()
})

test('Test that bind drag hold wiring rebinds host and cleans up on unmount', () => {
  const firstHost = document.createElement('div')
  const secondHost = document.createElement('div')
  const treeScrollHostRef = ref<HTMLElement | null>(firstHost)
  const handleTreeDragStartCapture = vi.fn()
  const clearHoldSession = vi.fn()
  let watchCallback: ((host: HTMLElement | null) => void) | undefined
  let unmountHook: (() => void) | undefined
  bindProjectHierarchyTreeDocumentRowDragHoldDragStartCapture({
    clearHoldSession,
    handleTreeDragStartCapture,
    onUnmounted: (hook) => {
      unmountHook = hook
    },
    treeScrollHostRef,
    watch: ((source: WatchSource<HTMLElement | null>, callback: WatchCallback<HTMLElement | null, HTMLElement | null | undefined>, options?: WatchOptions) => {
      watchCallback = (host) => {
        callback(host, undefined, () => undefined)
      }
      if (options?.immediate === true) {
        watchCallback(treeScrollHostRef.value)
      }
      return {
        pause: () => undefined,
        resume: () => undefined,
        stop: () => undefined
      }
    }) as typeof watchFn
  })
  treeScrollHostRef.value = secondHost
  watchCallback?.(secondHost)
  secondHost.dispatchEvent(new Event('dragstart', {
    bubbles: true,
    cancelable: true
  }))
  expect(handleTreeDragStartCapture).toHaveBeenCalledTimes(1)
  watchCallback?.(null)
  unmountHook?.()
  expect(clearHoldSession).toHaveBeenCalled()
})

test('Test that document row drag hold ignores non-element pointer targets', () => {
  const session = createProjectHierarchyTreeDocumentRowDragHoldSession({
    dragHandleClassName: 'projectHierarchyTree__dragHandleArmed',
    holdDelayMs: 200,
    leftPointerDownClassName: 'projectHierarchyTree__leftPointerDownArmed',
    onAllowedDocumentRowDragStart: vi.fn(),
    windowClearTimeout: (timeoutId) => {
      window.clearTimeout(timeoutId)
    },
    windowSetTimeout: (handler, delayMs) => {
      return window.setTimeout(handler, delayMs)
    }
  })
  session.handleDocumentRowPointerDown({
    currentTarget: {} as unknown as Element,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn()
  } as unknown as PointerEvent)
  expect(session.getIsDragHoldArmed()).toBe(false)
})

test('Test that document row drag hold ignores middle and right pointer buttons', () => {
  vi.useFakeTimers()
  const session = createProjectHierarchyTreeDocumentRowDragHoldSession({
    dragHandleClassName: 'projectHierarchyTree__dragHandleArmed',
    holdDelayMs: 200,
    leftPointerDownClassName: 'projectHierarchyTree__leftPointerDownArmed',
    onAllowedDocumentRowDragStart: vi.fn(),
    windowClearTimeout: (timeoutId) => {
      window.clearTimeout(timeoutId)
    },
    windowSetTimeout: (handler, delayMs) => {
      return window.setTimeout(handler, delayMs)
    }
  })
  const row = document.createElement('div')

  session.handleDocumentRowPointerDown({
    button: 1,
    currentTarget: row,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn()
  } as unknown as PointerEvent)
  session.handleDocumentRowPointerDown({
    button: 2,
    currentTarget: row,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn()
  } as unknown as PointerEvent)

  vi.advanceTimersByTime(200)
  expect(row.classList.contains('projectHierarchyTree__dragHandleArmed')).toBe(false)
  expect(row.classList.contains('projectHierarchyTree__leftPointerDownArmed')).toBe(false)
  expect(session.getIsDragHoldArmed()).toBe(false)
  vi.useRealTimers()
})

test('Test that document row drag hold pointer end is ignored after drag started from hold', () => {
  vi.useFakeTimers()
  const session = createProjectHierarchyTreeDocumentRowDragHoldSession({
    dragHandleClassName: 'projectHierarchyTree__dragHandleArmed',
    holdDelayMs: 200,
    leftPointerDownClassName: 'projectHierarchyTree__leftPointerDownArmed',
    onAllowedDocumentRowDragStart: vi.fn(),
    windowClearTimeout: (timeoutId) => {
      window.clearTimeout(timeoutId)
    },
    windowSetTimeout: (handler, delayMs) => {
      return window.setTimeout(handler, delayMs)
    }
  })
  const row = document.createElement('div')
  session.handleDocumentRowPointerDown({
    button: 0,
    currentTarget: row,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn()
  } as unknown as PointerEvent)
  vi.advanceTimersByTime(200)
  session.markDragStartedFromHold()
  window.dispatchEvent(new Event('pointerup', { bubbles: true }))
  expect(session.getIsDragHoldArmed()).toBe(true)
  window.dispatchEvent(new Event('pointercancel', { bubbles: true }))
  expect(session.getIsDragHoldArmed()).toBe(true)
  session.clearHoldSession()
  vi.useRealTimers()
})

test('Test that document row expand click gesture blocks toggle after drag started', () => {
  const isTreeDragActive = ref(false)
  const gesture = createProjectHierarchyTreeDocumentRowExpandClickGestureWiring({ isTreeDragActive })
  gesture.beginDocumentRowGesture({
    clientX: 10,
    clientY: 10
  })
  gesture.markDragStartedForGesture()
  expect(gesture.shouldDocumentRowClickToggleExpand({
    clientX: 10,
    clientY: 10
  })).toBe(false)
  gesture.clearDocumentRowGesture()
})

test('Test that document row expand click gesture blocks toggle without pointer down', () => {
  const gesture = createProjectHierarchyTreeDocumentRowExpandClickGestureWiring({
    isTreeDragActive: ref(false)
  })
  expect(gesture.shouldDocumentRowClickToggleExpand({
    clientX: 10,
    clientY: 10
  })).toBe(false)
})

test('Test that persistProjectHierarchyTreeDraggedDocumentMove refreshes when document bucket missing', async () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const refreshLayout = vi.fn(async () => undefined)
  const result = await persistProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'missing-doc',
    dragCommitSuppressWaitAttempts: 0,
    dragCommitSuppressWaitReady: true,
    dragSiblingOrderSnapshot: null,
    modelSettleAttempts: 0,
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => undefined),
    refreshLayout,
    resyncTreeDataFromLayout: vi.fn(),
    suppressTreeEmit: false,
    treeData
  })
  expect(result.committed).toBe(false)
  expect(refreshLayout).toHaveBeenCalled()
})

test('Test that persistProjectHierarchyTreeDraggedDocumentMove resyncs invalid drop parents', async () => {
  const escapedDocument = buildDocumentNode({
    documentId: 'doc-escaped',
    id: 'doc-escaped',
    placementId: 'placement-1'
  })
  const treeData = [{
    ...mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])[0]!,
    children: [escapedDocument]
  }]
  const resyncTreeDataFromLayout = vi.fn()
  const refreshLayout = vi.fn(async () => undefined)
  const result = await persistProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-escaped',
    dragCommitSuppressWaitAttempts: 0,
    dragCommitSuppressWaitReady: true,
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-escaped'],
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    modelSettleAttempts: 0,
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => undefined),
    refreshLayout,
    resyncTreeDataFromLayout,
    suppressTreeEmit: false,
    treeData
  })
  expect(result.committed).toBe(false)
  expect(resyncTreeDataFromLayout).toHaveBeenCalled()
  expect(refreshLayout).toHaveBeenCalled()
})

test('Test that persistProjectHierarchyTreeDraggedDocumentMove skips documents without placementId', async () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const invalidDoc = buildDocumentNode({
    documentId: 'doc-invalid',
    id: 'doc-invalid',
    placementId: null
  })
  mergeLoadedChildrenIntoNode(treeData, 'placement-1', [invalidDoc])
  const result = await persistProjectHierarchyTreeDraggedDocumentMove({
    documentId: 'doc-invalid',
    dragCommitSuppressWaitAttempts: 0,
    dragCommitSuppressWaitReady: true,
    dragSiblingOrderSnapshot: null,
    modelSettleAttempts: 0,
    reindexDocumentSiblingsInHierarchy: vi.fn(async () => undefined),
    refreshLayout: vi.fn(async () => undefined),
    resyncTreeDataFromLayout: vi.fn(),
    suppressTreeEmit: false,
    treeData
  })
  expect(result.committed).toBe(false)
})

test('Test that syncProjectHierarchyTreeSiblingOrderFromHeTreeGetData returns early when snapshot missing', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const synced = syncProjectHierarchyTreeSiblingOrderFromHeTreeGetData({
    draggedDocumentId: 'missing-doc',
    getTreeRef: () => ({
      closeAll: () => undefined,
      getData: () => treeData,
      openNodeAndParents: () => undefined
    }),
    treeData
  })
  expect(synced.patched).toBe(false)
  expect(synced.orderedDocumentIds).toBeNull()
})

test('Test that syncProjectHierarchyTreeSiblingOrderAfterDrop clears snapshot when resolve returns null order', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  let snapshot: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null = {
    orderedDocumentIds: ['doc-a'],
    parentDocumentId: null,
    placementId: 'placement-1'
  }
  const afterDrop = syncProjectHierarchyTreeSiblingOrderAfterDrop({
    dragStartOrderedDocumentIds: null,
    draggedDocumentId: 'doc-a',
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    setDragSiblingOrderSnapshot: (value) => {
      snapshot = value
    },
    treeData
  })
  expect(afterDrop.snapshot).toBeNull()
  expect(snapshot).toBeNull()
})

test('Test that readProjectHierarchyTreeDragSiblingOrderFromDom handles missing host and row metadata', async () => {
  const { readProjectHierarchyTreeDragSiblingOrderFromDom } = await import('../projectHierarchyTreeDragSiblingDomOrderWiring')
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => null,
    movedDocumentId: 'doc-a',
    treeData
  })).toBeNull()
  const host = document.createElement('div')
  host.setAttribute('data-test-locator', 'projectHierarchyTree-host')
  const treeRoot = document.createElement('div')
  treeRoot.className = 'projectHierarchyTree'
  const treeNode = document.createElement('div')
  treeNode.className = 'tree-node'
  const row = document.createElement('div')
  row.className = 'projectHierarchyTree__nodeRow projectHierarchyTree__nodeRow--document'
  treeNode.appendChild(row)
  treeRoot.appendChild(treeNode)
  host.appendChild(treeRoot)
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => host,
    movedDocumentId: 'doc-a',
    treeData
  })).toBeNull()
})

test('Test that resolveProjectHierarchyTreeDragSiblingOrderAtDragStart patches treeData when live order differs', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const liveTree = structuredClone(treeData)
  const placement = liveTree[0]?.children[0]
  if (placement !== undefined) {
    placement.children = [
      buildDocumentNode({
        documentId: 'doc-b',
        id: 'doc-b'
      }),
      buildDocumentNode({
        documentId: 'doc-a',
        id: 'doc-a'
      }),
      buildDocumentNode({
        documentId: 'doc-c',
        id: 'doc-c'
      })
    ]
  }
  const host = document.createElement('div')
  host.setAttribute('data-test-locator', 'projectHierarchyTree-host')
  const treeRoot = document.createElement('div')
  treeRoot.className = 'projectHierarchyTree'
  const appendRow = (documentId: string): void => {
    const treeNode = document.createElement('div')
    treeNode.className = 'tree-node'
    const row = document.createElement('div')
    row.className = 'projectHierarchyTree__nodeRow projectHierarchyTree__nodeRow--document'
    const nodeRoot = document.createElement('div')
    nodeRoot.setAttribute('data-test-hierarchy-node-id', documentId)
    row.appendChild(nodeRoot)
    treeNode.appendChild(row)
    treeRoot.appendChild(treeNode)
  }
  appendRow('doc-b')
  appendRow('doc-a')
  appendRow('doc-c')
  host.appendChild(treeRoot)
  const resolved = resolveProjectHierarchyTreeDragSiblingOrderAtDragStart({
    documentId: 'doc-a',
    getTreeRef: () => ({
      closeAll: () => undefined,
      getData: () => liveTree,
      openNodeAndParents: () => undefined
    }),
    getTreeScrollHost: () => host,
    treeData
  })
  expect(resolved.orderSource).toBe('getData')
  const placementAfter = findProjectHierarchyTreeNodeById(treeData, 'placement-1')
  expect(placementAfter?.children.map((row) => row.id)).toEqual(['doc-b', 'doc-a', 'doc-c'])
})

test('Test that computeProjectHierarchyTreeDragSiblingOrderFromHeTreeDropContext rejects invalid indexes', () => {
  dragContextState.startInfo = {
    indexBeforeDrop: Number.NaN,
    parent: null,
    tree: {}
  }
  dragContextState.targetInfo = {
    indexBeforeDrop: 0,
    parent: null,
    tree: {}
  }
  expect(computeProjectHierarchyTreeDragSiblingOrderFromHeTreeDropContext({
    dragStartOrderedDocumentIds: ['doc-a', 'doc-b'],
    movedDocumentId: 'doc-a'
  })).toBeNull()
  dragContextState.startInfo = undefined
  dragContextState.targetInfo = undefined
})

test('Test that readProjectHierarchyTreeDragSiblingOrderFromHeTreeParentStats skips non-document rows', () => {
  dragContextState.targetInfo = {
    indexBeforeDrop: 0,
    parent: {
      children: [{
        data: findProjectHierarchyTreeNodeById(
          mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]),
          'placement-1'
        )!
      }],
      data: findProjectHierarchyTreeNodeById(
        mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]),
        'placement-1'
      )!
    },
    tree: {}
  }
  expect(readProjectHierarchyTreeDragSiblingOrderFromHeTreeParentStats()).toBeNull()
  dragContextState.targetInfo = undefined
})

test('Test that applyProjectHierarchyTreeSiblingOrderToTreeData returns false for missing buckets', async () => {
  const { applyProjectHierarchyTreeSiblingOrderToTreeData, applyProjectHierarchyTreeDragCommitSiblingOrderPatch } = await import('../projectHierarchyTreeSiblingOrderPatchWiring')
  expect(applyProjectHierarchyTreeSiblingOrderToTreeData([], 'missing', ['doc-a'])).toBe(false)
  applyProjectHierarchyTreeDragCommitSiblingOrderPatch({
    committed: false,
    draggedDocumentId: 'doc-a',
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-a'],
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    treeData: []
  })
  applyProjectHierarchyTreeDragCommitSiblingOrderPatch({
    committed: true,
    draggedDocumentId: null,
    dragSiblingOrderSnapshot: null,
    treeData: []
  })
})

test('Test that applyProjectHierarchyTreeSiblingOrderToTreeData appends trailing siblings', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const placement = findProjectHierarchyTreeNodeById(treeData, 'placement-1')!
  const extraRow = buildDocumentNode({
    documentId: 'doc-extra',
    id: 'doc-extra',
    label: 'Extra'
  })
  placement.children.push(extraRow)
  const patched = applyProjectHierarchyTreeSiblingOrderToTreeData(treeData, 'doc-a', ['doc-b'])
  expect(patched).toBe(true)
  expect(placement.children.map((row) => row.id)).toEqual(['doc-b', 'doc-a', 'doc-c', 'doc-extra'])
})

test('Test that bindProjectHierarchyTreeDocumentRowDragHoldDragStartCapture cleans up on unmount', () => {
  const host = document.createElement('div')
  const treeScrollHostRef = ref<HTMLElement | null>(host)
  const handleTreeDragStartCapture = vi.fn()
  const clearHoldSession = vi.fn()
  let unmountHook: (() => void) | undefined
  bindProjectHierarchyTreeDocumentRowDragHoldDragStartCapture({
    clearHoldSession,
    handleTreeDragStartCapture,
    onUnmounted: (hook) => {
      unmountHook = hook
    },
    treeScrollHostRef,
    watch: createMockWatchForBindTest()
  })
  unmountHook?.()
  expect(clearHoldSession).toHaveBeenCalled()
})

test('Test that document row drag hold session ignores cleared pointer before timer fires', () => {
  vi.useFakeTimers()
  const session = createProjectHierarchyTreeDocumentRowDragHoldSession({
    dragHandleClassName: 'projectHierarchyTree__dragHandleArmed',
    holdDelayMs: 200,
    leftPointerDownClassName: 'projectHierarchyTree__leftPointerDownArmed',
    onAllowedDocumentRowDragStart: vi.fn(),
    windowClearTimeout: (timeoutId) => {
      window.clearTimeout(timeoutId)
    },
    windowSetTimeout: (handler, delayMs) => {
      return window.setTimeout(handler, delayMs)
    }
  })
  const row = document.createElement('div')
  session.handleDocumentRowPointerDown({
    button: 0,
    currentTarget: row,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn()
  } as unknown as PointerEvent)
  session.clearHoldSession()
  vi.advanceTimersByTime(200)
  expect(session.getIsDragHoldArmed()).toBe(false)
  vi.useRealTimers()
})

test('Test that syncProjectHierarchyTreeSiblingOrderAfterDrop keeps null snapshot when tree snapshot missing', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const invalidDoc = buildDocumentNode({
    documentId: 'doc-invalid',
    id: 'doc-invalid',
    placementId: null
  })
  mergeLoadedChildrenIntoNode(treeData, 'placement-1', [invalidDoc])
  let snapshot: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null = {
    orderedDocumentIds: ['doc-invalid'],
    parentDocumentId: null,
    placementId: 'placement-1'
  }
  const afterDrop = syncProjectHierarchyTreeSiblingOrderAfterDrop({
    dragStartOrderedDocumentIds: ['doc-invalid'],
    draggedDocumentId: 'doc-invalid',
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    setDragSiblingOrderSnapshot: (value) => {
      snapshot = value
    },
    treeData
  })
  expect(afterDrop.snapshot).toBeNull()
  expect(snapshot).toBeNull()
})

test('Test that readProjectHierarchyTreeDragSiblingOrderFromDom reads sibling bucket order from DOM', async () => {
  const { readProjectHierarchyTreeDragSiblingOrderFromDom } = await import('../projectHierarchyTreeDragSiblingDomOrderWiring')
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const host = document.createElement('div')
  const treeRoot = document.createElement('div')
  treeRoot.className = 'projectHierarchyTree'
  const parentTreeNode = document.createElement('div')
  parentTreeNode.className = 'tree-node'
  const appendDocumentRow = (documentId: string): void => {
    const treeNode = document.createElement('div')
    treeNode.className = 'tree-node'
    const row = document.createElement('div')
    row.className = 'projectHierarchyTree__nodeRow projectHierarchyTree__nodeRow--document'
    const nodeRoot = document.createElement('div')
    nodeRoot.setAttribute('data-test-hierarchy-node-id', documentId)
    row.appendChild(nodeRoot)
    treeNode.appendChild(row)
    parentTreeNode.appendChild(treeNode)
  }
  appendDocumentRow('doc-b')
  appendDocumentRow('doc-a')
  appendDocumentRow('doc-c')
  treeRoot.appendChild(parentTreeNode)
  host.appendChild(treeRoot)
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => host,
    movedDocumentId: 'doc-a',
    treeData
  })).toEqual(['doc-b', 'doc-a', 'doc-c'])
})

test('Test that applyProjectHierarchyTreeSiblingOrderToTreeData returns false when sibling rows lack document ids', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const placement = findProjectHierarchyTreeNodeById(treeData, 'placement-1')!
  placement.children = [{
    ...placement.children[0]!,
    documentId: null
  }]
  expect(applyProjectHierarchyTreeSiblingOrderToTreeData(treeData, 'doc-a', ['doc-a'])).toBe(false)
})

test('Test that applyProjectHierarchyTreeSiblingOrderToTreeData returns false for unknown moved document', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  expect(applyProjectHierarchyTreeSiblingOrderToTreeData(treeData, 'missing-doc', ['doc-a'])).toBe(false)
})

test('Test that applyProjectHierarchyTreeDragCommitSiblingOrderPatch applies committed snapshot', async () => {
  const { applyProjectHierarchyTreeDragCommitSiblingOrderPatch } = await import('../projectHierarchyTreeSiblingOrderPatchWiring')
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  applyProjectHierarchyTreeDragCommitSiblingOrderPatch({
    committed: true,
    draggedDocumentId: 'doc-a',
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-c', 'doc-a', 'doc-b'],
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    treeData
  })
  const placement = findProjectHierarchyTreeNodeById(treeData, 'placement-1')
  expect(placement?.children.map((row) => row.id)).toEqual(['doc-c', 'doc-a', 'doc-b'])
})

test('Test that syncProjectHierarchyTreeSiblingOrderAfterDrop nulls snapshot when tree snapshot invalid after computed order', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const invalidDoc = buildDocumentNode({
    documentId: 'doc-invalid',
    id: 'doc-invalid',
    placementId: null
  })
  mergeLoadedChildrenIntoNode(treeData, 'placement-1', [invalidDoc])
  const dragParent = {
    children: [{
      data: invalidDoc
    }],
    data: invalidDoc
  }
  dragContextState.startInfo = {
    indexBeforeDrop: 0,
    parent: dragParent,
    tree: {}
  }
  dragContextState.targetInfo = {
    indexBeforeDrop: 0,
    parent: dragParent,
    tree: dragContextState.startInfo.tree
  }
  let snapshot: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null = {
    orderedDocumentIds: ['doc-invalid'],
    parentDocumentId: null,
    placementId: 'placement-1'
  }
  const afterDrop = syncProjectHierarchyTreeSiblingOrderAfterDrop({
    dragStartOrderedDocumentIds: ['doc-invalid'],
    draggedDocumentId: 'doc-invalid',
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    setDragSiblingOrderSnapshot: (value) => {
      snapshot = value
    },
    treeData
  })
  expect(afterDrop.computedOrderedDocumentIds).toEqual(['doc-invalid'])
  expect(afterDrop.snapshot).toBeNull()
  expect(snapshot).toBeNull()
  dragContextState.startInfo = undefined
  dragContextState.targetInfo = undefined
})

test('Test that applyProjectHierarchyTreeDragCommitSiblingOrderPatch skips uncommitted and incomplete inputs', async () => {
  const { applyProjectHierarchyTreeDragCommitSiblingOrderPatch } = await import('../projectHierarchyTreeSiblingOrderPatchWiring')
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const before = findProjectHierarchyTreeNodeById(treeData, 'placement-1')!.children.map((row) => row.id)
  applyProjectHierarchyTreeDragCommitSiblingOrderPatch({
    committed: false,
    draggedDocumentId: 'doc-a',
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-c', 'doc-a', 'doc-b'],
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    treeData
  })
  applyProjectHierarchyTreeDragCommitSiblingOrderPatch({
    committed: true,
    draggedDocumentId: null,
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-c', 'doc-a', 'doc-b'],
      parentDocumentId: null,
      placementId: 'placement-1'
    },
    treeData
  })
  applyProjectHierarchyTreeDragCommitSiblingOrderPatch({
    committed: true,
    draggedDocumentId: 'doc-a',
    dragSiblingOrderSnapshot: null,
    treeData
  })
  expect(findProjectHierarchyTreeNodeById(treeData, 'placement-1')!.children.map((row) => row.id)).toEqual(before)
})

test('Test that applyProjectHierarchyTreeSiblingOrderToTreeData skips non-sibling rows when patching bucket', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const placement = findProjectHierarchyTreeNodeById(treeData, 'placement-1')!
  const spacer = buildDocumentNode({
    documentId: null,
    id: 'spacer-row',
    nodeKind: 'document'
  })
  placement.children = [placement.children[0]!, spacer, placement.children[1]!, placement.children[2]!]
  expect(applyProjectHierarchyTreeSiblingOrderToTreeData(treeData, 'doc-a', ['doc-c', 'doc-a', 'doc-b'])).toBe(true)
  expect(placement.children.map((row) => row.id)).toEqual(['doc-c', 'spacer-row', 'doc-a', 'doc-b'])
})

test('Test that readProjectHierarchyTreeDragSiblingOrderFromDom returns null for missing moved row and empty sibling ids', async () => {
  const { readProjectHierarchyTreeDragSiblingOrderFromDom } = await import('../projectHierarchyTreeDragSiblingDomOrderWiring')
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => document.createElement('div'),
    movedDocumentId: 'missing-doc',
    treeData
  })).toBeNull()
  const treeDataWithoutDocs = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => document.createElement('div'),
    movedDocumentId: 'doc-a',
    treeData: treeDataWithoutDocs
  })).toBeNull()
  const host = document.createElement('div')
  const treeRoot = document.createElement('div')
  treeRoot.className = 'projectHierarchyTree'
  const parentTreeNode = document.createElement('div')
  parentTreeNode.className = 'tree-node'
  const treeNode = document.createElement('div')
  treeNode.className = 'tree-node'
  const row = document.createElement('div')
  row.className = 'projectHierarchyTree__nodeRow projectHierarchyTree__nodeRow--document'
  const nodeRoot = document.createElement('div')
  nodeRoot.setAttribute('data-test-hierarchy-node-id', '')
  row.appendChild(nodeRoot)
  treeNode.appendChild(row)
  parentTreeNode.appendChild(treeNode)
  treeRoot.appendChild(parentTreeNode)
  host.appendChild(treeRoot)
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => host,
    movedDocumentId: 'doc-a',
    treeData
  })).toBeNull()
})

test('Test that document row drag hold timer no-ops when pointer already ended', () => {
  vi.useFakeTimers()
  const storedHandlers: Array<() => void> = []
  const session = createProjectHierarchyTreeDocumentRowDragHoldSession({
    dragHandleClassName: 'projectHierarchyTree__dragHandleArmed',
    holdDelayMs: 200,
    leftPointerDownClassName: 'projectHierarchyTree__leftPointerDownArmed',
    onAllowedDocumentRowDragStart: vi.fn(),
    windowClearTimeout: () => undefined,
    windowSetTimeout: (handler: () => void) => {
      storedHandlers.push(handler)
      return storedHandlers.length
    }
  })
  const row = document.createElement('div')
  session.handleDocumentRowPointerDown({
    button: 0,
    currentTarget: row,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn()
  } as unknown as PointerEvent)
  window.dispatchEvent(new Event('pointerup', { bubbles: true }))
  storedHandlers[0]?.()
  expect(session.getIsDragHoldArmed()).toBe(false)
  vi.useRealTimers()
})

test('Test that readProjectHierarchyTreeDragSiblingOrderFromDom skips invalid rows and non-sibling DOM nodes', async () => {
  const { readProjectHierarchyTreeDragSiblingOrderFromDom } = await import('../projectHierarchyTreeDragSiblingDomOrderWiring')
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const host = document.createElement('div')
  const treeRoot = document.createElement('div')
  treeRoot.className = 'projectHierarchyTree'
  const parentTreeNode = document.createElement('div')
  parentTreeNode.className = 'tree-node'
  parentTreeNode.appendChild(document.createElement('span'))
  const appendDocumentRow = (documentId: string, includeNodeId: boolean): void => {
    const treeNode = document.createElement('div')
    treeNode.className = 'tree-node'
    const row = document.createElement('div')
    row.className = 'projectHierarchyTree__nodeRow projectHierarchyTree__nodeRow--document'
    if (includeNodeId) {
      const nodeRoot = document.createElement('div')
      nodeRoot.setAttribute('data-test-hierarchy-node-id', documentId)
      row.appendChild(nodeRoot)
    }
    treeNode.appendChild(row)
    parentTreeNode.appendChild(treeNode)
  }
  appendDocumentRow('doc-a', true)
  appendDocumentRow('doc-b', false)
  appendDocumentRow('doc-c', true)
  treeRoot.appendChild(parentTreeNode)
  host.appendChild(treeRoot)
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => host,
    movedDocumentId: 'doc-a',
    treeData
  })).toEqual(['doc-a', 'doc-c'])
})

test('Test that readProjectHierarchyTreeDragSiblingOrderFromDom returns null when sibling bucket has no document ids', async () => {
  const { readProjectHierarchyTreeDragSiblingOrderFromDom } = await import('../projectHierarchyTreeDragSiblingDomOrderWiring')
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  const invalidDoc = buildDocumentNode({
    documentId: null,
    id: 'doc-invalid',
    placementId: 'placement-1'
  })
  mergeLoadedChildrenIntoNode(treeData, 'placement-1', [invalidDoc])
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => document.createElement('div'),
    movedDocumentId: 'doc-invalid',
    treeData
  })).toBeNull()
})

test('Test that readProjectHierarchyTreeDragSiblingOrderFromDom returns null when moved row is absent from DOM bucket', async () => {
  const { readProjectHierarchyTreeDragSiblingOrderFromDom } = await import('../projectHierarchyTreeDragSiblingDomOrderWiring')
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const host = document.createElement('div')
  const treeRoot = document.createElement('div')
  treeRoot.className = 'projectHierarchyTree'
  const parentTreeNode = document.createElement('div')
  parentTreeNode.className = 'tree-node'
  parentTreeNode.appendChild(document.createElement('span'))
  const treeNode = document.createElement('div')
  treeNode.className = 'tree-node'
  const row = document.createElement('div')
  row.className = 'projectHierarchyTree__nodeRow projectHierarchyTree__nodeRow--document'
  const nodeRoot = document.createElement('div')
  nodeRoot.setAttribute('data-test-hierarchy-node-id', 'doc-b')
  row.appendChild(nodeRoot)
  treeNode.appendChild(row)
  parentTreeNode.appendChild(treeNode)
  treeRoot.appendChild(parentTreeNode)
  host.appendChild(treeRoot)
  expect(readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: () => host,
    movedDocumentId: 'doc-a',
    treeData
  })).toBeNull()
})

test('Test that drag sibling order snapshot excludes add-new rows', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const placement = findProjectHierarchyTreeNodeById(treeData, 'placement-1')!
  appendOrRefreshProjectHierarchyTreeAddNewDocumentNode({
    children: placement.children,
    placement,
    preferredLanguageCode: 'en-US'
  })
  const snapshot = resolveProjectHierarchyTreeDragSiblingOrderSnapshot(treeData, 'doc-a')
  expect(snapshot?.orderedDocumentIds).toEqual(['doc-a', 'doc-b', 'doc-c'])
  expect(isProjectHierarchyTreeAddNewDocumentNode(placement.children[placement.children.length - 1]!)).toBe(true)
})

test('Test that sibling order patch keeps add-new pinned last', () => {
  const treeData = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld])
  seedPlacementDocuments(treeData)
  const placement = findProjectHierarchyTreeNodeById(treeData, 'placement-1')!
  appendOrRefreshProjectHierarchyTreeAddNewDocumentNode({
    children: placement.children,
    placement,
    preferredLanguageCode: 'en-US'
  })
  applyProjectHierarchyTreeSiblingOrderToTreeData(treeData, 'doc-a', ['doc-c', 'doc-a', 'doc-b'])
  expect(placement.children.map((row) => row.documentId)).toEqual(['doc-c', 'doc-a', 'doc-b', null])
  expect(isProjectHierarchyTreeAddNewDocumentNode(placement.children[placement.children.length - 1]!)).toBe(true)
})

test('Test that empty placement lazy load injects only add-new row', async () => {
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorld]))
  const placement = findProjectHierarchyTreeNodeById(treeData.value, 'placement-1')!
  const publishTreeRevision = vi.fn(async () => undefined)
  const listPlacementDocumentChildren = vi.fn(async () => ({
    items: []
  }))
  await loadProjectHierarchyTreeNodeChildren({
    listPlacementDocumentChildren,
    node: placement,
    preferredLanguageCode: 'en-US',
    publishTreeRevision,
    treeData
  })
  expect(listPlacementDocumentChildren).toHaveBeenCalledWith({
    placementId: 'placement-1'
  })
  expect(placement.children).toHaveLength(1)
  expect(placement.children[0]?.nodeKind).toBe('addNewDocument')
  expect(placement.children[0]?.label).toBe('Add new MISSING TRANSLATION')
})
