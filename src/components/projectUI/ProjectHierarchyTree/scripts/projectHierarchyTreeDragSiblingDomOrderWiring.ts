import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeDocumentSiblingRow } from '../functions/projectHierarchyTreeDnD'
import { findProjectHierarchyTreeDocumentParentBucket } from '../functions/projectHierarchyTreeDocumentParentBucket'
import { resolveProjectHierarchyTreeScrollHostForDomRead } from './projectHierarchyTreeLiveExpandDomWiring'

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
