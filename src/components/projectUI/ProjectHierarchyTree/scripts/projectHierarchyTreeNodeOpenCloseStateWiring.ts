import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  collectProjectHierarchyTreeAncestorIds,
  collectProjectHierarchyTreeDescendantIds,
  evictCollapsedNodeChildren,
  findProjectHierarchyTreeNodeById,
  shouldProjectHierarchyTreePreserveDescendantOpenIdsOnCollapse
} from '../functions/projectHierarchyTreeExpandState'
import { collectProjectHierarchyTreePersistedExpandedNodeIds } from '../functions/projectHierarchyTreePersistedOpenNodeIds'

export function syncProjectHierarchyTreeOpenSetToPersist (deps: {
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): void {
  const expandedNodeIds = collectProjectHierarchyTreePersistedExpandedNodeIds(
    deps.treeData.value,
    deps.openNodeIds.value
  )
  deps.queuePersistExpandedNodeIds(expandedNodeIds)
}

export function markProjectHierarchyTreeNodeOpen (deps: {
  nodeId: string
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): void {
  const next = new Set(deps.openNodeIds.value)
  const ancestors = collectProjectHierarchyTreeAncestorIds(deps.treeData.value, deps.nodeId) ?? []
  for (const ancestorId of ancestors) {
    next.add(ancestorId)
  }
  next.add(deps.nodeId)
  deps.openNodeIds.value = next
  syncProjectHierarchyTreeOpenSetToPersist({
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    treeData: deps.treeData
  })
}

export function markProjectHierarchyTreeNodeClosed (deps: {
  node: I_faProjectHierarchyTreeHeTreeNode
  nodeId: string
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): void {
  const canonicalNode =
    findProjectHierarchyTreeNodeById(deps.treeData.value, deps.nodeId) ?? deps.node
  const next = new Set(deps.openNodeIds.value)
  next.delete(deps.nodeId)
  if (!shouldProjectHierarchyTreePreserveDescendantOpenIdsOnCollapse(canonicalNode.nodeKind)) {
    for (const descendantId of collectProjectHierarchyTreeDescendantIds(canonicalNode)) {
      next.delete(descendantId)
    }
  }
  deps.openNodeIds.value = next
  evictCollapsedNodeChildren(canonicalNode)
  syncProjectHierarchyTreeOpenSetToPersist({
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    treeData: deps.treeData
  })
}
