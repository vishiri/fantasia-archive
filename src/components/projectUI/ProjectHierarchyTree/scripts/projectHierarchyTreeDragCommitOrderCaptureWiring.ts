import type {
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { resolveProjectHierarchyTreeDragCommitOrderFallback } from './projectHierarchyTreeDragCommitOrderFallbackWiring'
import { resolveProjectHierarchyTreeDragSiblingOrderSnapshot } from './projectHierarchyTreeDragSiblingOrderSnapshotWiring'
import { readProjectHierarchyTreeHeTreeLiveData } from './projectHierarchyTreeHeTreeLiveDataWiring'

export function readProjectHierarchyTreeDragSiblingOrderFromGetData (input: {
  documentId: string | null
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
}): string[] | null {
  if (input.documentId === null) {
    return null
  }
  const liveData = readProjectHierarchyTreeHeTreeLiveData(input.getTreeRef())
  if (liveData === null) {
    return null
  }
  const snapshot = resolveProjectHierarchyTreeDragSiblingOrderSnapshot(liveData, input.documentId)
  return snapshot?.orderedDocumentIds ?? null
}

export function prepareProjectHierarchyTreeDragCommitOrderSnapshot (deps: {
  dragSiblingOrderAtDragStart: string[] | null
  draggedDocumentId: string | null
  existingDragSiblingOrderSnapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  getDataOrderReady: boolean
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  getDataSettleAttempts: number
  setDragSiblingOrderSnapshot: (
    value: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  ) => void
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}): I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null {
  if (deps.draggedDocumentId === null) {
    deps.setDragSiblingOrderSnapshot(null)
    return null
  }
  const treeDataSnapshot = resolveProjectHierarchyTreeDragSiblingOrderSnapshot(
    deps.treeData,
    deps.draggedDocumentId
  )
  if (deps.existingDragSiblingOrderSnapshot !== null) {
    return deps.existingDragSiblingOrderSnapshot
  }
  const fallback = resolveProjectHierarchyTreeDragCommitOrderFallback({
    dragSiblingOrderAtDragStart: deps.dragSiblingOrderAtDragStart,
    draggedDocumentId: deps.draggedDocumentId,
    getTreeRef: deps.getTreeRef,
    getTreeScrollHost: deps.getTreeScrollHost,
    treeData: deps.treeData,
    treeDataSnapshot
  })
  deps.setDragSiblingOrderSnapshot(fallback.commitSnapshot)
  return fallback.commitSnapshot
}
