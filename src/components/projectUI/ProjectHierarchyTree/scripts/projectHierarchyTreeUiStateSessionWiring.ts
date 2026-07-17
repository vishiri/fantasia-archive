import type { Ref, watch as WatchFn } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeUiStateSessionExpandWiring } from './projectHierarchyTreeUiStateSessionExpandWiring'
import { createProjectHierarchyTreeUiStateSessionRestoreWiring } from './projectHierarchyTreeUiStateSessionRestoreWiring'
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
  commitStagedLoadedChildren: () => boolean
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  queuePersistScrollTopPx: (scrollTopPx: number) => void
  requestAnimationFrame: (callback: () => void) => number
  runDeferredLazyLoadBatch: (runBatch: () => Promise<void>) => Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeMountKey: Ref<number>
  watch: typeof WatchFn
}) {
  const expandWiring = createProjectHierarchyTreeUiStateSessionExpandWiring({
    commitStagedLoadedChildren: deps.commitStagedLoadedChildren,
    flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
    getTreeRef: deps.getTreeRef,
    loadChildrenAlongRevealPath: deps.loadChildrenAlongRevealPath,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    requestAnimationFrame: deps.requestAnimationFrame,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData,
    treeMountKey: deps.treeMountKey
  })
  const restoreWiring = createProjectHierarchyTreeUiStateSessionRestoreWiring({
    flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
    getExpandedNodeIds: deps.getExpandedNodeIds,
    getPendingRevealPath: deps.getPendingRevealPath,
    getScrollTopPx: deps.getScrollTopPx,
    getTreeRef: deps.getTreeRef,
    getTreeScrollHost: deps.getTreeScrollHost,
    getWorlds: deps.getWorlds,
    loadChildrenAlongRevealPath: deps.loadChildrenAlongRevealPath,
    loadChildrenForNode: deps.loadChildrenForNode,
    markNodeOpen: expandWiring.markNodeOpen,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    requestAnimationFrame: deps.requestAnimationFrame,
    runDeferredLazyLoadBatch: deps.runDeferredLazyLoadBatch,
    treeData: deps.treeData
  })

  return {
    attachScrollPersist: () => attachProjectHierarchyTreeUiStateScrollListeners({
      getTreeScrollHost: deps.getTreeScrollHost,
      queuePersistScrollTopPx: deps.queuePersistScrollTopPx
    }),
    awaitHeTreeResyncIdle: expandWiring.awaitHeTreeResyncIdle,
    isProgrammaticHeTreeResyncActive: expandWiring.isProgrammaticHeTreeResyncActive,
    markNodeClosed: expandWiring.markNodeClosed,
    markNodeOpen: expandWiring.markNodeOpen,
    onUnmountedCleanup: () => {
      deps.flushUiStatePersist()
    },
    reapplyHeTreeOpenState: expandWiring.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: expandWiring.reapplyLatentDescendantExpandState,
    resyncHeTreeAfterExpandPublish: expandWiring.resyncHeTreeAfterExpandPublish,
    restoreExpandedSnapshot: restoreWiring.restoreExpandedSnapshot,
    restoreUiStateFromStore: restoreWiring.restoreUiStateFromStore,
    revealPendingPath: restoreWiring.revealPendingPath
  }
}
