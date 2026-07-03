import type {
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { applyProjectHierarchyTreeSiblingOrderToTreeData } from './projectHierarchyTreeSiblingOrderPatchWiring'
import { resolveProjectHierarchyTreeDragSiblingOrderAfterDrop } from './projectHierarchyTreeDragSiblingOrderResolveWiring'
import { resolveProjectHierarchyTreeDragSiblingOrderSnapshot } from './projectHierarchyTreeDragSiblingOrderSnapshotWiring'

function buildDragSiblingOrderSnapshot (input: {
  orderedDocumentIds: string[]
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
  movedDocumentId: string
}): I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null {
  const treeDataSnapshot = resolveProjectHierarchyTreeDragSiblingOrderSnapshot(
    input.treeData,
    input.movedDocumentId
  )
  if (treeDataSnapshot === null) {
    return null
  }
  return {
    orderedDocumentIds: input.orderedDocumentIds,
    parentDocumentId: treeDataSnapshot.parentDocumentId,
    placementId: treeDataSnapshot.placementId
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
  const resolved = resolveProjectHierarchyTreeDragSiblingOrderAfterDrop({
    documentId: input.draggedDocumentId,
    dragStartOrderedDocumentIds: input.dragStartOrderedDocumentIds,
    getTreeRef: input.getTreeRef,
    getTreeScrollHost: input.getTreeScrollHost,
    treeData: input.treeData
  })
  const orderedDocumentIds = resolved.orderedDocumentIds
  let patched = false
  if (orderedDocumentIds !== null) {
    patched = applyProjectHierarchyTreeSiblingOrderToTreeData(
      input.treeData,
      input.draggedDocumentId,
      orderedDocumentIds
    )
  }
  const snapshot = orderedDocumentIds === null
    ? null
    : buildDragSiblingOrderSnapshot({
      movedDocumentId: input.draggedDocumentId,
      orderedDocumentIds,
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
