import type {
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'
import { areProjectHierarchyTreeOrderedDocumentIdsEqual } from '../functions/projectHierarchyTreeOrderedDocumentIdsEqual'
import { pickFirstProjectHierarchyTreeSiblingOrder } from '../functions/projectHierarchyTreePickFirstSiblingOrder'
import { readProjectHierarchyTreeDragSiblingOrderFromGetData } from './projectHierarchyTreeDnDOrderCaptureWiring'
import {
  computeProjectHierarchyTreeDragSiblingOrderFromHeTreeDropContext,
  readProjectHierarchyTreeDragSiblingOrderFromHeTreeParentStats,
  resolveProjectHierarchyTreeDragSiblingOrderSnapshotParentDocumentId
} from './projectHierarchyTreeDnDOrderPostDropWiring'
import {
  applyProjectHierarchyTreeSiblingOrderToTreeData,
  resolveProjectHierarchyTreeDragSiblingOrderSnapshot
} from './projectHierarchyTreeDnDOrderSupportWiring'
import { readProjectHierarchyTreeDragSiblingOrderFromDom } from './projectHierarchyTreeDnDOrderDomWiring'

type T_dragSiblingOrderSource = 'computed' | 'dom' | 'getData' | 'parentStats' | 'treeData'

/**
 * Resolves sibling order at drag start from he-tree live data (stats) before capture.
 */
export function resolveProjectHierarchyTreeDragSiblingOrderAtDragStart (input: {
  documentId: string
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  preferredNodeId?: string | null | undefined
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}): {
    domOrderedDocumentIds: string[] | null
    getDataOrderedDocumentIds: string[] | null
    orderSource: T_dragSiblingOrderSource | null
    orderedDocumentIds: string[] | null
    treeDataOrderedDocumentIds: string[] | null
  } {
  const preferredNodeId = input.preferredNodeId ?? null
  const treeDataSnapshot = resolveProjectHierarchyTreeDragSiblingOrderSnapshot(
    input.treeData,
    input.documentId,
    preferredNodeId
  )
  const treeDataOrderedDocumentIds = treeDataSnapshot?.orderedDocumentIds ?? null
  const getDataOrderedDocumentIds = readProjectHierarchyTreeDragSiblingOrderFromGetData({
    documentId: input.documentId,
    getTreeRef: input.getTreeRef,
    preferredNodeId
  })
  const domOrderedDocumentIds = readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: input.getTreeScrollHost,
    movedDocumentId: input.documentId,
    preferredNodeId,
    treeData: input.treeData
  })
  const picked = pickFirstProjectHierarchyTreeSiblingOrder([
    {
      orderSource: 'getData',
      orderedDocumentIds: getDataOrderedDocumentIds
    },
    {
      orderSource: 'dom',
      orderedDocumentIds: domOrderedDocumentIds
    },
    {
      orderSource: 'treeData',
      orderedDocumentIds: treeDataOrderedDocumentIds
    }
  ])
  if (
    picked.orderedDocumentIds !== null &&
    treeDataOrderedDocumentIds !== null &&
    picked.orderSource !== 'treeData' &&
    !areProjectHierarchyTreeOrderedDocumentIdsEqual(
      picked.orderedDocumentIds,
      treeDataOrderedDocumentIds
    )
  ) {
    applyProjectHierarchyTreeSiblingOrderToTreeData(
      input.treeData,
      input.documentId,
      picked.orderedDocumentIds,
      preferredNodeId
    )
  }
  return {
    domOrderedDocumentIds,
    getDataOrderedDocumentIds,
    orderSource: picked.orderSource,
    orderedDocumentIds: picked.orderedDocumentIds,
    treeDataOrderedDocumentIds
  }
}

/**
 * Resolves post-drop sibling order; prefers he-tree drop stats/compute over DOM.
 * DOM can still show the pre-drop placement duplicate for under-tag rows.
 */
export function resolveProjectHierarchyTreeDragSiblingOrderAfterDrop (input: {
  dragStartOrderedDocumentIds: string[] | null
  documentId: string
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  preferredNodeId?: string | null | undefined
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}): {
    computedOrderedDocumentIds: string[] | null
    domOrderedDocumentIds: string[] | null
    orderSource: T_dragSiblingOrderSource | null
    orderedDocumentIds: string[] | null
    parentStatsOrderedDocumentIds: string[] | null
  } {
  const preferredNodeId = input.preferredNodeId ?? null
  const domOrderedDocumentIds = readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: input.getTreeScrollHost,
    movedDocumentId: input.documentId,
    preferredNodeId,
    treeData: input.treeData
  })
  const parentStatsOrderedDocumentIds = readProjectHierarchyTreeDragSiblingOrderFromHeTreeParentStats()
  const getDataOrderedDocumentIds = readProjectHierarchyTreeDragSiblingOrderFromGetData({
    documentId: input.documentId,
    getTreeRef: input.getTreeRef,
    preferredNodeId
  })
  const computedOrderedDocumentIds = computeProjectHierarchyTreeDragSiblingOrderFromHeTreeDropContext({
    dragStartOrderedDocumentIds: input.dragStartOrderedDocumentIds,
    movedDocumentId: input.documentId
  })
  const picked = pickFirstProjectHierarchyTreeSiblingOrder([
    {
      orderSource: 'parentStats',
      orderedDocumentIds: parentStatsOrderedDocumentIds
    },
    {
      orderSource: 'computed',
      orderedDocumentIds: computedOrderedDocumentIds
    },
    {
      orderSource: 'dom',
      orderedDocumentIds: domOrderedDocumentIds
    },
    {
      orderSource: 'getData',
      orderedDocumentIds: getDataOrderedDocumentIds
    }
  ])
  return {
    computedOrderedDocumentIds,
    domOrderedDocumentIds,
    orderSource: picked.orderSource,
    orderedDocumentIds: picked.orderedDocumentIds,
    parentStatsOrderedDocumentIds
  }
}

function buildDragSiblingOrderSnapshot (input: {
  orderedDocumentIds: string[]
  preferredNodeId?: string | null | undefined
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
  movedDocumentId: string
}): I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null {
  const preferredNodeId = input.preferredNodeId ?? null
  const treeDataSnapshot = resolveProjectHierarchyTreeDragSiblingOrderSnapshot(
    input.treeData,
    input.movedDocumentId,
    preferredNodeId
  )
  if (treeDataSnapshot === null) {
    return null
  }
  const parentDocumentId = resolveProjectHierarchyTreeDragSiblingOrderSnapshotParentDocumentId({
    treeDataParentDocumentId: treeDataSnapshot.parentDocumentId
  })
  return {
    orderedDocumentIds: input.orderedDocumentIds,
    parentDocumentId,
    placementId: treeDataSnapshot.placementId,
    tagId: treeDataSnapshot.tagId ?? null,
    treeNodeId: treeDataSnapshot.treeNodeId ?? preferredNodeId
  }
}

/**
 * Captures post-drop sibling order synchronously in @after-drop and patches treeData in place.
 */
export function syncProjectHierarchyTreeSiblingOrderAfterDrop (input: {
  dragStartOrderedDocumentIds: string[] | null
  draggedDocumentId: string | null
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  preferredNodeId?: string | null | undefined
  setDragSiblingOrderSnapshot: (
    value: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  ) => void
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}): {
    computedOrderedDocumentIds: string[] | null
    domOrderedDocumentIds: string[] | null
    orderSource: 'computed' | 'dom' | 'getData' | 'parentStats' | 'treeData' | null
    parentStatsOrderedDocumentIds: string[] | null
    patched: boolean
    snapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  } {
  if (input.draggedDocumentId === null) {
    input.setDragSiblingOrderSnapshot(null)
    return {
      computedOrderedDocumentIds: null,
      domOrderedDocumentIds: null,
      orderSource: null,
      parentStatsOrderedDocumentIds: null,
      patched: false,
      snapshot: null
    }
  }
  const preferredNodeId = input.preferredNodeId ?? null
  const resolved = resolveProjectHierarchyTreeDragSiblingOrderAfterDrop({
    documentId: input.draggedDocumentId,
    dragStartOrderedDocumentIds: input.dragStartOrderedDocumentIds,
    getTreeRef: input.getTreeRef,
    getTreeScrollHost: input.getTreeScrollHost,
    preferredNodeId,
    treeData: input.treeData
  })
  const orderedDocumentIds = resolved.orderedDocumentIds
  let patched = false
  if (orderedDocumentIds !== null) {
    patched = applyProjectHierarchyTreeSiblingOrderToTreeData(
      input.treeData,
      input.draggedDocumentId,
      orderedDocumentIds,
      preferredNodeId
    )
  }
  const snapshot = orderedDocumentIds === null
    ? null
    : buildDragSiblingOrderSnapshot({
      movedDocumentId: input.draggedDocumentId,
      orderedDocumentIds,
      preferredNodeId,
      treeData: input.treeData
    })
  input.setDragSiblingOrderSnapshot(snapshot)
  return {
    computedOrderedDocumentIds: resolved.computedOrderedDocumentIds,
    domOrderedDocumentIds: resolved.domOrderedDocumentIds,
    orderSource: resolved.orderSource,
    parentStatsOrderedDocumentIds: resolved.parentStatsOrderedDocumentIds,
    patched,
    snapshot
  }
}
