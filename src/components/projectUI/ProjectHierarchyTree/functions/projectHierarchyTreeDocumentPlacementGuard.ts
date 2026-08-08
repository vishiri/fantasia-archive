import type {
  I_faProjectHierarchyTreeDocumentInvalidPlacementParent,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

function isPersistedProjectHierarchyTreeDocumentRow (
  node: I_faProjectHierarchyTreeHeTreeNode
): boolean {
  return node.nodeKind === 'document' && node.documentId !== null
}

function isValidProjectHierarchyTreeDocumentParentKind (
  nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind'] | 'none'
): boolean {
  return nodeKind === 'templatePlacement' ||
    nodeKind === 'document' ||
    nodeKind === 'tag'
}

function collectProjectHierarchyTreeDocumentsWithInvalidPlacementParentFromNodes (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  parentNode: I_faProjectHierarchyTreeHeTreeNode | null,
  output: I_faProjectHierarchyTreeDocumentInvalidPlacementParent[]
): void {
  const parentNodeKind = parentNode?.nodeKind ?? 'none'
  for (const node of nodes) {
    if (
      isPersistedProjectHierarchyTreeDocumentRow(node) &&
      node.documentId !== null &&
      !isValidProjectHierarchyTreeDocumentParentKind(parentNodeKind)
    ) {
      output.push({
        documentId: node.documentId,
        parentNodeId: parentNode?.id ?? null,
        parentNodeKind
      })
    }
    const childNodes = Array.isArray(node.children) ? node.children : []
    if (childNodes.length > 0) {
      collectProjectHierarchyTreeDocumentsWithInvalidPlacementParentFromNodes(
        childNodes,
        node,
        output
      )
    }
  }
}

/**
 * Documents must live under templatePlacement, document, or tag parents only.
 * Tag parents are valid for mirrored documents-under-tag rows.
 */
export function findProjectHierarchyTreeDocumentsWithInvalidPlacementParent (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[]
): I_faProjectHierarchyTreeDocumentInvalidPlacementParent[] {
  const output: I_faProjectHierarchyTreeDocumentInvalidPlacementParent[] = []
  if (!Array.isArray(treeNodes)) {
    return output
  }
  collectProjectHierarchyTreeDocumentsWithInvalidPlacementParentFromNodes(
    treeNodes,
    null,
    output
  )
  return output
}
