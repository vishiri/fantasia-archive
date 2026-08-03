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
import type { Ref } from 'vue'
import { findProjectHierarchyTreeDocumentNodeByDocumentId } from './projectHierarchyTreeDocumentNodeLookup'

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

export function resolveProjectHierarchyTreeDragCommitSourceReloadNodeId (input: {
  dragParentDocumentIdAtDragStart: string | null
  dragSiblingOrderSnapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}): string | null {
  if (input.dragSiblingOrderSnapshot === null) {
    return null
  }
  if (input.dragParentDocumentIdAtDragStart === null) {
    return input.dragSiblingOrderSnapshot.placementId
  }
  const parentNode = findProjectHierarchyTreeDocumentNodeByDocumentId(
    input.treeData,
    input.dragParentDocumentIdAtDragStart
  )
  return parentNode?.id ?? input.dragParentDocumentIdAtDragStart
}

export async function refreshProjectHierarchyTreeDragCommitTargetContainer (input: {
  commitResult: I_faProjectHierarchyTreeDragCommitResult
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
}): Promise<void> {
  if (!input.commitResult.committed || input.commitResult.reloadChildrenNodeId === null) {
    return
  }
  await input.refreshNodeChildrenFromDatabase(input.commitResult.reloadChildrenNodeId)
}

export async function refreshProjectHierarchyTreeDragCommitSourceContainer (input: {
  committed: boolean
  dragParentDocumentIdAtDragStart: string | null
  dragSiblingOrderSnapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  parentChangedFromDragStart: boolean
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  if (!input.committed || !input.parentChangedFromDragStart) {
    return
  }
  const sourceReloadNodeId = resolveProjectHierarchyTreeDragCommitSourceReloadNodeId({
    dragParentDocumentIdAtDragStart: input.dragParentDocumentIdAtDragStart,
    dragSiblingOrderSnapshot: input.dragSiblingOrderSnapshot,
    treeData: input.treeData.value
  })
  if (sourceReloadNodeId === null) {
    return
  }
  await input.refreshNodeChildrenFromDatabase(sourceReloadNodeId)
}

export { findProjectHierarchyTreeDocumentParentBucket } from '../functions/projectHierarchyTreeDocumentParentBucket'

export async function commitProjectHierarchyTreeDraggedDocumentMove (deps: {
  documentId: string | null
  dragCommitSuppressWaitAttempts?: number
  dragCommitSuppressWaitReady?: boolean
  dragSiblingOrderSnapshot?: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  modelSettleAttempts?: number
  modelSettleReady?: boolean
  reindexDocumentSiblingsInHierarchy: (input: {
    movedDocumentId: string
    orderedDocumentIds: string[]
    parentDocumentId: string | null
    placementId: string
  }) => Promise<unknown>
  refreshLayout: () => Promise<void>
  resyncTreeDataFromLayout: () => void
  suppressTreeEmit?: boolean
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}): Promise<I_faProjectHierarchyTreeDragCommitResult> {
  const documentId = deps.documentId
  const suppressWaitAttempts = deps.dragCommitSuppressWaitAttempts ?? 0
  const suppressWaitReady = deps.dragCommitSuppressWaitReady ?? true
  const suppressTreeEmit = deps.suppressTreeEmit ?? false
  const modelSettleAttempts = deps.modelSettleAttempts ?? 0
  const modelSettleReady = deps.modelSettleReady
  const dragSiblingOrderSnapshot = deps.dragSiblingOrderSnapshot ?? null
  if (documentId === null) {
    return {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null,
      reloadChildrenNodeId: null
    }
  }
  return await persistProjectHierarchyTreeDraggedDocumentMove({
    documentId,
    dragCommitSuppressWaitAttempts: suppressWaitAttempts,
    dragCommitSuppressWaitReady: suppressWaitReady,
    dragSiblingOrderSnapshot,
    modelSettleAttempts,
    reindexDocumentSiblingsInHierarchy: deps.reindexDocumentSiblingsInHierarchy,
    refreshLayout: deps.refreshLayout,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    suppressTreeEmit,
    treeData: deps.treeData,
    ...(modelSettleReady !== undefined ? { modelSettleReady } : {})
  })
}
