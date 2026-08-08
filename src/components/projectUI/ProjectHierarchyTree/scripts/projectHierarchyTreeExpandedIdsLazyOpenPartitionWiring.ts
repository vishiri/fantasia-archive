import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import { shouldReloadProjectHierarchyTreeNodeChildren } from '../functions/projectHierarchyTreeLazyLoadChildReload'

/**
 * Open ids safe for open-icon / he-tree before lazy children finish loading.
 * Nodes that still need a children fetch stay out so icons do not look expanded empty.
 */
export function partitionProjectHierarchyTreeExpandedIdsForLazyOpen (input: {
  expandedNodeIds: readonly string[]
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[]
}): {
    deferredOpenNodeIds: string[]
    immediateOpenNodeIds: string[]
  } {
  const immediateOpenNodeIds: string[] = []
  const deferredOpenNodeIds: string[] = []
  for (const nodeId of input.expandedNodeIds) {
    const node = findProjectHierarchyTreeNodeById(input.treeNodes, nodeId)
    if (node !== null && shouldReloadProjectHierarchyTreeNodeChildren(node)) {
      deferredOpenNodeIds.push(nodeId)
      continue
    }
    immediateOpenNodeIds.push(nodeId)
  }
  return {
    deferredOpenNodeIds,
    immediateOpenNodeIds
  }
}
