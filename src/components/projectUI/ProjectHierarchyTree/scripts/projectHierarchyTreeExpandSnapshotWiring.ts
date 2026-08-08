import type { Ref } from 'vue'
import type { I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions, I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import { applyPersistedProjectHierarchyTreeOpenNodeIds, collectProjectHierarchyTreePersistedExpandedNodeIds } from '../functions/projectHierarchyTreePersistedOpenNodeIds'
import { expandProjectHierarchyTreeExpandedNodeIdsWithAncestors, findProjectHierarchyTreeNodeById, pruneProjectHierarchyTreeExpandedNodeIdsToAncestors, collectExpandedNodeIdsFromTree, shouldProjectHierarchyTreePreserveDescendantOpenIdsOnCollapse } from '../functions/projectHierarchyTreeExpandState'
import { partitionProjectHierarchyTreeExpandedIdsForLazyOpen } from './projectHierarchyTreeExpandedIdsLazyOpenPartitionWiring'
import { shouldPersistProjectHierarchyTreeRestoredExpandedNodeIds } from '../functions/projectHierarchyTreeWorldsLayoutExpandSnapshot'
import { loadAndReapplyExpandedSnapshotAfterOpenSet } from './projectHierarchyTreeExpandSnapshotLoadReapplyWiring'
import { tryOpenHeTreeNodeAndParents } from './projectHierarchyTreeHeTreeHelpersWiring'

type T_treeRef = I_faProjectHierarchyTreeHeTreeInstance | null

export async function restoreProjectHierarchyTreeExpandedSnapshot (deps: {
  commitStagedLoadedChildren: () => boolean
  expandedNodeIds: string[]
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  getTreeRef: () => T_treeRef
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  nextTick: () => Promise<void>
  onExpandedNodeIdsChange: (expandedNodeIds: string[]) => void
  openNodeIds: Ref<Set<string>>
  requestAnimationFrame: (callback: () => void) => number
  restoreOptions?: I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  runDeferredLazyLoadBatch: (
    runBatch: () => Promise<void>,
    options?: { skipReapplyHeTreeOpenState?: boolean }
  ) => Promise<void>
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
  const { immediateOpenNodeIds } = partitionProjectHierarchyTreeExpandedIdsForLazyOpen({
    expandedNodeIds: pruned,
    treeNodes: deps.treeData.value
  })
  deps.openNodeIds.value = new Set(immediateOpenNodeIds)
  const persistedExpandedNodeIds = collectProjectHierarchyTreePersistedExpandedNodeIds(
    deps.treeData.value,
    new Set(pruned)
  )
  if (shouldPersistProjectHierarchyTreeRestoredExpandedNodeIds({
    intendedExpandedNodeIds: ancestorPruned,
    restoredExpandedNodeIds: persistedExpandedNodeIds,
    treeNodeCount: deps.treeData.value.length
  })) {
    deps.onExpandedNodeIdsChange(persistedExpandedNodeIds)
  }

  await loadAndReapplyExpandedSnapshotAfterOpenSet({
    commitStagedLoadedChildren: deps.commitStagedLoadedChildren,
    flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
    fullOpenNodeIds: pruned,
    getTreeRef: deps.getTreeRef,
    loadChildrenForNode: deps.loadChildrenForNode,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    runDeferredLazyLoadBatch: deps.runDeferredLazyLoadBatch,
    treeData: deps.treeData
  })
}

function openExpandedHeTreeNodesAfterExpand (deps: {
  nodeId: string
  openNodeIds?: ReadonlySet<string>
  resolveExpandNode: () => I_faProjectHierarchyTreeHeTreeNode
  statOpen?: { open: boolean }
  treeData?: I_faProjectHierarchyTreeHeTreeNode[]
  treeRef: I_faProjectHierarchyTreeHeTreeInstance
}): void {
  const openNode = deps.resolveExpandNode()
  tryOpenHeTreeNodeAndParents({
    node: openNode,
    ...(deps.statOpen === undefined ? {} : { statOpen: deps.statOpen }),
    treeRef: deps.treeRef
  })
  if (deps.openNodeIds === undefined || deps.treeData === undefined) {
    return
  }
  for (const expandedNodeId of collectExpandedNodeIdsFromTree(deps.treeData, deps.openNodeIds)) {
    if (expandedNodeId === deps.nodeId) {
      continue
    }
    const latentNode = findProjectHierarchyTreeNodeById(deps.treeData, expandedNodeId)
    if (latentNode === null) {
      continue
    }
    tryOpenHeTreeNodeAndParents({
      node: latentNode,
      treeRef: deps.treeRef
    })
  }
}

export async function finishProjectHierarchyTreeDeferredExpandOpen (deps: {
  commitStagedLoadedChildren?: () => boolean
  flushDeferredTreeRevisionPublish?: () => void | Promise<void>
  nodeId: string
  openNodeIds?: ReadonlySet<string>
  reapplyLatentDescendantExpandState?: (options?: {
    deferHeTreeOpen?: boolean
  }) => Promise<void>
  resyncHeTreeAfterExpandPublish?: (nodeId: string) => Promise<void>
  resolveExpandNode: () => I_faProjectHierarchyTreeHeTreeNode
  statOpen?: { open: boolean }
  treeData?: I_faProjectHierarchyTreeHeTreeNode[]
  treeRef: I_faProjectHierarchyTreeHeTreeInstance | null
}): Promise<void> {
  if (deps.reapplyLatentDescendantExpandState !== undefined) {
    const commitStaged = deps.commitStagedLoadedChildren ?? deps.flushDeferredTreeRevisionPublish
    if (commitStaged !== undefined) {
      await commitStaged()
    }
    await deps.reapplyLatentDescendantExpandState({ deferHeTreeOpen: true })
    if (deps.flushDeferredTreeRevisionPublish !== undefined) {
      await deps.flushDeferredTreeRevisionPublish()
    }
  }
  if (deps.resyncHeTreeAfterExpandPublish !== undefined) {
    await deps.resyncHeTreeAfterExpandPublish(deps.nodeId)
  }
  if (deps.treeRef === null) {
    return
  }
  openExpandedHeTreeNodesAfterExpand({
    nodeId: deps.nodeId,
    resolveExpandNode: deps.resolveExpandNode,
    treeRef: deps.treeRef,
    ...(deps.openNodeIds === undefined ? {} : { openNodeIds: deps.openNodeIds }),
    ...(deps.statOpen === undefined ? {} : { statOpen: deps.statOpen }),
    ...(deps.treeData === undefined ? {} : { treeData: deps.treeData })
  })
}

export function createProjectHierarchyTreeSessionExpandLoadBatchRunner (deps: {
  commitStagedLoadedChildren?: () => boolean
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  node: I_faProjectHierarchyTreeHeTreeNode
  reapplyLatentDescendantExpandState: (options?: {
    deferHeTreeOpen?: boolean
  }) => Promise<void>
  resolveExpandNode: () => I_faProjectHierarchyTreeHeTreeNode
  useDeferredLazyLoadBatch: boolean
  flushDeferredTreeRevisionPublish?: () => void | Promise<void>
}) {
  async function runLatentDescendantExpandState (): Promise<void> {
    if (!shouldProjectHierarchyTreePreserveDescendantOpenIdsOnCollapse(deps.node.nodeKind)) {
      return
    }
    const commitStaged = deps.commitStagedLoadedChildren ?? deps.flushDeferredTreeRevisionPublish
    if (commitStaged !== undefined) {
      await commitStaged()
    }
    await deps.reapplyLatentDescendantExpandState({
      deferHeTreeOpen: deps.useDeferredLazyLoadBatch
    })
    if (deps.flushDeferredTreeRevisionPublish !== undefined) {
      await deps.flushDeferredTreeRevisionPublish()
    }
  }

  return async function runExpandLoadBatch (): Promise<void> {
    const expandNode = deps.resolveExpandNode()
    await deps.loadChildrenForNode(expandNode)
    await runLatentDescendantExpandState()
  }
}
