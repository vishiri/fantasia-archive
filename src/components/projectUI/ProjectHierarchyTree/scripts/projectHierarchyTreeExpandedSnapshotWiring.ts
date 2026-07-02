import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import type { I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  applyExpandedNodeIdsToTree,
  expandProjectHierarchyTreeExpandedNodeIdsWithAncestors,
  findProjectHierarchyTreeNodeById,
  pruneProjectHierarchyTreeExpandedNodeIdsToAncestors,
  publishProjectHierarchyTreeRootRevision
} from '../functions/projectHierarchyTreeExpandState'
import {
  collectProjectHierarchyTreeLazyLoadIdsAlongExpandedPaths,
  sortProjectHierarchyTreeExpandedNodeIdsForRestore
} from './projectHierarchyTreeExpandedRestoreOrder'
import { reapplyProjectHierarchyTreeHeTreeOpenState } from './projectHierarchyTreeUiStateWiring'

type T_treeRef = I_faProjectHierarchyTreeHeTreeInstance | null

async function reapplyExpandedSnapshotToHeTree (deps: {
  getTreeRef: () => T_treeRef
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  deps.treeData.value = publishProjectHierarchyTreeRootRevision(deps.treeData.value)
  await deps.nextTick()
  reapplyProjectHierarchyTreeHeTreeOpenState({
    getTreeRef: deps.getTreeRef,
    openNodeIds: deps.openNodeIds,
    treeData: deps.treeData
  })
}

export async function restoreProjectHierarchyTreeExpandedSnapshot (deps: {
  expandedNodeIds: string[]
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  getTreeRef: () => T_treeRef
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  nextTick: () => Promise<void>
  onExpandedNodeIdsChange: (expandedNodeIds: string[]) => void
  openNodeIds: Ref<Set<string>>
  requestAnimationFrame: (callback: () => void) => number
  restoreOptions?: I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const knownBeforePrune = applyExpandedNodeIdsToTree(
    deps.treeData.value,
    deps.expandedNodeIds
  )
  const withAncestors = deps.restoreOptions?.includeAncestorClosure === true
    ? expandProjectHierarchyTreeExpandedNodeIdsWithAncestors(
      deps.treeData.value,
      knownBeforePrune
    )
    : knownBeforePrune
  const pruned = deps.restoreOptions?.skipAncestorPrune === true
    ? withAncestors
    : pruneProjectHierarchyTreeExpandedNodeIdsToAncestors(
      deps.treeData.value,
      withAncestors
    )
  deps.openNodeIds.value = new Set(pruned)
  deps.onExpandedNodeIdsChange(pruned)

  const sortedExpandedNodeIds = sortProjectHierarchyTreeExpandedNodeIdsForRestore(
    deps.treeData.value,
    pruned
  )
  const lazyLoadNodeIds = collectProjectHierarchyTreeLazyLoadIdsAlongExpandedPaths(
    deps.treeData.value,
    sortedExpandedNodeIds
  )
  for (const nodeId of lazyLoadNodeIds) {
    const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
    if (node === null) {
      continue
    }
    await deps.loadChildrenForNode(node)
  }
  await deps.flushDeferredTreeRevisionPublish()

  const treeRef = deps.getTreeRef()
  if (treeRef === null) {
    return
  }

  const reapplyDeps = {
    getTreeRef: deps.getTreeRef,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    treeData: deps.treeData
  }
  await reapplyExpandedSnapshotToHeTree(reapplyDeps)
  await deps.nextTick()
  await new Promise<void>((resolve) => {
    deps.requestAnimationFrame(() => {
      resolve()
    })
  })
  await reapplyExpandedSnapshotToHeTree(reapplyDeps)
}
