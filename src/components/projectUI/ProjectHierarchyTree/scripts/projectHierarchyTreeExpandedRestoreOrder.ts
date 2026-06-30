import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { collectProjectHierarchyTreeAncestorIds } from '../functions/projectHierarchyTreeExpandState'

function resolveAncestorDepth (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  nodeId: string
): number {
  const ancestors = collectProjectHierarchyTreeAncestorIds(treeNodes, nodeId)
  return ancestors?.length ?? Number.MAX_SAFE_INTEGER
}

/**
 * Parent ids before child ids so lazy-load and reopen follow tree depth.
 */
export function sortProjectHierarchyTreeExpandedNodeIdsForRestore (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  expandedNodeIds: string[]
): string[] {
  return [...expandedNodeIds].sort((leftId, rightId) => {
    const leftDepth = resolveAncestorDepth(treeNodes, leftId)
    const rightDepth = resolveAncestorDepth(treeNodes, rightId)
    if (leftDepth !== rightDepth) {
      return leftDepth - rightDepth
    }
    return leftId.localeCompare(rightId)
  })
}

/**
 * Ancestor chain plus each expanded id, deduped in walk order for lazy load.
 */
export function collectProjectHierarchyTreeLazyLoadIdsAlongExpandedPaths (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  expandedNodeIds: string[]
): string[] {
  const ordered: string[] = []
  const seen = new Set<string>()
  for (const nodeId of expandedNodeIds) {
    const ancestors = collectProjectHierarchyTreeAncestorIds(treeNodes, nodeId) ?? []
    for (const id of [...ancestors, nodeId]) {
      if (seen.has(id)) {
        continue
      }
      seen.add(id)
      ordered.push(id)
    }
  }
  return ordered
}
