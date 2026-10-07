import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

function cloneProjectHierarchyTreeChildForPublish (
  child: I_faProjectHierarchyTreeHeTreeNode
): I_faProjectHierarchyTreeHeTreeNode {
  if (!child.childrenLoaded || child.children.length === 0) {
    const children = [...child.children]
    return {
      ...child,
      children
    }
  }
  const children = child.children.map((nestedChild) => {
    const nestedChildren = [...nestedChild.children]
    return {
      ...nestedChild,
      children: nestedChildren
    }
  })
  return {
    ...child,
    children
  }
}

/**
 * Clones a lazy-loaded node and its children so he-tree receives fresh row references.
 */
export function cloneProjectHierarchyTreeLoadedNodeForPublish (
  node: I_faProjectHierarchyTreeHeTreeNode
): I_faProjectHierarchyTreeHeTreeNode {
  const children = node.children.map(cloneProjectHierarchyTreeChildForPublish)
  return {
    ...node,
    children
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
