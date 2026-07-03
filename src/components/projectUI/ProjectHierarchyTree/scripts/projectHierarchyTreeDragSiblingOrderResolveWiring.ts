import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { areProjectHierarchyTreeOrderedDocumentIdsEqual } from '../functions/projectHierarchyTreeOrderedDocumentIdsEqual'
import { applyProjectHierarchyTreeSiblingOrderToTreeData } from './projectHierarchyTreeSiblingOrderPatchWiring'
import { readProjectHierarchyTreeDragSiblingOrderFromDom } from './projectHierarchyTreeDragSiblingDomOrderWiring'
import { readProjectHierarchyTreeDragSiblingOrderFromGetData } from './projectHierarchyTreeDragCommitOrderCaptureWiring'
import {
  computeProjectHierarchyTreeDragSiblingOrderFromHeTreeDropContext,
  readProjectHierarchyTreeDragSiblingOrderFromHeTreeParentStats
} from './projectHierarchyTreeDragPostDropOrderWiring'
import { resolveProjectHierarchyTreeDragSiblingOrderSnapshot } from './projectHierarchyTreeDragSiblingOrderSnapshotWiring'

type T_dragSiblingOrderSource = 'computed' | 'dom' | 'getData' | 'parentStats' | 'treeData'

function pickFirstSiblingOrder (candidates: Array<{
  orderSource: T_dragSiblingOrderSource
  orderedDocumentIds: string[] | null
}>): {
    orderSource: T_dragSiblingOrderSource | null
    orderedDocumentIds: string[] | null
  } {
  for (const candidate of candidates) {
    if (candidate.orderedDocumentIds !== null && candidate.orderedDocumentIds.length > 0) {
      return candidate
    }
  }
  return {
    orderSource: null,
    orderedDocumentIds: null
  }
}

/**
 * Resolves sibling order at drag start from he-tree live data (stats) before capture.
 */
export function resolveProjectHierarchyTreeDragSiblingOrderAtDragStart (input: {
  documentId: string
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}): {
    domOrderedDocumentIds: string[] | null
    getDataOrderedDocumentIds: string[] | null
    orderSource: T_dragSiblingOrderSource | null
    orderedDocumentIds: string[] | null
    treeDataOrderedDocumentIds: string[] | null
  } {
  const treeDataSnapshot = resolveProjectHierarchyTreeDragSiblingOrderSnapshot(
    input.treeData,
    input.documentId
  )
  const treeDataOrderedDocumentIds = treeDataSnapshot?.orderedDocumentIds ?? null
  const getDataOrderedDocumentIds = readProjectHierarchyTreeDragSiblingOrderFromGetData({
    documentId: input.documentId,
    getTreeRef: input.getTreeRef
  })
  const domOrderedDocumentIds = readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: input.getTreeScrollHost,
    movedDocumentId: input.documentId,
    treeData: input.treeData
  })
  const picked = pickFirstSiblingOrder([
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
      picked.orderedDocumentIds
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
 * Resolves post-drop sibling order; prefers visible DOM and he-tree stats over treeData/compute.
 */
export function resolveProjectHierarchyTreeDragSiblingOrderAfterDrop (input: {
  dragStartOrderedDocumentIds: string[] | null
  documentId: string
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}): {
    computedOrderedDocumentIds: string[] | null
    domOrderedDocumentIds: string[] | null
    orderSource: T_dragSiblingOrderSource | null
    orderedDocumentIds: string[] | null
    parentStatsOrderedDocumentIds: string[] | null
  } {
  const domOrderedDocumentIds = readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: input.getTreeScrollHost,
    movedDocumentId: input.documentId,
    treeData: input.treeData
  })
  const parentStatsOrderedDocumentIds = readProjectHierarchyTreeDragSiblingOrderFromHeTreeParentStats()
  const getDataOrderedDocumentIds = readProjectHierarchyTreeDragSiblingOrderFromGetData({
    documentId: input.documentId,
    getTreeRef: input.getTreeRef
  })
  const computedOrderedDocumentIds = computeProjectHierarchyTreeDragSiblingOrderFromHeTreeDropContext({
    dragStartOrderedDocumentIds: input.dragStartOrderedDocumentIds,
    movedDocumentId: input.documentId
  })
  const picked = pickFirstSiblingOrder([
    {
      orderSource: 'dom',
      orderedDocumentIds: domOrderedDocumentIds
    },
    {
      orderSource: 'parentStats',
      orderedDocumentIds: parentStatsOrderedDocumentIds
    },
    {
      orderSource: 'getData',
      orderedDocumentIds: getDataOrderedDocumentIds
    },
    {
      orderSource: 'computed',
      orderedDocumentIds: computedOrderedDocumentIds
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
