import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * Maps ordered document ids to display labels from the current hierarchy tree snapshot.
 */
export function mapProjectHierarchyTreeDocumentLabelsForOrderedIds (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  orderedDocumentIds: readonly string[] | null
): string[] | null {
  if (orderedDocumentIds === null) {
    return null
  }
  const idToLabel = new Map<string, string>()
  function walkNodes (nodes: I_faProjectHierarchyTreeHeTreeNode[]): void {
    for (const node of nodes) {
      if (node.nodeKind === 'document' && node.documentId !== null) {
        idToLabel.set(node.documentId, node.label)
      }
      if (node.children.length > 0) {
        walkNodes(node.children)
      }
    }
  }
  walkNodes(treeNodes)
  return orderedDocumentIds.map((documentId) => idToLabel.get(documentId) ?? documentId)
}
