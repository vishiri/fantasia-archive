import type { Ref, watch as WatchFn } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

import type { createProjectHierarchyTreeDocumentRowDragHoldWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import type { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowExpandClickGestureWiring'
import { createProjectHierarchyTreeSessionDnDSubWiring } from './projectHierarchyTreeSessionDnDSubWiring'
import { createProjectHierarchyTreeBeforeDragOpenWiring } from './projectHierarchyTreeBeforeDragOpenWiring'
import { createProjectHierarchyTreeLazyLoadSessionWiring } from './projectHierarchyTreeLazyLoadSessionWiring'
import { createProjectHierarchyTreeOpenIconExpandAnimationWiring } from './projectHierarchyTreeOpenIconExpandAnimationWiring'
import { createProjectHierarchyTreeSyncWiring } from './projectHierarchyTreeSyncWiring'

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
