import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeSessionHandlersWiring } from './projectHierarchyTreeSessionHandlersWiring'
import { createProjectHierarchyTreeSessionHydrateWiring } from './projectHierarchyTreeSessionHydrateWiring'
import { bindProjectHierarchyTreeSessionLifecycle } from './projectHierarchyTreeSessionLifecycleBindWiring'
import { buildProjectHierarchyTreeSessionApi } from './projectHierarchyTreeSessionApiWiring'
import { createProjectHierarchyTreeSessionEarlyWiring } from './projectHierarchyTreeSessionEarlyWiring'
import { wireProjectHierarchyTreePendingDocumentRefresh } from './projectHierarchyTreePendingDocumentRefreshWiring'

type T_hierarchyStore = {
  clearPendingDocumentRefreshIds: () => void
  clearPendingRevealPath: () => void
  flushUiStatePersist: () => void
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  queuePersistScrollTopPx: (scrollTopPx: number) => void
  refreshLayout: () => Promise<void>
  refreshUiState: () => Promise<void>
  resetOnProjectClose: () => void
}

export function createProjectHierarchyTreeSessionWiring (deps: {
  S_FaActiveProject: () => {
    activeProject: { id: string } | null
    hasActiveProject: boolean
  }
  computed: <T>(getter: () => T) => { value: T }
  dragContext: {
    dragNode: {
      data: I_faProjectHierarchyTreeHeTreeNode
    } | null
  }
  hierarchyStore: T_hierarchyStore
  nextTick: () => Promise<void>
  onDocumentOpenRequest: (
    documentId: string,
    mode: import('app/types/I_faOpenedDocumentsDomain').T_faOpenedDocumentOpenMode,
    treeMeta: import('app/types/I_faOpenedDocumentsDomain').I_faOpenedDocumentTreeOpenMeta
  ) => void
  onMounted: (hook: () => void) => void
  onUnmounted: (hook: () => void) => void
  pendingDocumentRefreshIds: Ref<string[]>
  pendingRevealPath: Ref<string[]>
  ref: <T>(initial: T) => Ref<T>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  uiState: Ref<I_faProjectHierarchyTreeUiState>
  watch: typeof watchFn
  worlds: Ref<I_faProjectHierarchyTreeWorkspaceWorld[]>
}) {
  const earlyWiring = createProjectHierarchyTreeSessionEarlyWiring({
    computed: deps.computed,
    dragContext: deps.dragContext,
    hierarchyStore: deps.hierarchyStore,
    nextTick: deps.nextTick,
    onUnmounted: deps.onUnmounted,
    pendingRevealPath: deps.pendingRevealPath,
    ref: deps.ref,
    treeData: deps.treeData,
    uiState: deps.uiState,
    watch: deps.watch,
    worlds: deps.worlds
  })

  const handlersWiring = createProjectHierarchyTreeSessionHandlersWiring({
    documentRowDragHoldWiring: earlyWiring.documentRowDragHoldWiring,
    documentRowExpandClickGesture: earlyWiring.bootstrap.documentRowExpandClickGesture,
    dragContext: deps.dragContext,
    dragExpandPostCommitGuard: earlyWiring.bootstrap.sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: earlyWiring.bootstrap.sessionRefs.dragExpandUiFrozen,
    getDragExpandedSnapshotNodeIds: earlyWiring.subWiring.dndWiring.getDragExpandedSnapshotNodeIds,
    lazyLoadWiring: earlyWiring.subWiring.lazyLoadWiring,
    onDocumentOpenRequest: deps.onDocumentOpenRequest,
    suppressTreeEmit: earlyWiring.bootstrap.sessionRefs.suppressTreeEmit,
    treeComponentRef: earlyWiring.bootstrap.sessionRefs.treeComponentRef,
    treeData: deps.treeData,
    treeScrollHostRef: earlyWiring.bootstrap.sessionRefs.treeScrollHostRef,
    uiStateWiring: earlyWiring.subWiring.uiStateWiring
  })

  const hydrateWiring = createProjectHierarchyTreeSessionHydrateWiring({
    dndWiring: earlyWiring.subWiring.dndWiring,
    hierarchyStore: deps.hierarchyStore,
    syncWiring: earlyWiring.subWiring.syncWiring,
    uiStateWiring: earlyWiring.subWiring.uiStateWiring
  })

  bindProjectHierarchyTreeSessionLifecycle({
    S_FaActiveProject: deps.S_FaActiveProject,
    clearPendingRevealPath: () => deps.hierarchyStore.clearPendingRevealPath(),
    dragCommitPending: earlyWiring.bootstrap.sessionRefs.dragCommitPending,
    dragCommitScheduled: earlyWiring.bootstrap.sessionRefs.dragCommitScheduled,
    dragExpandPostCommitGuard: earlyWiring.bootstrap.sessionRefs.dragExpandPostCommitGuard,
    dragExpandUiFrozen: earlyWiring.bootstrap.sessionRefs.dragExpandUiFrozen,
    flushUiStatePersist: () => deps.hierarchyStore.flushUiStatePersist(),
    getDragExpandedSnapshotNodeIds: earlyWiring.subWiring.dndWiring.getDragExpandedSnapshotNodeIds,
    hydrateTreeSession: hydrateWiring.hydrateTreeSession,
    onMounted: deps.onMounted,
    onUnmounted: deps.onUnmounted,
    openNodeIds: earlyWiring.bootstrap.sessionRefs.openNodeIds,
    pendingRevealPath: deps.pendingRevealPath,
    resetOnProjectClose: () => deps.hierarchyStore.resetOnProjectClose(),
    resyncTreeDataFromLayout: earlyWiring.subWiring.syncWiring.resyncTreeDataFromLayout,
    restoreUiStateFromStore: earlyWiring.subWiring.uiStateWiring.restoreUiStateFromStore,
    revealPendingPath: earlyWiring.subWiring.uiStateWiring.revealPendingPath,
    teardown: hydrateWiring.teardown,
    watch: deps.watch,
    worlds: deps.worlds
  })

  wireProjectHierarchyTreePendingDocumentRefresh({
    clearPendingDocumentRefreshIds: () => deps.hierarchyStore.clearPendingDocumentRefreshIds(),
    pendingDocumentRefreshIds: deps.pendingDocumentRefreshIds,
    refreshNodeChildrenFromDatabase: earlyWiring.subWiring.lazyLoadWiring.refreshNodeChildrenFromDatabase,
    treeData: deps.treeData,
    watch: deps.watch
  })

  return buildProjectHierarchyTreeSessionApi({
    handlersWiring,
    isTreeDragActive: earlyWiring.bootstrap.sessionRefs.isTreeDragActive,
    subWiring: earlyWiring.subWiring,
    treeData: deps.treeData,
    treeMountKey: earlyWiring.bootstrap.sessionRefs.treeMountKey
  })
}
