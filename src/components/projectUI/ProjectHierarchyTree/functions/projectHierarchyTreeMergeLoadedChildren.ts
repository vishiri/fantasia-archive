import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

function shouldKeepLoadedDocumentSubtree (
  existingChild: I_faProjectHierarchyTreeHeTreeNode
): boolean {
  return (
    existingChild.nodeKind === 'document' &&
    existingChild.childrenLoaded &&
    existingChild.children.length > 0
  )
}

function mergeIncomingChildOntoExisting (
  existingChild: I_faProjectHierarchyTreeHeTreeNode,
  incomingChild: I_faProjectHierarchyTreeHeTreeNode
): I_faProjectHierarchyTreeHeTreeNode {
  const keepLoadedSubtree = shouldKeepLoadedDocumentSubtree(existingChild)
  const nextChildren = keepLoadedSubtree ? existingChild.children : incomingChild.children
  const nextChildrenLoaded = keepLoadedSubtree
    ? existingChild.childrenLoaded
    : incomingChild.childrenLoaded
  const nextHasChildren = keepLoadedSubtree
    ? existingChild.hasChildren
    : incomingChild.hasChildren
  // Keep same object identity — he-tree stats key off these refs (H88/H89).
  Object.assign(existingChild, incomingChild, {
    children: nextChildren,
    childrenLoaded: nextChildrenLoaded,
    hasChildren: nextHasChildren
  })
  return existingChild
}

export function createMergeLoadedChildrenIntoNode (deps: {
  isAddNewDocumentNode: (
    node: Pick<I_faProjectHierarchyTreeHeTreeNode, 'id' | 'nodeKind'>
  ) => boolean
}) {
  function mergeLoadedChildrenIntoNode (
    treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
    nodeId: string,
    children: I_faProjectHierarchyTreeHeTreeNode[]
  ): boolean {
    for (const node of treeNodes) {
      if (node.id === nodeId) {
        if (node.children.length > 0) {
          const existingById = new Map(node.children.map((child) => [child.id, child]))
          node.children = children.map((incomingChild) => {
            const existingChild = existingById.get(incomingChild.id)
            if (existingChild === undefined) {
              return incomingChild
            }
            return mergeIncomingChildOntoExisting(existingChild, incomingChild)
          })
          const incomingHasAddNew = node.children.some((child) => deps.isAddNewDocumentNode(child))
          if (!incomingHasAddNew) {
            const existingAddNew = [...existingById.values()].find((child) => deps.isAddNewDocumentNode(child))
            if (existingAddNew !== undefined) {
              node.children.push(existingAddNew)
            }
          }
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

  return mergeLoadedChildrenIntoNode
}
