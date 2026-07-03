import type {
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeDocumentSiblingRow } from '../functions/projectHierarchyTreeDnD'
import { findProjectHierarchyTreeDocumentParentBucket } from '../functions/projectHierarchyTreeDocumentParentBucket'

export function resolveProjectHierarchyTreeDragSiblingOrderSnapshot (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string
): I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null {
  const parentBucket = findProjectHierarchyTreeDocumentParentBucket(treeNodes, documentId)
  if (parentBucket === null) {
    return null
  }
  const siblings = parentBucket.children.filter((row) => isProjectHierarchyTreeDocumentSiblingRow(row))
  const movedNode = siblings.find((row) => row.id === documentId)
  if (movedNode === undefined || movedNode.placementId === null) {
    return null
  }
  const orderedDocumentIds: string[] = []
  for (const sibling of siblings) {
    if (sibling.documentId !== null) {
      orderedDocumentIds.push(sibling.documentId)
    }
  }
  return {
    orderedDocumentIds,
    parentDocumentId: parentBucket.parentDocumentId,
    placementId: movedNode.placementId
  }
}

export function finalizeProjectHierarchyTreeDragSiblingOrderSnapshot (input: {
  documentId: string | null
  setDragSiblingOrderSnapshot: (
    value: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  ) => void
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[]
}): I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null {
  if (input.documentId === null) {
    input.setDragSiblingOrderSnapshot(null)
    return null
  }
  const snapshot = resolveProjectHierarchyTreeDragSiblingOrderSnapshot(
    input.treeNodes,
    input.documentId
  )
  input.setDragSiblingOrderSnapshot(snapshot)
  return snapshot
}
