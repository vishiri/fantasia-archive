import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import { isProjectHierarchyTreeDocumentSiblingRow } from '../functions/projectHierarchyTreeDnD'
import { findProjectHierarchyTreeDocumentParentBucket } from '../functions/projectHierarchyTreeDocumentParentBucket'
import {
  resolveProjectHierarchyTreeScrollHostForDomRead
} from './projectHierarchyTreeExpandDomWiring'

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
 * Under-tag rows use composite node ids (tagId__doc__documentId); map via treeData + preferredNodeId.
 */
export function readProjectHierarchyTreeDragSiblingOrderFromDom (input: {
  getTreeScrollHost: () => HTMLElement | null
  movedDocumentId: string
  preferredNodeId?: string | null | undefined
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
}): string[] | null {
  const preferredNodeId = input.preferredNodeId ?? null
  const parentBucket = findProjectHierarchyTreeDocumentParentBucket(
    input.treeData,
    input.movedDocumentId,
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
  const siblingDocumentIds = new Set<string>()
  const nodeIdToDocumentId = new Map<string, string>()
  for (const row of parentBucket.children) {
    if (!isProjectHierarchyTreeDocumentSiblingRow(row) || row.documentId === null) {
      continue
    }
    siblingDocumentIds.add(row.documentId)
    nodeIdToDocumentId.set(row.id, row.documentId)
    nodeIdToDocumentId.set(row.documentId, row.documentId)
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
    if (nodeId === null) {
      continue
    }
    const mappedDocumentId = nodeIdToDocumentId.get(nodeId)
    const matchesPreferred = preferredNodeId !== null &&
      preferredNodeId.length > 0 &&
      nodeId === preferredNodeId
    const matchesMovedDocument = nodeId === input.movedDocumentId ||
      mappedDocumentId === input.movedDocumentId
    if (!matchesPreferred && !matchesMovedDocument) {
      continue
    }
    if (preferredNodeId !== null && preferredNodeId.length > 0 && !matchesPreferred) {
      continue
    }
    movedTreeNode = row.closest('.tree-node')
    break
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
    if (nodeId === null) {
      continue
    }
    const documentId = nodeIdToDocumentId.get(nodeId)
    if (documentId === undefined || !siblingDocumentIds.has(documentId)) {
      continue
    }
    orderedDocumentIds.push(documentId)
  }
  if (orderedDocumentIds.length === 0) {
    return null
  }
  return orderedDocumentIds
}
