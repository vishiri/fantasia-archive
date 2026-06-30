import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

function isLoadedDocumentChildRow (
  node: I_faProjectHierarchyTreeHeTreeNode
): boolean {
  return node.nodeKind === 'document' && node.documentId !== null
}

function countLoadedDocumentChildren (
  node: I_faProjectHierarchyTreeHeTreeNode
): number {
  return node.children.filter((child) => isLoadedDocumentChildRow(child)).length
}

/**
 * Whether the expand caret should render for a hierarchy tree row.
 */
export function projectHierarchyTreeNodeShowsOpenIcon (
  node: I_faProjectHierarchyTreeHeTreeNode,
  statChildCount: number
): boolean {
  if (node.nodeKind !== 'document') {
    return node.hasChildren || statChildCount > 0
  }
  const loadedDocumentChildCount = node.childrenLoaded
    ? countLoadedDocumentChildren(node)
    : 0
  if (node.childrenLoaded) {
    if (loadedDocumentChildCount > 0) {
      return true
    }
    return node.hasChildren && statChildCount > 0
  }
  return node.hasChildren || statChildCount > 0
}

/**
 * Reconciles document hasChildren flags with loaded child rows after drag moves.
 */
export function syncProjectHierarchyTreeDocumentHasChildrenFlags (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[]
): string[] {
  const emptiedDocumentNodeIds: string[] = []
  function walk (nodes: I_faProjectHierarchyTreeHeTreeNode[]): void {
    for (const node of nodes) {
      if (node.nodeKind === 'document' && node.childrenLoaded) {
        const documentChildCount = countLoadedDocumentChildren(node)
        const nextHasChildren = documentChildCount > 0
        if (node.hasChildren && !nextHasChildren) {
          emptiedDocumentNodeIds.push(node.id)
        }
        node.hasChildren = nextHasChildren
        if (!nextHasChildren) {
          node.children = []
          node.childrenLoaded = false
        }
      }
      walk(node.children)
    }
  }
  walk(treeNodes)
  return emptiedDocumentNodeIds
}
