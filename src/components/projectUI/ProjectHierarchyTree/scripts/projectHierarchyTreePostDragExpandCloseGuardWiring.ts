import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { collectProjectHierarchyTreeAncestorIds } from '../functions/projectHierarchyTreeExpandState'

function shouldSuppressPostDragExpandNodeClose (
  treeNodes: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeNode[],
  dragExpandedSnapshotNodeIds: string[] | null,
  nodeId: string
): boolean {
  if (dragExpandedSnapshotNodeIds === null || dragExpandedSnapshotNodeIds.length === 0) {
    return false
  }
  const snapshotSet = new Set(dragExpandedSnapshotNodeIds)
  if (snapshotSet.has(nodeId)) {
    return true
  }
  for (const snapshotNodeId of dragExpandedSnapshotNodeIds) {
    const ancestors = collectProjectHierarchyTreeAncestorIds(treeNodes, snapshotNodeId)
    if (ancestors?.includes(nodeId) === true) {
      return true
    }
  }
  return false
}

export function runProjectHierarchyTreePostDragExpandCloseGuard (deps: {
  dragExpandPostCommitGuard: () => boolean
  getDragExpandedSnapshotNodeIds: () => string[] | null
  markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
  node: I_faProjectHierarchyTreeHeTreeNode
  nodeId: string
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): void {
  if (deps.dragExpandPostCommitGuard()) {
    return
  }
  const snapshotNodeIds = deps.getDragExpandedSnapshotNodeIds()
  if (
    shouldSuppressPostDragExpandNodeClose(
      deps.treeData.value,
      snapshotNodeIds,
      deps.nodeId
    )
  ) {
    return
  }
  deps.markNodeClosed(deps.nodeId, deps.node)
}
