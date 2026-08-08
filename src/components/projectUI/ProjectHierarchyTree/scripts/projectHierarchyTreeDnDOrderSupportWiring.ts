import type {
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'
import { isProjectHierarchyTreeDocumentSiblingRow } from '../functions/projectHierarchyTreeDnD'
import { findProjectHierarchyTreeDocumentParentBucket } from '../functions/projectHierarchyTreeDocumentParentBucket'
import { ensureProjectHierarchyTreeAddNewNodePinnedToBottom } from './projectHierarchyTreeAddNewDocumentNode'

export function resolveProjectHierarchyTreeDragSiblingOrderSnapshot (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string,
  preferredNodeId: string | null = null
): I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null {
  const parentBucket = findProjectHierarchyTreeDocumentParentBucket(
    treeNodes,
    documentId,
    {
      parentDocumentId: null,
      parentNode: null
    },
    {
      preferredNodeId
    }
  )
  if (parentBucket === null) {
    return null
  }
  const siblings = parentBucket.children.filter((row) => isProjectHierarchyTreeDocumentSiblingRow(row))
  // Parent-bucket lookup already matched this document sibling row.
  const movedNode = siblings.find((row) => {
    if (preferredNodeId !== null && preferredNodeId.length > 0) {
      return row.id === preferredNodeId
    }
    return row.documentId === documentId || row.id === documentId
  })!
  const orderedDocumentIds: string[] = []
  for (const sibling of siblings) {
    if (sibling.documentId !== null) {
      orderedDocumentIds.push(sibling.documentId)
    }
  }
  if (
    parentBucket.parentNode?.nodeKind === 'tag' &&
    typeof movedNode.tagId === 'string' &&
    movedNode.tagId.length > 0
  ) {
    return {
      orderedDocumentIds,
      parentDocumentId: null,
      placementId: '',
      tagId: movedNode.tagId,
      treeNodeId: movedNode.id
    }
  }
  if (movedNode.placementId === null) {
    return null
  }
  return {
    orderedDocumentIds,
    parentDocumentId: parentBucket.parentDocumentId,
    placementId: movedNode.placementId,
    tagId: null,
    treeNodeId: movedNode.id
  }
}

export function finalizeProjectHierarchyTreeDragSiblingOrderSnapshot (input: {
  documentId: string | null
  preferredNodeId?: string | null | undefined
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
    input.documentId,
    input.preferredNodeId ?? null
  )
  input.setDragSiblingOrderSnapshot(snapshot)
  return snapshot
}

export function applyProjectHierarchyTreeSiblingOrderToTreeData (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  movedDocumentId: string,
  orderedDocumentIds: string[],
  preferredNodeId: string | null = null
): boolean {
  const parentBucket = findProjectHierarchyTreeDocumentParentBucket(
    treeNodes,
    movedDocumentId,
    {
      parentDocumentId: null,
      parentNode: null
    },
    {
      preferredNodeId
    }
  )
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
    input.dragSiblingOrderSnapshot.orderedDocumentIds,
    input.dragSiblingOrderSnapshot.treeNodeId ?? null
  )
}
