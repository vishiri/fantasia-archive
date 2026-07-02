import type { Ref, watch as WatchFn } from 'vue'

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
import { createProjectHierarchyTreeUiStateSessionExpandWiring } from './projectHierarchyTreeUiStateSessionExpandWiring'
import { attachProjectHierarchyTreeUiStateScrollListeners } from './projectHierarchyTreeUiStateScrollAttachWiring'

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
  treeMountKey: Ref<number>
  watch: typeof WatchFn
  windowClearTimeout: (timeoutId: number) => void
  windowSetTimeout: (handler: () => void, delayMs: number) => number
}) {
  const expandWiring = createProjectHierarchyTreeUiStateSessionExpandWiring({
    getTreeRef: deps.getTreeRef,
    loadChildrenAlongRevealPath: deps.loadChildrenAlongRevealPath,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    treeData: deps.treeData
  })
  const {
    markNodeClosed,
    markNodeOpen,
    reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState
  } = expandWiring

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
      markNodeOpen,
      nextTick: deps.nextTick,
      requestAnimationFrame: deps.requestAnimationFrame,
      treeData: deps.treeData
    })
  }

  return {
    attachScrollPersist: () => attachProjectHierarchyTreeUiStateScrollListeners({
      getTreeScrollHost: deps.getTreeScrollHost,
      queuePersistScrollTopPx: deps.queuePersistScrollTopPx
    }),
    markNodeClosed,
    markNodeOpen,
    onUnmountedCleanup: () => {
      deps.flushUiStatePersist()
    },
    reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState,
    restoreExpandedSnapshot,
    restoreUiStateFromStore,
    revealPendingPath
  }
}
