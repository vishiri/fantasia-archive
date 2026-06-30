import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  applyExpandedNodeIdsToTree,
  collectExpandedNodeIdsFromTree,
  collectProjectHierarchyTreeDescendantIds,
  findProjectHierarchyTreeNodeById,
  pruneProjectHierarchyTreeExpandedNodeIdsToAncestors
} from '../functions/projectHierarchyTreeExpandState'

function pruneOpenNodeIdsByCollapsedVisibleRows (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  openNodeIds: ReadonlySet<string>,
  collapsedVisibleNodeIds: string[]
): Set<string> {
  const next = new Set(openNodeIds)
  for (const collapsedNodeId of collapsedVisibleNodeIds) {
    next.delete(collapsedNodeId)
    const node = findProjectHierarchyTreeNodeById(treeNodes, collapsedNodeId)
    if (node === null) {
      continue
    }
    for (const descendantId of collectProjectHierarchyTreeDescendantIds(node)) {
      next.delete(descendantId)
    }
  }
  return next
}

/**
 * Prefers live DOM expand icons over the persisted open set when building a drag snapshot.
 */
export function resolveProjectHierarchyTreeDragExpandedSnapshot (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  liveExpandedNodeIds: string[],
  collapsedVisibleNodeIds: string[],
  openNodeIds: ReadonlySet<string>,
  scrollHostPresent: boolean
): string[] {
  if (liveExpandedNodeIds.length > 0) {
    return pruneProjectHierarchyTreeExpandedNodeIdsToAncestors(
      treeNodes,
      applyExpandedNodeIdsToTree(treeNodes, liveExpandedNodeIds)
    )
  }
  if (scrollHostPresent) {
    const prunedOpenNodeIds = pruneOpenNodeIdsByCollapsedVisibleRows(
      treeNodes,
      openNodeIds,
      collapsedVisibleNodeIds
    )
    return collectExpandedNodeIdsFromTree(treeNodes, prunedOpenNodeIds)
  }
  return collectExpandedNodeIdsFromTree(treeNodes, openNodeIds)
}
