import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeSessionHandlersWiring } from './projectHierarchyTreeSessionHandlersWiring'
import { createProjectHierarchyTreeSessionHydrateWiring } from './projectHierarchyTreeSessionHydrateWiring'
import { createProjectHierarchyTreeSessionRefs } from './projectHierarchyTreeSessionRefsWiring'
import { createProjectHierarchyTreeSessionSubWiring } from './projectHierarchyTreeSessionSubWiring'
import { bindProjectHierarchyTreeSessionLifecycle } from './projectHierarchyTreeSessionLifecycleBindWiring'
import { buildProjectHierarchyTreeSessionApi } from './projectHierarchyTreeSessionApiWiring'

type T_hierarchyStore = {
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
  onDocumentClick: (documentId: string) => void
  onMounted: (hook: () => void) => void
  onUnmounted: (hook: () => void) => void
  pendingRevealPath: Ref<string[]>
  ref: <T>(initial: T) => Ref<T>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  uiState: Ref<I_faProjectHierarchyTreeUiState>
  watch: typeof watchFn
  worlds: Ref<I_faProjectHierarchyTreeWorkspaceWorld[]>
}) {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref: deps.ref })

  const subWiring = createProjectHierarchyTreeSessionSubWiring({
    computed: deps.computed,
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragDropCommitted: sessionRefs.dragDropCommitted,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    hierarchyStore: deps.hierarchyStore,
    isTreeDragActive: sessionRefs.isTreeDragActive,
    nextTick: deps.nextTick,
    openNodeIds: sessionRefs.openNodeIds,
    pendingRevealPath: deps.pendingRevealPath,
    ref: deps.ref,
    suppressTreeEmit: sessionRefs.suppressTreeEmit,
    treeComponentRef: sessionRefs.treeComponentRef,
    treeData: deps.treeData,
    treeMountKey: sessionRefs.treeMountKey,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    uiState: deps.uiState,
    worlds: deps.worlds
  })

  const handlersWiring = createProjectHierarchyTreeSessionHandlersWiring({
    dragContext: deps.dragContext,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    lazyLoadWiring: subWiring.lazyLoadWiring,
    onDocumentClick: deps.onDocumentClick,
    suppressTreeEmit: sessionRefs.suppressTreeEmit,
    treeComponentRef: sessionRefs.treeComponentRef,
    treeData: deps.treeData,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    uiStateWiring: subWiring.uiStateWiring
  })

  const hydrateWiring = createProjectHierarchyTreeSessionHydrateWiring({
    dndWiring: subWiring.dndWiring,
    hierarchyStore: deps.hierarchyStore,
    syncWiring: subWiring.syncWiring,
    uiStateWiring: subWiring.uiStateWiring
  })

  bindProjectHierarchyTreeSessionLifecycle({
    S_FaActiveProject: deps.S_FaActiveProject,
    clearPendingRevealPath: () => deps.hierarchyStore.clearPendingRevealPath(),
    dragCommitPending: sessionRefs.dragCommitPending,
    dragCommitScheduled: sessionRefs.dragCommitScheduled,
    dragExpandUiFrozen: sessionRefs.dragExpandUiFrozen,
    flushUiStatePersist: () => deps.hierarchyStore.flushUiStatePersist(),
    hydrateTreeSession: hydrateWiring.hydrateTreeSession,
    onMounted: deps.onMounted,
    onUnmounted: deps.onUnmounted,
    openNodeIds: sessionRefs.openNodeIds,
    pendingRevealPath: deps.pendingRevealPath,
    resetOnProjectClose: () => deps.hierarchyStore.resetOnProjectClose(),
    resyncTreeDataFromLayout: subWiring.syncWiring.resyncTreeDataFromLayout,
    restoreUiStateFromStore: subWiring.uiStateWiring.restoreUiStateFromStore,
    revealPendingPath: subWiring.uiStateWiring.revealPendingPath,
    teardown: hydrateWiring.teardown,
    watch: deps.watch,
    worlds: deps.worlds
  })

  return buildProjectHierarchyTreeSessionApi({
    handlersWiring,
    subWiring,
    treeData: deps.treeData,
    treeMountKey: sessionRefs.treeMountKey
  })
}
