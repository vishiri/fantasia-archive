import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'

/**
 * Resolves a document tree node from a context-menu anchor node id.
 */
export function resolveHierarchyTreeDocumentNodeFromAnchor (
  treeData: I_faProjectHierarchyTreeHeTreeNode[],
  anchorNodeId: string
): I_faProjectHierarchyTreeHeTreeNode | null {
  const node = findProjectHierarchyTreeNodeById(treeData, anchorNodeId)
  if (node === null || node.nodeKind !== 'document' || node.documentId === null) {
    return null
  }

  return node
}

/**
 * Finds a document tree node by persisted document id.
 */
export function findProjectHierarchyTreeDocumentNodeByDocumentId (
  treeData: I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string,
  options?: {
    skipTagCopies?: boolean
  }
): I_faProjectHierarchyTreeHeTreeNode | null {
  const skipTagCopies = options?.skipTagCopies === true
  for (const node of treeData) {
    const tagId = node.tagId
    const isTagCopy = typeof tagId === 'string' && tagId.length > 0
    if (
      node.nodeKind === 'document' &&
      node.documentId === documentId &&
      !(skipTagCopies && isTagCopy)
    ) {
      return node
    }
    const nested = findProjectHierarchyTreeDocumentNodeByDocumentId(node.children, documentId, options)
    if (nested !== null) {
      return nested
    }
  }

  return null
}
