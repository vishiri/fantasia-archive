import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode, I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  attachProjectHierarchyTreeScrollPersist,
  markProjectHierarchyTreeNodeClosed,
  markProjectHierarchyTreeNodeOpen,
  reapplyProjectHierarchyTreeHeTreeOpenState,
  restoreProjectHierarchyTreeUiState,
  revealProjectHierarchyTreePendingPath
} from './projectHierarchyTreeUiStateWiring'
import { restoreProjectHierarchyTreeExpandedSnapshot } from './projectHierarchyTreeExpandedSnapshotWiring'

export function createProjectHierarchyTreeUiStateSessionWiring (deps: {
  flushUiStatePersist: () => void
  getExpandedNodeIds: () => string[]
  getPendingRevealPath: () => string[]
  getScrollTopPx: () => number
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  getWorlds: () => I_faProjectHierarchyTreeWorkspaceWorld[]
  loadChildrenAlongRevealPath: (nodeIds: string[]) => Promise<void>
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  queuePersistScrollTopPx: (scrollTopPx: number) => void
  requestAnimationFrame: (callback: () => void) => number
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

  function markNodeClosed (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode): void {
    markProjectHierarchyTreeNodeClosed({
      node,
      nodeId,
      openNodeIds: deps.openNodeIds,
      queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
      treeData: deps.treeData
    })
  }

  async function restoreExpandedSnapshot (expandedNodeIds: string[]): Promise<void> {
    await restoreProjectHierarchyTreeExpandedSnapshot({
      expandedNodeIds,
      flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
      getTreeRef: deps.getTreeRef,
      loadChildrenForNode: deps.loadChildrenForNode,
      nextTick: deps.nextTick,
      onExpandedNodeIdsChange: deps.queuePersistExpandedNodeIds,
      openNodeIds: deps.openNodeIds,
      requestAnimationFrame: deps.requestAnimationFrame,
      treeData: deps.treeData
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
      markNodeOpen,
      nextTick: deps.nextTick,
      requestAnimationFrame: deps.requestAnimationFrame,
      treeData: deps.treeData
    })
  }

  function attachScrollPersist (): () => void {
    return attachProjectHierarchyTreeScrollPersist({
      getTreeScrollHost: deps.getTreeScrollHost,
      queuePersistScrollTopPx: deps.queuePersistScrollTopPx
    })
  }

  return {
    attachScrollPersist,
    markNodeClosed,
    markNodeOpen,
    onUnmountedCleanup: () => {
      deps.flushUiStatePersist()
    },
    reapplyHeTreeOpenState: () => {
      reapplyProjectHierarchyTreeHeTreeOpenState({
        getTreeRef: deps.getTreeRef,
        openNodeIds: deps.openNodeIds,
        treeData: deps.treeData
      })
    },
    restoreExpandedSnapshot,
    restoreUiStateFromStore,
    revealPendingPath
  }
}
