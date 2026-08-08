import type {
  I_faProjectHierarchyTreeDragCommitResult,
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeDocumentDropParentValid } from '../functions/projectHierarchyTreeDnD'
import { isProjectHierarchyTreeSameBucketSiblingReorder } from '../functions/projectHierarchyTreeSameBucketSiblingReorder'

export async function persistProjectHierarchyTreeDraggedDocumentMainTreeMove (input: {
  documentId: string
  dragSiblingOrderSnapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  movedNode: I_faProjectHierarchyTreeHeTreeNode
  orderedDocumentIds: string[]
  parentBucket: {
    parentDocumentId: string | null
    parentNode: I_faProjectHierarchyTreeHeTreeNode | null
  }
  reindexDocumentSiblingsInHierarchy: (reindexInput: {
    movedDocumentId: string
    orderedDocumentIds: string[]
    parentDocumentId: string | null
    placementId: string
  }) => Promise<unknown>
  refreshLayout: () => Promise<void>
  resyncTreeDataFromLayout: () => void
}): Promise<I_faProjectHierarchyTreeDragCommitResult> {
  if (input.movedNode.placementId === null) {
    return {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null,
      reloadChildrenNodeId: null
    }
  }
  const treeParentDocumentId = input.parentBucket.parentDocumentId
  const snapshotParentDocumentId = input.dragSiblingOrderSnapshot?.parentDocumentId ?? null
  const reindexParentDocumentId = snapshotParentDocumentId ?? treeParentDocumentId
  const nestParentDocumentId = reindexParentDocumentId
  const placementId = input.dragSiblingOrderSnapshot?.placementId ?? input.movedNode.placementId
  const sameBucketSiblingReorder = isProjectHierarchyTreeSameBucketSiblingReorder({
    snapshot: input.dragSiblingOrderSnapshot,
    treeParentDocumentId
  })
  const reloadChildrenNodeId = sameBucketSiblingReorder
    ? null
    : (reindexParentDocumentId ?? placementId)
  const dropParentValid = isProjectHierarchyTreeDocumentDropParentValid({
    parentDocumentId: input.parentBucket.parentDocumentId,
    parentNode: input.parentBucket.parentNode
  })
  if (!dropParentValid) {
    input.resyncTreeDataFromLayout()
    await input.refreshLayout()
    return {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null,
      reloadChildrenNodeId: null
    }
  }
  try {
    await input.reindexDocumentSiblingsInHierarchy({
      movedDocumentId: input.documentId,
      orderedDocumentIds: input.orderedDocumentIds,
      parentDocumentId: reindexParentDocumentId,
      placementId
    })
    return {
      committed: true,
      emptiedParentDocumentIds: [],
      nestParentDocumentId,
      reloadChildrenNodeId
    }
  } catch (error) {
    console.error('[ProjectHierarchyTree] reindexDocumentSiblingsInHierarchy failed', error)
    input.resyncTreeDataFromLayout()
    await input.refreshLayout()
    return {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null,
      reloadChildrenNodeId: null
    }
  }
}
