import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions,
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  applyPersistedProjectHierarchyTreeOpenNodeIds,
  collectProjectHierarchyTreePersistedExpandedNodeIds
} from '../functions/projectHierarchyTreePersistedOpenNodeIds'
import {
  expandProjectHierarchyTreeExpandedNodeIdsWithAncestors,
  findProjectHierarchyTreeNodeById,
  pruneProjectHierarchyTreeExpandedNodeIdsToAncestors,
  publishProjectHierarchyTreeRootRevision
} from '../functions/projectHierarchyTreeExpandState'
import { reapplyProjectHierarchyTreeLatentDescendantExpandState } from './projectHierarchyTreeLatentExpandReapplyWiring'
import { reapplyProjectHierarchyTreeHeTreeOpenState } from './projectHierarchyTreeUiStateWiring'

type T_treeRef = I_faProjectHierarchyTreeHeTreeInstance | null

function createLoadChildrenAlongRevealPath (deps: {
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): (nodeIds: string[]) => Promise<void> {
  return async (nodeIds: string[]) => {
    for (const nodeId of nodeIds) {
      const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
      if (node === null) {
        continue
      }
      await deps.loadChildrenForNode(node)
    }
  }
}

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
  const withAncestors = deps.restoreOptions?.includeAncestorClosure === true
    ? expandProjectHierarchyTreeExpandedNodeIdsWithAncestors(
      deps.treeData.value,
      deps.expandedNodeIds
    )
    : deps.expandedNodeIds
  const ancestorPruned = deps.restoreOptions?.skipAncestorPrune === true
    ? withAncestors
    : pruneProjectHierarchyTreeExpandedNodeIdsToAncestors(
      deps.treeData.value,
      withAncestors
    )
  const pruned = applyPersistedProjectHierarchyTreeOpenNodeIds(
    deps.treeData.value,
    ancestorPruned
  )
  deps.openNodeIds.value = new Set(pruned)
  const persistedExpandedNodeIds = collectProjectHierarchyTreePersistedExpandedNodeIds(
    deps.treeData.value,
    deps.openNodeIds.value
  )
  deps.onExpandedNodeIdsChange(persistedExpandedNodeIds)

  const loadChildrenAlongRevealPath = createLoadChildrenAlongRevealPath({
    loadChildrenForNode: deps.loadChildrenForNode,
    treeData: deps.treeData
  })
  await reapplyProjectHierarchyTreeLatentDescendantExpandState({
    getTreeRef: deps.getTreeRef,
    loadChildrenAlongRevealPath,
    openNodeIds: deps.openNodeIds,
    treeData: deps.treeData
  })
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
