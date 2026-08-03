import type { Ref, watch as WatchFn } from 'vue'
import type { I_faProjectHierarchyTreeHeTreeNode, I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'
import { listFaProjectPlacementDocumentChildrenForRenderer } from 'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'
import { createProjectHierarchyTreeLazyLoadWiring, runProjectHierarchyTreeDeferredLazyLoadBatch } from './projectHierarchyTreeLazyLoadWiring'
import { createProjectHierarchyTreeUiStateSessionExpandWiring, createProjectHierarchyTreeUiStateSessionRestoreWiring, attachProjectHierarchyTreeUiStateScrollListeners } from './projectHierarchyTreeUiStateSessionPartsWiring'

type T_hierarchyStore = {
  flushUiStatePersist: () => void
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  queuePersistScrollTopPx: (scrollTopPx: number) => void
}

export function createProjectHierarchyTreeLazyLoadSessionWiring (deps: {
  deferLazyLoadTreeRevisionPublish: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  flushUiStatePersist: () => void
  getExpandedNodeIds: () => string[]
  getForceSublevelCollapseInTree: () => boolean
  getPendingRevealPath: () => string[]
  getPreferredLanguageCode: () => import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  getScrollTopPx: () => number
  getTreeRef: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  getWorlds: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeWorkspaceWorld[]
  hierarchyStore: T_hierarchyStore
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  pendingRevealPath: Ref<string[]>
  requestAnimationFrame: (callback: () => void) => number
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeMountKey: Ref<number>
  watch: typeof WatchFn
}) {
  const treeRevisionPublishHooks: {
    reapplyHeTreeOpenState: (() => void) | null
  } = {
    reapplyHeTreeOpenState: null
  }

  const lazyLoadWiring = createProjectHierarchyTreeLazyLoadWiring({
    deferLazyLoadTreeRevisionPublish: deps.deferLazyLoadTreeRevisionPublish,
    getPreferredLanguageCode: deps.getPreferredLanguageCode,
    listPlacementDocumentChildren: listFaProjectPlacementDocumentChildrenForRenderer,
    nextTick: deps.nextTick,
    onAfterTreeRevisionPublished: () => {
      if (deps.deferLazyLoadTreeRevisionPublish.value) {
        return
      }
      treeRevisionPublishHooks.reapplyHeTreeOpenState?.()
    },
    shouldDeferTreeRevisionPublish: () => {
      return deps.dragExpandUiFrozen.value || deps.deferLazyLoadTreeRevisionPublish.value
    },
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  })

  const uiStateWiringHolder: {
    wiring: ReturnType<typeof createProjectHierarchyTreeUiStateSessionWiring> | null
  } = {
    wiring: null
  }

  async function runDeferredLazyLoadBatch (
    runBatch: () => Promise<void>,
    options?: { skipReapplyHeTreeOpenState?: boolean }
  ): Promise<void> {
    await runProjectHierarchyTreeDeferredLazyLoadBatch({
      deferLazyLoadTreeRevisionPublish: deps.deferLazyLoadTreeRevisionPublish,
      flushDeferredTreeRevisionPublish: () => lazyLoadWiring.flushDeferredTreeRevisionPublish(),
      nextTick: deps.nextTick,
      reapplyHeTreeOpenState: () => uiStateWiringHolder.wiring!.reapplyHeTreeOpenState(),
      runBatch,
      ...(options?.skipReapplyHeTreeOpenState === true
        ? { skipReapplyHeTreeOpenState: true }
        : {})
    })
  }

  const uiStateWiring = createProjectHierarchyTreeUiStateSessionWiring({
    commitStagedLoadedChildren: () => lazyLoadWiring.commitStagedLoadedChildren(),
    flushDeferredTreeRevisionPublish: () => lazyLoadWiring.flushDeferredTreeRevisionPublish(),
    flushUiStatePersist: deps.flushUiStatePersist,
    getExpandedNodeIds: deps.getExpandedNodeIds,
    getForceSublevelCollapseInTree: deps.getForceSublevelCollapseInTree,
    getPendingRevealPath: deps.getPendingRevealPath,
    getScrollTopPx: deps.getScrollTopPx,
    getTreeRef: deps.getTreeRef,
    getTreeScrollHost: deps.getTreeScrollHost,
    getWorlds: deps.getWorlds,
    loadChildrenAlongRevealPath: lazyLoadWiring.loadChildrenAlongRevealPath,
    loadChildrenForNode: lazyLoadWiring.loadChildrenForNode,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.hierarchyStore.queuePersistExpandedNodeIds,
    queuePersistScrollTopPx: deps.hierarchyStore.queuePersistScrollTopPx,
    requestAnimationFrame: deps.requestAnimationFrame,
    runDeferredLazyLoadBatch,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData,
    treeMountKey: deps.treeMountKey,
    watch: deps.watch
  })
  uiStateWiringHolder.wiring = uiStateWiring
  treeRevisionPublishHooks.reapplyHeTreeOpenState = () => {
    uiStateWiring.reapplyHeTreeOpenState()
  }

  return {
    lazyLoadWiring,
    runDeferredLazyLoadBatch,
    uiStateWiring
  }
}

export function createProjectHierarchyTreeUiStateSessionWiring (deps: {
  flushUiStatePersist: () => void
  getExpandedNodeIds: () => string[]
  getForceSublevelCollapseInTree: () => boolean
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
    getForceSublevelCollapseInTree: deps.getForceSublevelCollapseInTree,
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
