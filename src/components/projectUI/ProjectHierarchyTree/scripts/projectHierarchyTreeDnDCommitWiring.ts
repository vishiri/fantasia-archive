import type {
  I_faProjectHierarchyTreeDragCommitResult,
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'
import { isProjectHierarchyTreeDocumentSiblingRow } from '../functions/projectHierarchyTreeDnD'
import { findProjectHierarchyTreeDocumentParentBucket } from '../functions/projectHierarchyTreeDocumentParentBucket'
import type { Ref } from 'vue'
import { findProjectHierarchyTreeDocumentNodeByDocumentId } from './projectHierarchyTreeDocumentNodeLookup'
import { persistProjectHierarchyTreeDraggedDocumentMainTreeMove } from './projectHierarchyTreeDnDCommitMainTreeWiring'
import { persistProjectHierarchyTreeDraggedDocumentUnderTagReorder } from './projectHierarchyTreeDnDCommitUnderTagWiring'

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
  const preferredNodeId = deps.dragSiblingOrderSnapshot?.treeNodeId ?? null
  const parentBucket = findProjectHierarchyTreeDocumentParentBucket(
    deps.treeData,
    deps.documentId,
    {
      parentDocumentId: null,
      parentNode: null
    },
    {
      preferredNodeId
    }
  )
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
  const movedNode = siblings.find((row) => {
    if (preferredNodeId !== null && preferredNodeId.length > 0) {
      return row.id === preferredNodeId
    }
    return row.documentId === deps.documentId || row.id === deps.documentId
  })
  if (movedNode === undefined) {
    return {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null,
      reloadChildrenNodeId: null
    }
  }
  const underTagResult = await persistProjectHierarchyTreeDraggedDocumentUnderTagReorder({
    dragSiblingOrderSnapshot: deps.dragSiblingOrderSnapshot,
    movedNode,
    parentBucketChildren: parentBucket.children,
    parentNode: parentBucket.parentNode,
    refreshLayout: deps.refreshLayout,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout
  })
  if (underTagResult !== null) {
    return underTagResult
  }
  return await persistProjectHierarchyTreeDraggedDocumentMainTreeMove({
    documentId: deps.documentId,
    dragSiblingOrderSnapshot: deps.dragSiblingOrderSnapshot,
    movedNode,
    orderedDocumentIds: readPersistSiblingOrder(siblings, deps.dragSiblingOrderSnapshot),
    parentBucket,
    reindexDocumentSiblingsInHierarchy: deps.reindexDocumentSiblingsInHierarchy,
    refreshLayout: deps.refreshLayout,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout
  })
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
  if (input.commitResult.reloadChildrenNodeId === null) {
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
