import type {
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeDocumentSiblingRow } from '../functions/projectHierarchyTreeDnD'
import { ensureProjectHierarchyTreeAddNewNodePinnedToBottom } from './projectHierarchyTreeAddNewDocumentNode'
import { findProjectHierarchyTreeDocumentParentBucket } from '../functions/projectHierarchyTreeDocumentParentBucket'

export function applyProjectHierarchyTreeSiblingOrderToTreeData (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  movedDocumentId: string,
  orderedDocumentIds: string[]
): boolean {
  const parentBucket = findProjectHierarchyTreeDocumentParentBucket(treeNodes, movedDocumentId)
  if (parentBucket === null) {
    return false
  }
  const siblingRows = parentBucket.children.filter((row) => isProjectHierarchyTreeDocumentSiblingRow(row))
  const siblingsByDocumentId = new Map<string, I_faProjectHierarchyTreeHeTreeNode>()
  for (const row of siblingRows) {
    if (row.documentId !== null) {
      siblingsByDocumentId.set(row.documentId, row)
    }
  }
  const reorderedSiblingRows: I_faProjectHierarchyTreeHeTreeNode[] = []
  for (const documentId of orderedDocumentIds) {
    const row = siblingsByDocumentId.get(documentId)
    if (row !== undefined) {
      reorderedSiblingRows.push(row)
      siblingsByDocumentId.delete(documentId)
    }
  }
  for (const row of siblingsByDocumentId.values()) {
    reorderedSiblingRows.push(row)
  }
  if (reorderedSiblingRows.length === 0) {
    return false
  }
  let siblingIndex = 0
  for (let index = 0; index < parentBucket.children.length; index += 1) {
    const row = parentBucket.children[index]
    if (row === undefined || !isProjectHierarchyTreeDocumentSiblingRow(row)) {
      continue
    }
    const nextRow = reorderedSiblingRows[siblingIndex]
    if (nextRow === undefined) {
      return false
    }
    parentBucket.children[index] = nextRow
    siblingIndex += 1
  }
  ensureProjectHierarchyTreeAddNewNodePinnedToBottom(parentBucket.children)
  return siblingIndex === reorderedSiblingRows.length
}

export function applyProjectHierarchyTreeDragCommitSiblingOrderPatch (input: {
  committed: boolean
  draggedDocumentId: string | null
  dragSiblingOrderSnapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}): void {
  if (
    !input.committed ||
    input.draggedDocumentId === null ||
    input.dragSiblingOrderSnapshot === null
  ) {
    return
  }
  applyProjectHierarchyTreeSiblingOrderToTreeData(
    input.treeData,
    input.draggedDocumentId,
    input.dragSiblingOrderSnapshot.orderedDocumentIds
  )
}
