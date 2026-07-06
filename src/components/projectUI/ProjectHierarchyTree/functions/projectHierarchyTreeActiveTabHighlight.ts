import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

export function projectHierarchyTreeNodeShowsActiveTabHighlight (
  node: Pick<I_faProjectHierarchyTreeHeTreeNode, 'documentId' | 'nodeKind'>,
  activeDocumentId: string | null
): boolean {
  return (
    activeDocumentId !== null &&
    node.nodeKind === 'document' &&
    node.documentId === activeDocumentId
  )
}
