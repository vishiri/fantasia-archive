import type {
  I_faProjectHierarchyTreeDragCommitResult,
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { persistProjectHierarchyTreeDraggedDocumentMove } from './projectHierarchyTreeDnDCommitPersistWiring'

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
