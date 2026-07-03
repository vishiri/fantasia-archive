import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

function cloneProjectHierarchyTreeChildForPublish (
  child: I_faProjectHierarchyTreeHeTreeNode
): I_faProjectHierarchyTreeHeTreeNode {
  if (!child.childrenLoaded || child.children.length === 0) {
    return {
      ...child,
      children: [...child.children]
    }
  }
  return {
    ...child,
    children: child.children.map((nestedChild) => ({
      ...nestedChild,
      children: [...nestedChild.children]
    }))
  }
}

/**
 * Clones a lazy-loaded node and its children so he-tree receives fresh row references.
 */
export function cloneProjectHierarchyTreeLoadedNodeForPublish (
  node: I_faProjectHierarchyTreeHeTreeNode
): I_faProjectHierarchyTreeHeTreeNode {
  return {
    ...node,
    children: node.children.map(cloneProjectHierarchyTreeChildForPublish)
  }
}

export function replaceProjectHierarchyTreeNodeByIdInPlace (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  nodeId: string,
  replacement: I_faProjectHierarchyTreeHeTreeNode
): boolean {
  for (let index = 0; index < treeNodes.length; index += 1) {
    const node = treeNodes[index]
    if (node === undefined) {
      continue
    }
    if (node.id === nodeId) {
      treeNodes[index] = replacement
      return true
    }
    if (replaceProjectHierarchyTreeNodeByIdInPlace(node.children, nodeId, replacement)) {
      return true
    }
  }
  return false
}
