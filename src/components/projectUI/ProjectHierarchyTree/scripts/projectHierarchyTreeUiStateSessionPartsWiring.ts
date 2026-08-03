import type { Ref } from 'vue'
import type {
  I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions,
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'
import {
  restoreProjectHierarchyTreeUiState,
  revealProjectHierarchyTreePendingPath
} from './projectHierarchyTreeUiStateWiring'
import {
  restoreProjectHierarchyTreeExpandedSnapshot
} from './projectHierarchyTreeExpandSnapshotWiring'
import {
  reapplyProjectHierarchyTreeHeTreeOpenState
} from './projectHierarchyTreeUiStateWiring'
import {
  markProjectHierarchyTreeNodeClosed,
  markProjectHierarchyTreeNodeOpen
} from './projectHierarchyTreeLatentExpandReapplyWiring'
import { createProjectHierarchyTreeHeTreeResyncController } from './projectHierarchyTreeHeTreeHelpersWiring'
import {
  reapplyProjectHierarchyTreeLatentDescendantExpandState
} from './projectHierarchyTreeLatentExpandReapplyWiring'

export function createProjectHierarchyTreeUiStateSessionRestoreWiring (deps: {
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  getExpandedNodeIds: () => string[]
  getPendingRevealPath: () => string[]
  getScrollTopPx: () => number
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  getWorlds: () => I_faProjectHierarchyTreeWorkspaceWorld[]
  loadChildrenAlongRevealPath: (nodeIds: string[]) => Promise<void>
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  markNodeOpen: (nodeId: string) => void
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  requestAnimationFrame: (callback: () => void) => number
  runDeferredLazyLoadBatch: (runBatch: () => Promise<void>) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  async function restoreExpandedSnapshot (
    expandedNodeIds: string[],
    restoreOptions?: I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ): Promise<void> {
    await restoreProjectHierarchyTreeExpandedSnapshot({
      expandedNodeIds,
      flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
      getTreeRef: deps.getTreeRef,
      loadChildrenForNode: deps.loadChildrenForNode,
      nextTick: deps.nextTick,
      onExpandedNodeIdsChange: deps.queuePersistExpandedNodeIds,
      openNodeIds: deps.openNodeIds,
      requestAnimationFrame: deps.requestAnimationFrame,
      treeData: deps.treeData,
      ...(restoreOptions === undefined ? {} : { restoreOptions })
    })
  }

  async function restoreUiStateFromStore (): Promise<void> {
    await restoreProjectHierarchyTreeUiState({
      getExpandedNodeIds: deps.getExpandedNodeIds,
      getScrollTopPx: deps.getScrollTopPx,
      getTreeRef: deps.getTreeRef,
      getTreeScrollHost: deps.getTreeScrollHost,
      getWorlds: deps.getWorlds,
      loadChildrenAlongRevealPath: deps.loadChildrenAlongRevealPath,
      nextTick: deps.nextTick,
      onExpandedNodeIdsChange: deps.queuePersistExpandedNodeIds,
      openNodeIds: deps.openNodeIds,
      requestAnimationFrame: deps.requestAnimationFrame,
      treeData: deps.treeData
    })
  }

  async function revealPendingPath (): Promise<void> {
    await revealProjectHierarchyTreePendingPath({
      getPendingRevealPath: deps.getPendingRevealPath,
      getTreeRef: deps.getTreeRef,
      getTreeScrollHost: deps.getTreeScrollHost,
      loadChildrenAlongRevealPath: deps.loadChildrenAlongRevealPath,
      markNodeOpen: deps.markNodeOpen,
      nextTick: deps.nextTick,
      requestAnimationFrame: deps.requestAnimationFrame,
      runDeferredLazyLoadBatch: deps.runDeferredLazyLoadBatch,
      treeData: deps.treeData
    })
  }

  return {
    restoreExpandedSnapshot,
    restoreUiStateFromStore,
    revealPendingPath
  }
}

async function reapplyUiStateSessionLatentDescendantExpandState (
  deps: {
    commitStagedLoadedChildren: () => boolean
    flushDeferredTreeRevisionPublish: () => void | Promise<void>
    getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
    loadChildrenAlongRevealPath: (nodeIds: string[]) => Promise<void>
    openNodeIds: Ref<Set<string>>
    treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  },
  options?: { deferHeTreeOpen?: boolean }
): Promise<void> {
  await reapplyProjectHierarchyTreeLatentDescendantExpandState({
    commitStagedLoadedChildren: deps.commitStagedLoadedChildren,
    getTreeRef: deps.getTreeRef,
    loadChildrenAlongRevealPath: deps.loadChildrenAlongRevealPath,
    openNodeIds: deps.openNodeIds,
    reapplyHeTreeOpenAfterEachPass: options?.deferHeTreeOpen !== true,
    treeData: deps.treeData
  })
}

function syncHeTreeAfterForceSublevelCollapse (deps: {
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  reapplyHeTreeOpenState: () => void
  suppressTreeEmit: Ref<boolean>
}): void {
  deps.suppressTreeEmit.value = true
  deps.getTreeRef()?.closeAll()
  deps.reapplyHeTreeOpenState()
  deps.suppressTreeEmit.value = false
}

export function createProjectHierarchyTreeUiStateSessionExpandWiring (deps: {
  commitStagedLoadedChildren: () => boolean
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  getForceSublevelCollapseInTree: () => boolean
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  loadChildrenAlongRevealPath: (nodeIds: string[]) => Promise<void>
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  requestAnimationFrame: (callback: () => void) => number
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  function markNodeOpen (nodeId: string): void {
    markProjectHierarchyTreeNodeOpen({
      nodeId,
      openNodeIds: deps.openNodeIds,
      queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
      treeData: deps.treeData
    })
  }

  function reapplyHeTreeOpenState (): void {
    reapplyProjectHierarchyTreeHeTreeOpenState({
      getTreeRef: deps.getTreeRef,
      openNodeIds: deps.openNodeIds,
      treeData: deps.treeData
    })
  }

  const heTreeResyncController = createProjectHierarchyTreeHeTreeResyncController({
    nextTick: deps.nextTick,
    suppressTreeEmit: deps.suppressTreeEmit
  })

  async function resyncHeTreeAfterExpandPublish (_nodeId: string): Promise<void> {
    await heTreeResyncController.resyncHeTreeFromPublishedTreeData()
  }

  function markNodeClosed (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode): void {
    const forceSublevelCollapseInTree = deps.getForceSublevelCollapseInTree()
    markProjectHierarchyTreeNodeClosed({
      forceSublevelCollapseInTree,
      node,
      nodeId,
      openNodeIds: deps.openNodeIds,
      queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
      treeData: deps.treeData
    })
    if (forceSublevelCollapseInTree) {
      syncHeTreeAfterForceSublevelCollapse({
        getTreeRef: deps.getTreeRef,
        reapplyHeTreeOpenState,
        suppressTreeEmit: deps.suppressTreeEmit
      })
    }
  }

  async function reapplyLatentDescendantExpandState (options?: {
    deferHeTreeOpen?: boolean
  }): Promise<void> {
    await reapplyUiStateSessionLatentDescendantExpandState(deps, options)
  }

  const awaitHeTreeResyncIdle = heTreeResyncController.awaitHeTreeResyncIdle
  const isProgrammaticHeTreeResyncActive = heTreeResyncController.isProgrammaticHeTreeResyncActive

  return {
    awaitHeTreeResyncIdle,
    isProgrammaticHeTreeResyncActive,
    markNodeClosed,
    markNodeOpen,
    reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState,
    resyncHeTreeAfterExpandPublish
  }
}
