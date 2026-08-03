import type { Ref, watch as WatchFn } from 'vue'
import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode, I_faProjectHierarchyTreeUiState, I_faProjectHierarchyTreeWorkspaceWorld, I_faProjectHierarchyTreeDocumentChild } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { createProjectHierarchyTreeDocumentRowDragHoldWiring, createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import { createProjectHierarchyTreeBeforeDragOpenWiring, createProjectHierarchyTreeDnDWiring } from './projectHierarchyTreeDnDWiring'
import { createProjectHierarchyTreeLazyLoadSessionWiring } from './projectHierarchyTreeLazyLoadSessionWiring'
import { createProjectHierarchyTreeOpenIconExpandAnimationWiring } from './projectHierarchyTreeExpandDomWiring'
import { createProjectHierarchyTreeSyncWiring } from './projectHierarchyTreeSyncMapperWiring'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'

type T_hierarchyStore = {
  flushUiStatePersist: () => void
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  queuePersistScrollTopPx: (scrollTopPx: number) => void
  refreshLayout: () => Promise<void>
}

type T_sessionSubWiringDeps = {
  computed: <T>(getter: () => T) => { value: T }
  documentRowDragHoldWiring: ReturnType<typeof createProjectHierarchyTreeDocumentRowDragHoldWiring>
  documentRowExpandClickGesture: ReturnType<typeof createProjectHierarchyTreeDocumentRowExpandClickGestureWiring>
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  deferLazyLoadTreeRevisionPublish: Ref<boolean>
  getPreferredLanguageCode: () => import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  getForceSublevelCollapseInTree: () => boolean
  hierarchyStore: T_hierarchyStore
  isTreeDragActive: Ref<boolean>
  nextTick: () => Promise<void>
  onUnmounted?: (hook: () => void) => void
  openNodeIds: Ref<Set<string>>
  pendingRevealPath: Ref<string[]>
  ref: <T>(initial: T) => Ref<T>
  suppressTreeEmit: Ref<boolean>
  treeComponentRef: Ref<I_faProjectHierarchyTreeHeTreeInstance | null>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeMountKey: Ref<number>
  treeScrollHostRef: Ref<HTMLElement | null>
  uiState: Ref<I_faProjectHierarchyTreeUiState>
  watch: typeof WatchFn
  worlds: Ref<I_faProjectHierarchyTreeWorkspaceWorld[]>
}

function createProjectHierarchyTreeSessionLoadAndOpenIconWiring (deps: T_sessionSubWiringDeps) {
  const syncWiring = createProjectHierarchyTreeSyncWiring({
    getPreferredLanguageCode: deps.getPreferredLanguageCode,
    getWorlds: () => deps.worlds.value,
    nextTick: deps.nextTick,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  })
  const loadSessionWiring = createProjectHierarchyTreeLazyLoadSessionWiring({
    deferLazyLoadTreeRevisionPublish: deps.deferLazyLoadTreeRevisionPublish,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    flushUiStatePersist: () => deps.hierarchyStore.flushUiStatePersist(),
    getExpandedNodeIds: () => deps.uiState.value.expandedNodeIds,
    getForceSublevelCollapseInTree: deps.getForceSublevelCollapseInTree,
    getPendingRevealPath: () => deps.pendingRevealPath.value,
    getPreferredLanguageCode: deps.getPreferredLanguageCode,
    getScrollTopPx: () => deps.uiState.value.scrollTopPx,
    getTreeRef: () => deps.treeComponentRef.value,
    getTreeScrollHost: () => deps.treeScrollHostRef.value,
    getWorlds: () => deps.worlds.value,
    hierarchyStore: deps.hierarchyStore,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    pendingRevealPath: deps.pendingRevealPath,
    requestAnimationFrame: (callback) => window.requestAnimationFrame(callback),
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData,
    treeMountKey: deps.treeMountKey,
    watch: deps.watch
  })
  const { lazyLoadWiring, runDeferredLazyLoadBatch, uiStateWiring } = loadSessionWiring
  const openIconExpandAnimationWiring = createProjectHierarchyTreeOpenIconExpandAnimationWiring({
    clearTimeout: (timeoutId) => {
      window.clearTimeout(timeoutId)
    },
    onUnmounted: deps.onUnmounted ?? (() => undefined),
    openNodeIds: deps.openNodeIds,
    ref: deps.ref,
    setTimeout: (handler, delayMs) => {
      return window.setTimeout(handler, delayMs)
    }
  })
  return {
    lazyLoadWiring,
    openIconExpandAnimationWiring,
    runDeferredLazyLoadBatch,
    syncWiring,
    uiStateWiring
  }
}

export function createProjectHierarchyTreeSessionSubWiring (deps: T_sessionSubWiringDeps) {
  const {
    lazyLoadWiring,
    openIconExpandAnimationWiring,
    runDeferredLazyLoadBatch,
    syncWiring,
    uiStateWiring
  } = createProjectHierarchyTreeSessionLoadAndOpenIconWiring(deps)
  const beforeDragOpenWiring = createProjectHierarchyTreeBeforeDragOpenWiring({
    lazyLoadWiring
  })
  const dndWiring = createProjectHierarchyTreeSessionDnDSubWiring({
    documentRowDragHoldWiring: deps.documentRowDragHoldWiring,
    documentRowExpandClickGesture: deps.documentRowExpandClickGesture,
    dragCommitPending: deps.dragCommitPending,
    dragCommitScheduled: deps.dragCommitScheduled,
    dragDropCommitted: deps.dragDropCommitted,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    flushDeferredTreeRevisionPublish: lazyLoadWiring.flushDeferredTreeRevisionPublish,
    flushUiStatePersist: () => deps.hierarchyStore.flushUiStatePersist(),
    getTreeRef: () => deps.treeComponentRef.value,
    getTreeScrollHost: () => deps.treeScrollHostRef.value,
    hierarchyStore: deps.hierarchyStore,
    isTreeDragActive: deps.isTreeDragActive,
    loadChildrenForNode: lazyLoadWiring.loadChildrenForNode,
    refreshNodeChildrenFromDatabase: lazyLoadWiring.refreshNodeChildrenFromDatabase,
    markNodeClosed: uiStateWiring.markNodeClosed,
    markNodeOpen: uiStateWiring.markNodeOpen,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    reapplyHeTreeOpenState: uiStateWiring.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: uiStateWiring.reapplyLatentDescendantExpandState,
    resyncTreeDataFromLayout: syncWiring.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: uiStateWiring.restoreExpandedSnapshot,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  })
  const treeRootClassList = deps.computed(() => ({
    'projectHierarchyTree--listDragging': deps.isTreeDragActive.value
  }))
  const treeStyle = deps.computed(() => ({ height: '100%' }))
  return {
    beforeDragOpenWiring,
    dndWiring,
    lazyLoadWiring,
    openIconExpandAnimationWiring,
    runDeferredLazyLoadBatch,
    syncWiring,
    treeRootClassList,
    treeStyle,
    uiStateWiring
  }
}

type T_sessionDnDSubDeps = {
  documentRowDragHoldWiring: ReturnType<typeof createProjectHierarchyTreeDocumentRowDragHoldWiring>
  documentRowExpandClickGesture: ReturnType<typeof createProjectHierarchyTreeDocumentRowExpandClickGestureWiring>
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  flushUiStatePersist: () => void
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  hierarchyStore: {
    flushUiStatePersist: () => void
    queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
    refreshLayout: () => Promise<void>
  }
  isTreeDragActive: Ref<boolean>
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
  markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
  markNodeOpen: (nodeId: string) => void
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  reapplyHeTreeOpenState: () => void
  reapplyLatentDescendantExpandState: () => Promise<void>
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}

export function createProjectHierarchyTreeSessionDnDSubWiring (deps: T_sessionDnDSubDeps) {
  return createProjectHierarchyTreeDnDWiring({
    documentRowDragHoldWiring: deps.documentRowDragHoldWiring,
    documentRowExpandClickGesture: deps.documentRowExpandClickGesture,
    dragCommitPending: deps.dragCommitPending,
    dragCommitScheduled: deps.dragCommitScheduled,
    dragDropCommitted: deps.dragDropCommitted,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
    flushUiStatePersist: deps.flushUiStatePersist,
    getTreeRef: deps.getTreeRef,
    getTreeScrollHost: deps.getTreeScrollHost,
    isTreeDragActive: deps.isTreeDragActive,
    loadChildrenForNode: deps.loadChildrenForNode,
    refreshNodeChildrenFromDatabase: deps.refreshNodeChildrenFromDatabase,
    markNodeClosed: deps.markNodeClosed,
    markNodeOpen: deps.markNodeOpen,
    reindexDocumentSiblingsInHierarchy: async (input) => {
      const api = window.faContentBridgeAPIs?.projectContent
      if (typeof api?.reindexDocumentSiblingsInHierarchy !== 'function') {
        throw new Error('reindexDocumentSiblingsInHierarchy unavailable')
      }
      const result = await api.reindexDocumentSiblingsInHierarchy(input) as I_faProjectHierarchyTreeDocumentChild
      S_FaOpenedDocuments().syncOpenedDocumentParentFromHierarchy(
        input.movedDocumentId,
        input.parentDocumentId
      )
      return result
    },
    nextTick: deps.nextTick,
    reapplyHeTreeOpenState: deps.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: deps.reapplyLatentDescendantExpandState,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: (expandedNodeIds) => {
      deps.hierarchyStore.queuePersistExpandedNodeIds(expandedNodeIds)
    },
    refreshLayout: deps.hierarchyStore.refreshLayout,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  })
}
