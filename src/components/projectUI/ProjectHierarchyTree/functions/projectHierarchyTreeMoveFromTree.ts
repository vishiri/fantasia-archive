import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * Resolves moveDocumentInHierarchy parent id from a drop target node.
 */
export function resolveProjectHierarchyTreeDropParentDocumentId (
  targetNode: I_faProjectHierarchyTreeHeTreeNode
): string | null {
  if (targetNode.nodeKind === 'document') {
    return targetNode.documentId
  }
  if (targetNode.nodeKind === 'templatePlacement') {
    return null
  }
  return null
}

/**
 * Reads sibling index for a document id under the same parent bucket in tree data.
 */
export function resolveProjectHierarchyTreeSiblingSortOrder (
  siblings: I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string
): number {
  const index = siblings.findIndex((row) => row.id === documentId)
  if (index < 0) {
    return siblings.length
  }
  return index
}
