import type {
  I_faProjectHierarchyTreeDragCommitResult,
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  isProjectHierarchyTreeDocumentDropParentValid,
  isProjectHierarchyTreeDocumentSiblingRow
} from '../functions/projectHierarchyTreeDnD'
import { isProjectHierarchyTreeSameBucketSiblingReorder } from '../functions/projectHierarchyTreeSameBucketSiblingReorder'
import { findProjectHierarchyTreeDocumentParentBucket } from '../functions/projectHierarchyTreeDocumentParentBucket'
type T_persistDragMoveDeps = {
  documentId: string
  dragCommitSuppressWaitAttempts: number
  dragCommitSuppressWaitReady: boolean
  dragSiblingOrderSnapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  modelSettleAttempts: number
  modelSettleReady?: boolean
  reindexDocumentSiblingsInHierarchy: (input: {
    movedDocumentId: string
    orderedDocumentIds: string[]
    parentDocumentId: string | null
    placementId: string
  }) => Promise<unknown>
  refreshLayout: () => Promise<void>
  resyncTreeDataFromLayout: () => void
  suppressTreeEmit: boolean
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}

function readPersistSiblingOrder (
  siblings: I_faProjectHierarchyTreeHeTreeNode[],
  snapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
): string[] {
  if (snapshot !== null) {
    return snapshot.orderedDocumentIds
  }
  return siblings.flatMap((row) => {
    return row.documentId === null ? [] : [row.documentId]
  })
}

export async function persistProjectHierarchyTreeDraggedDocumentMove (
  deps: T_persistDragMoveDeps
): Promise<I_faProjectHierarchyTreeDragCommitResult> {
  const parentBucket = findProjectHierarchyTreeDocumentParentBucket(deps.treeData, deps.documentId)
  if (parentBucket === null) {
    await deps.refreshLayout()
    return {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null,
      reloadChildrenNodeId: null
    }
  }
  const siblings = parentBucket.children.filter((row) => isProjectHierarchyTreeDocumentSiblingRow(row))
  const movedNode = siblings.find((row) => row.id === deps.documentId)
  if (movedNode === undefined || movedNode.placementId === null) {
    return {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null,
      reloadChildrenNodeId: null
    }
  }
  const treeParentDocumentId = parentBucket.parentDocumentId
  const snapshotParentDocumentId = deps.dragSiblingOrderSnapshot?.parentDocumentId ?? null
  const reindexParentDocumentId = snapshotParentDocumentId ?? treeParentDocumentId
  const nestParentDocumentId = reindexParentDocumentId
  const placementId = deps.dragSiblingOrderSnapshot?.placementId ?? movedNode.placementId
  const sameBucketSiblingReorder = isProjectHierarchyTreeSameBucketSiblingReorder({
    snapshot: deps.dragSiblingOrderSnapshot,
    treeParentDocumentId
  })
  const reloadChildrenNodeId = sameBucketSiblingReorder
    ? null
    : (reindexParentDocumentId ?? placementId)
  const dropParentValid = isProjectHierarchyTreeDocumentDropParentValid({
    parentDocumentId: parentBucket.parentDocumentId,
    parentNode: parentBucket.parentNode
  })
  if (!dropParentValid) {
    deps.resyncTreeDataFromLayout()
    await deps.refreshLayout()
    return {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null,
      reloadChildrenNodeId: null
    }
  }
  const orderedDocumentIds = readPersistSiblingOrder(siblings, deps.dragSiblingOrderSnapshot)
  try {
    await deps.reindexDocumentSiblingsInHierarchy({
      movedDocumentId: deps.documentId,
      orderedDocumentIds,
      parentDocumentId: reindexParentDocumentId,
      placementId
    })
    const commitResult = {
      committed: true,
      emptiedParentDocumentIds: [],
      nestParentDocumentId,
      reloadChildrenNodeId
    }
    return commitResult
  } catch (error) {
    console.error('[ProjectHierarchyTree] reindexDocumentSiblingsInHierarchy failed', error)
    deps.resyncTreeDataFromLayout()
    await deps.refreshLayout()
    return {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null,
      reloadChildrenNodeId: null
    }
  }
}
