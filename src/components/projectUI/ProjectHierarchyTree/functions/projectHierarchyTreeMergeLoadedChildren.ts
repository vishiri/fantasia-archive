import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * Merges lazy-loaded child rows into a matching node by id.
 */
export function mergeLoadedChildrenIntoNode (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  nodeId: string,
  children: I_faProjectHierarchyTreeHeTreeNode[]
): boolean {
  for (const node of treeNodes) {
    if (node.id === nodeId) {
      if (node.childrenLoaded && node.children.length > 0) {
        const existingById = new Map(node.children.map((child) => [child.id, child]))
        node.children = children.map((incomingChild) => {
          const existingChild = existingById.get(incomingChild.id)
          if (
            existingChild?.nodeKind === 'document' &&
            existingChild.childrenLoaded &&
            existingChild.children.length > 0
          ) {
            return {
              ...incomingChild,
              children: existingChild.children,
              childrenLoaded: existingChild.childrenLoaded,
              hasChildren: existingChild.hasChildren
            }
          }
          return incomingChild
        })
      } else {
        node.children = children
      }
      node.childrenLoaded = true
      return true
    }
    if (mergeLoadedChildrenIntoNode(node.children, nodeId, children)) {
      return true
    }
  }
  return false
}
