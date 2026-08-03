import type { Ref, watch as watchFn } from 'vue'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import { shouldDeferProjectHierarchyTreeWorldsExpandRestore } from '../functions/projectHierarchyTreeDragExpandFreeze'
import type { createProjectHierarchyTreeSessionEarlyWiring } from './projectHierarchyTreeSessionWiring'
import { createProjectHierarchyTreeSessionHydrateWiring } from './projectHierarchyTreeSessionBootstrapWiring'
import { wireProjectHierarchyTreeSessionLifecycle } from './projectHierarchyTreeSessionBootstrapWiring'
import type { createProjectHierarchyTreeSessionHandlersWiring } from './projectHierarchyTreeSessionHandlersWiring'
import type { createProjectHierarchyTreeSessionSubWiring } from './projectHierarchyTreeSessionSubWiring'
import { resolveProjectHierarchyTreeHeTreeNodeKey } from '../functions/projectHierarchyTreeHeTreeNodeKey'
import { runWithPreservedProjectHierarchyTreeScrollTop } from './projectHierarchyTreeScrollPreserveWiring'

type T_sessionHierarchyStore = {
  clearPendingRevealPath: () => void
  flushUiStatePersist: () => void
  refreshLayout: () => Promise<void>
  refreshUiState: () => Promise<void>
  resetOnProjectClose: () => void
}

export function bindProjectHierarchyTreeSessionHydrateLifecycle (deps: {
  S_FaActiveProject: () => {
    activeProject: { id: string } | null
    hasActiveProject: boolean
  }
  earlyWiring: ReturnType<typeof createProjectHierarchyTreeSessionEarlyWiring>
  getStoreExpandedNodeIds: () => readonly string[]
  hierarchyStore: T_sessionHierarchyStore
  nextTick: () => Promise<void>
  onMounted: (hook: () => void) => void
  onUnmounted: (hook: () => void) => void
  pendingRevealPath: Ref<string[]>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  watch: typeof watchFn
  worlds: Ref<unknown[]>
  layoutRefreshGeneration: Ref<number>
}): void {
  const hydrateWiring = createProjectHierarchyTreeSessionHydrateWiring({
    dndWiring: deps.earlyWiring.subWiring.dndWiring,
    hierarchyStore: deps.hierarchyStore,
    syncWiring: deps.earlyWiring.subWiring.syncWiring,
    uiStateWiring: deps.earlyWiring.subWiring.uiStateWiring
  })
  bindProjectHierarchyTreeSessionLifecycle({
    S_FaActiveProject: deps.S_FaActiveProject,
    clearPendingRevealPath: () => deps.hierarchyStore.clearPendingRevealPath(),
    dragCommitPending: deps.earlyWiring.bootstrap.sessionRefs.dragCommitPending,
    dragCommitScheduled: deps.earlyWiring.bootstrap.sessionRefs.dragCommitScheduled,
    dragExpandPostCommitGuard: deps.earlyWiring.bootstrap.sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.earlyWiring.bootstrap.sessionRefs.dragExpandUiFrozen,
    flushUiStatePersist: () => deps.hierarchyStore.flushUiStatePersist(),
    getDragExpandedSnapshotNodeIds: deps.earlyWiring.subWiring.dndWiring.getDragExpandedSnapshotNodeIds,
    getStoreExpandedNodeIds: deps.getStoreExpandedNodeIds,
    hydrateTreeSession: hydrateWiring.hydrateTreeSession,
    isTreeSessionHydrateInFlight: hydrateWiring.isTreeSessionHydrateInFlight,
    layoutRefreshGeneration: deps.layoutRefreshGeneration,
    onMounted: deps.onMounted,
    onUnmounted: deps.onUnmounted,
    openNodeIds: deps.earlyWiring.bootstrap.sessionRefs.openNodeIds,
    pendingRevealPath: deps.pendingRevealPath,
    resetOnProjectClose: () => deps.hierarchyStore.resetOnProjectClose(),
    resyncTreeDataFromLayout: deps.earlyWiring.subWiring.syncWiring.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: async (expandedNodeIds) => {
      await runWithPreservedProjectHierarchyTreeScrollTop({
        getTreeScrollHost: () => deps.earlyWiring.bootstrap.sessionRefs.treeScrollHostRef.value,
        nextTick: deps.nextTick,
        requestAnimationFrame: (callback) => window.requestAnimationFrame(callback),
        run: async () => {
          await deps.earlyWiring.subWiring.uiStateWiring.restoreExpandedSnapshot(expandedNodeIds)
        }
      })
    },
    revealPendingPath: deps.earlyWiring.subWiring.uiStateWiring.revealPendingPath,
    teardown: hydrateWiring.teardown,
    treeData: deps.treeData,
    watch: deps.watch,
    worlds: deps.worlds
  })
}

export function bindProjectHierarchyTreeSessionLifecycle (deps: {
  S_FaActiveProject: () => {
    activeProject: { id: string } | null
    hasActiveProject: boolean
  }
  clearPendingRevealPath: () => void
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  flushUiStatePersist: () => void
  getDragExpandedSnapshotNodeIds: () => string[] | null
  getStoreExpandedNodeIds: () => readonly string[]
  hydrateTreeSession: () => Promise<void>
  isTreeSessionHydrateInFlight: () => boolean
  onMounted: (hook: () => void) => void
  onUnmounted: (hook: () => void) => void
  openNodeIds: Ref<Set<string>>
  pendingRevealPath: Ref<string[]>
  resetOnProjectClose: () => void
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (expandedNodeIds: string[]) => Promise<void>
  revealPendingPath: () => Promise<void>
  layoutRefreshGeneration: Ref<number>
  teardown: () => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  watch: typeof watchFn
  worlds: Ref<unknown[]>
}): void {
  wireProjectHierarchyTreeSessionLifecycle({
    S_FaActiveProject: deps.S_FaActiveProject,
    clearPendingRevealPath: deps.clearPendingRevealPath,
    flushUiStatePersist: deps.flushUiStatePersist,
    getStoreExpandedNodeIds: deps.getStoreExpandedNodeIds,
    hydrateTreeSession: deps.hydrateTreeSession,
    layoutRefreshGeneration: deps.layoutRefreshGeneration,
    onMounted: deps.onMounted,
    onUnmounted: deps.onUnmounted,
    openNodeIds: deps.openNodeIds,
    pendingRevealPath: deps.pendingRevealPath,
    resetOnProjectClose: deps.resetOnProjectClose,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot,
    revealPendingPath: deps.revealPendingPath,
    treeData: deps.treeData,
    shouldDeferWorldsExpandRestore: () => shouldDeferProjectHierarchyTreeWorldsExpandRestore({
      dragCommitPending: deps.dragCommitPending.value,
      dragCommitScheduled: deps.dragCommitScheduled.value,
      dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard.value,
      dragExpandUiFrozen: deps.dragExpandUiFrozen.value,
      dragExpandedSnapshotNodeIds: deps.getDragExpandedSnapshotNodeIds(),
      treeSessionHydrateInFlight: deps.isTreeSessionHydrateInFlight()
    }),
    teardown: deps.teardown,
    watch: deps.watch,
    worlds: deps.worlds
  })
}

type T_handlersWiring = ReturnType<typeof createProjectHierarchyTreeSessionHandlersWiring>
type T_subWiring = ReturnType<typeof createProjectHierarchyTreeSessionSubWiring>

export function buildProjectHierarchyTreeSessionApi (deps: {
  handlersWiring: T_handlersWiring
  isTreeDragActive: Ref<boolean>
  openIconExpandAnimationWiring: {
    isOpenIconExpandAnimationPending: (nodeId: string) => boolean
    isProjectHierarchyTreeOpenIconExpandedForOpenIcon: (nodeId: string, statOpen: boolean) => boolean
  }
  subWiring: T_subWiring
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  return {
    contextMenuAddNewRowIcon: deps.handlersWiring.contextMenuAddNewRowIcon,
    contextMenuAddNewRowLabel: deps.handlersWiring.contextMenuAddNewRowLabel,
    contextMenuAnchorNodeId: deps.handlersWiring.contextMenuAnchorNodeId,
    contextMenuShowsBulkExpandRows: deps.handlersWiring.contextMenuShowsBulkExpandRows,
    contextMenuShowsCopyRows: deps.handlersWiring.contextMenuShowsCopyRows,
    contextMenuShowsSortByRows: deps.handlersWiring.contextMenuShowsSortByRows,
    eachDraggableHandler: deps.handlersWiring.eachDraggableHandler,
    eachDroppableHandler: deps.handlersWiring.eachDroppableHandler,
    isNodeContextMenuOpen: deps.handlersWiring.isNodeContextMenuOpen,
    isOpenIconExpandAnimationPending: deps.openIconExpandAnimationWiring.isOpenIconExpandAnimationPending,
    isProjectHierarchyTreeOpenIconExpandedForOpenIcon:
      deps.openIconExpandAnimationWiring.isProjectHierarchyTreeOpenIconExpandedForOpenIcon,
    isTreeDragActive: deps.isTreeDragActive,
    nodeMenuPointerPosition: deps.handlersWiring.nodeMenuPointerPosition,
    onAddNewDocumentFromContextMenuClick: deps.handlersWiring.onAddNewDocumentFromContextMenuClick,
    onAddNewDocumentUnderThisFromContextMenuClick:
      deps.handlersWiring.onAddNewDocumentUnderThisFromContextMenuClick,
    onCollapseAllUnderNodeClick: deps.handlersWiring.onCollapseAllUnderNodeClick,
    onCopyBackgroundColorFromContextMenuClick: deps.handlersWiring.onCopyBackgroundColorFromContextMenuClick,
    onCopyDocumentFromContextMenuClick: deps.handlersWiring.onCopyDocumentFromContextMenuClick,
    onCopyNameFromContextMenuClick: deps.handlersWiring.onCopyNameFromContextMenuClick,
    onCopyTextColorFromContextMenuClick: deps.handlersWiring.onCopyTextColorFromContextMenuClick,
    onDeleteDocumentFromContextMenuClick: deps.handlersWiring.onDeleteDocumentFromContextMenuClick,
    onDocumentRowAuxClick: deps.handlersWiring.onDocumentRowAuxClick,
    onEditDocumentFromContextMenuClick: deps.handlersWiring.onEditDocumentFromContextMenuClick,
    onExpandAllUnderNodeClick: deps.handlersWiring.onExpandAllUnderNodeClick,
    onNodeClick: deps.handlersWiring.onNodeClick,
    onNodeClose: deps.handlersWiring.onNodeClose,
    onNodeContextMenuHide: deps.handlersWiring.onNodeContextMenuHide,
    onNodeOpen: deps.handlersWiring.onNodeOpen,
    onNodeOpenIconClick: deps.handlersWiring.onNodeOpenIconClick,
    onNodeOpenIconPointerDown: deps.handlersWiring.onNodeOpenIconPointerDown,
    onNodeRowContextMenu: deps.handlersWiring.onNodeRowContextMenu,
    onOpenDocumentFromContextMenuClick: deps.handlersWiring.onOpenDocumentFromContextMenuClick,
    onSortByItemFromContextMenuClick: deps.handlersWiring.onSortByItemFromContextMenuClick,
    onNonWorldOpenIconClick: deps.handlersWiring.onNonWorldOpenIconClick,
    onNonWorldOpenIconPointerDown: deps.handlersWiring.onNonWorldOpenIconPointerDown,
    onWorldNodeRowClick: deps.handlersWiring.onWorldNodeRowClick,
    onWorldNodeRowPointerDown: deps.handlersWiring.onWorldNodeRowPointerDown,
    onBeforeDragOpen: deps.subWiring.beforeDragOpenWiring.onBeforeDragOpen,
    onTreeAfterDrop: deps.subWiring.dndWiring.onTreeAfterDrop,
    onBeforeDragStart: deps.subWiring.dndWiring.onBeforeDragStart,
    onTreeDataUpdate: deps.subWiring.dndWiring.onTreeDataUpdate,
    onTreeDragEndCleanup: deps.subWiring.dndWiring.onTreeDragEndCleanup,
    heTreeNodeKey: resolveProjectHierarchyTreeHeTreeNodeKey,
    rootDroppableHandler: deps.handlersWiring.rootDroppableHandler,
    setTreeComponentRef: deps.handlersWiring.setTreeComponentRef,
    setTreeScrollHostRef: deps.handlersWiring.setTreeScrollHostRef,
    treeData: deps.treeData,
    treeRootClassList: deps.subWiring.treeRootClassList,
    treeStyle: deps.subWiring.treeStyle
  }
}
