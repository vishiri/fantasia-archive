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
import { restoreProjectHierarchyTreeExpandedSnapshot } from './projectHierarchyTreeExpandedSnapshotWiring'

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
