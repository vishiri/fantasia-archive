import type {
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'
import { isProjectHierarchyTreeDocumentSiblingRow } from '../functions/projectHierarchyTreeDnD'
import { findProjectHierarchyTreeDocumentParentBucket } from '../functions/projectHierarchyTreeDocumentParentBucket'
import {
  resolveProjectHierarchyTreeScrollHostForDomRead
} from './projectHierarchyTreeExpandDomWiring'
import { ensureProjectHierarchyTreeAddNewNodePinnedToBottom } from './projectHierarchyTreeAddNewDocumentNode'

function readProjectHierarchyTreeNodeIdFromDocumentRow (row: Element): string | null {
  const nodeElement = row.querySelector('[data-test-hierarchy-node-id]')
  if (!(nodeElement instanceof HTMLElement)) {
    return null
  }
  const nodeId = nodeElement.getAttribute('data-test-hierarchy-node-id')
  if (nodeId === null || nodeId.length === 0) {
    return null
  }
  return nodeId
}

/**
 * Reads post-drop document sibling order from visible he-tree DOM rows.
 * he-tree modify mode may not emit update:model-value and getData may be absent on the ref.
 */
export function readProjectHierarchyTreeDragSiblingOrderFromDom (input: {
  getTreeScrollHost: () => HTMLElement | null
  movedDocumentId: string
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}): string[] | null {
  const parentBucket = findProjectHierarchyTreeDocumentParentBucket(
    input.treeData,
    input.movedDocumentId
  )
  if (parentBucket === null) {
    return null
  }
  const siblingDocumentIds = new Set<string>()
  for (const row of parentBucket.children) {
    if (!isProjectHierarchyTreeDocumentSiblingRow(row) || row.documentId === null) {
      continue
    }
    siblingDocumentIds.add(row.documentId)
  }
  if (siblingDocumentIds.size === 0) {
    return null
  }
  const host = resolveProjectHierarchyTreeScrollHostForDomRead(input.getTreeScrollHost())
  if (host === null) {
    return null
  }
  const searchRoot = host.querySelector('.projectHierarchyTree') ?? host
  const documentRows = searchRoot.querySelectorAll(
    '.projectHierarchyTree__nodeRow.projectHierarchyTree__nodeRow--document'
  )
  let movedTreeNode: Element | null = null
  for (const row of documentRows) {
    const nodeId = readProjectHierarchyTreeNodeIdFromDocumentRow(row)
    if (nodeId === input.movedDocumentId) {
      movedTreeNode = row.closest('.tree-node')
      break
    }
  }
  if (movedTreeNode === null || movedTreeNode.parentElement === null) {
    return null
  }
  const orderedDocumentIds: string[] = []
  for (const child of movedTreeNode.parentElement.children) {
    if (!child.classList.contains('tree-node')) {
      continue
    }
    const documentRow = child.querySelector('.projectHierarchyTree__nodeRow--document')
    if (documentRow === null) {
      continue
    }
    const nodeId = readProjectHierarchyTreeNodeIdFromDocumentRow(documentRow)
    if (nodeId === null || !siblingDocumentIds.has(nodeId)) {
      continue
    }
    orderedDocumentIds.push(nodeId)
  }
  if (orderedDocumentIds.length === 0) {
    return null
  }
  return orderedDocumentIds
}

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
