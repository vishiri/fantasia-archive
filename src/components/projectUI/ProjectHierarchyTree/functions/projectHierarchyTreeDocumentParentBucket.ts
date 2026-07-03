import type {
  I_faProjectHierarchyTreeDocumentParentBucket,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

export function findProjectHierarchyTreeDocumentParentBucket (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string,
  parentContext: {
    parentDocumentId: string | null
    parentNode: I_faProjectHierarchyTreeHeTreeNode | null
  } = {
    parentDocumentId: null,
    parentNode: null
  }
): I_faProjectHierarchyTreeDocumentParentBucket | null {
  for (const node of nodes) {
    if (node.nodeKind === 'document' && node.id === documentId) {
      return {
        children: nodes,
        parentDocumentId: parentContext.parentDocumentId,
        parentNode: parentContext.parentNode
      }
    }
    const parentDocumentId = node.nodeKind === 'document' ? node.documentId : null
    const nested = findProjectHierarchyTreeDocumentParentBucket(
      node.children,
      documentId,
      {
        parentDocumentId,
        parentNode: node
      }
    )
    if (nested !== null) {
      return nested
    }
  }
  return null
}
