import type {
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { areProjectHierarchyTreeOrderedDocumentIdsEqual } from '../functions/projectHierarchyTreeOrderedDocumentIdsEqual'
import { applyProjectHierarchyTreeSiblingOrderToTreeData } from './projectHierarchyTreeSiblingOrderPatchWiring'
import {
  computeProjectHierarchyTreeDragSiblingOrderFromHeTreeDropContext,
  readProjectHierarchyTreeDragSiblingOrderFromHeTreeParentStats
} from './projectHierarchyTreeDragPostDropOrderWiring'
import { readProjectHierarchyTreeDragSiblingOrderFromDom } from './projectHierarchyTreeDragSiblingDomOrderWiring'
import { resolveProjectHierarchyTreeDragSiblingOrderSnapshot } from './projectHierarchyTreeDragSiblingOrderSnapshotWiring'
import { readProjectHierarchyTreeHeTreeLiveData } from './projectHierarchyTreeHeTreeLiveDataWiring'

function buildSiblingOrderSnapshotFromOrderedDocumentIds (input: {
  orderedDocumentIds: string[] | null
  treeDataSnapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
}): I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null {
  if (
    input.orderedDocumentIds === null ||
    input.treeDataSnapshot === null ||
    input.orderedDocumentIds.length === 0
  ) {
    return input.treeDataSnapshot
  }
  return {
    orderedDocumentIds: input.orderedDocumentIds,
    parentDocumentId: input.treeDataSnapshot.parentDocumentId,
    placementId: input.treeDataSnapshot.placementId
  }
}

export function resolveProjectHierarchyTreeDragCommitOrderFallback (deps: {
  dragSiblingOrderAtDragStart: string[] | null
  draggedDocumentId: string
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
  treeDataSnapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
}): {
    commitSnapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
    domOrderedDocumentIds: string[] | null
    getDataSnapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
    liveData: I_faProjectHierarchyTreeHeTreeNode[] | null
    orderSource: 'computed' | 'dom' | 'getData' | 'parentStats' | 'treeData'
    parentStatsOrderedDocumentIds: string[] | null
  } {
  const parentStatsOrderedDocumentIds = readProjectHierarchyTreeDragSiblingOrderFromHeTreeParentStats()
  const computedOrderedDocumentIds = computeProjectHierarchyTreeDragSiblingOrderFromHeTreeDropContext({
    dragStartOrderedDocumentIds: deps.dragSiblingOrderAtDragStart,
    movedDocumentId: deps.draggedDocumentId
  })
  const domOrderedDocumentIds = readProjectHierarchyTreeDragSiblingOrderFromDom({
    getTreeScrollHost: deps.getTreeScrollHost,
    movedDocumentId: deps.draggedDocumentId,
    treeData: deps.treeData
  })
  const liveData = readProjectHierarchyTreeHeTreeLiveData(deps.getTreeRef())
  const getDataSnapshot = liveData === null
    ? null
    : resolveProjectHierarchyTreeDragSiblingOrderSnapshot(liveData, deps.draggedDocumentId)
  const computedSnapshot = buildSiblingOrderSnapshotFromOrderedDocumentIds({
    orderedDocumentIds: computedOrderedDocumentIds,
    treeDataSnapshot: deps.treeDataSnapshot
  })
  const parentStatsSnapshot = buildSiblingOrderSnapshotFromOrderedDocumentIds({
    orderedDocumentIds: parentStatsOrderedDocumentIds,
    treeDataSnapshot: deps.treeDataSnapshot
  })
  const domSnapshot = buildSiblingOrderSnapshotFromOrderedDocumentIds({
    orderedDocumentIds: domOrderedDocumentIds,
    treeDataSnapshot: deps.treeDataSnapshot
  })
  let orderSource: 'computed' | 'dom' | 'getData' | 'parentStats' | 'treeData' = 'treeData'
  let commitSnapshot = deps.treeDataSnapshot
  if (domSnapshot !== null && domOrderedDocumentIds !== null) {
    orderSource = 'dom'
    commitSnapshot = domSnapshot
  } else if (parentStatsSnapshot !== null && parentStatsOrderedDocumentIds !== null) {
    orderSource = 'parentStats'
    commitSnapshot = parentStatsSnapshot
  } else if (getDataSnapshot !== null) {
    orderSource = 'getData'
    commitSnapshot = getDataSnapshot
  } else if (computedSnapshot !== null && computedOrderedDocumentIds !== null) {
    orderSource = 'computed'
    commitSnapshot = computedSnapshot
  }
  if (
    commitSnapshot !== null &&
    orderSource !== 'treeData' &&
    deps.treeDataSnapshot !== null &&
    !areProjectHierarchyTreeOrderedDocumentIdsEqual(
      commitSnapshot.orderedDocumentIds,
      deps.treeDataSnapshot.orderedDocumentIds
    )
  ) {
    applyProjectHierarchyTreeSiblingOrderToTreeData(
      deps.treeData,
      deps.draggedDocumentId,
      commitSnapshot.orderedDocumentIds
    )
  }
  return {
    commitSnapshot,
    domOrderedDocumentIds,
    getDataSnapshot,
    liveData,
    orderSource,
    parentStatsOrderedDocumentIds
  }
}
