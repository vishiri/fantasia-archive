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
  documentId: string
): I_faProjectHierarchyTreeHeTreeNode | null {
  for (const node of treeData) {
    if (node.nodeKind === 'document' && node.documentId === documentId) {
      return node
    }
    const nested = findProjectHierarchyTreeDocumentNodeByDocumentId(node.children, documentId)
    if (nested !== null) {
      return nested
    }
  }

  return null
}
