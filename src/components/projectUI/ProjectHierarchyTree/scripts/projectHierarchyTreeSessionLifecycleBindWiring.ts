import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { shouldDeferProjectHierarchyTreeWorldsExpandRestore } from '../functions/projectHierarchyTreeDragExpandFreeze'
import type { createProjectHierarchyTreeSessionEarlyWiring } from './projectHierarchyTreeSessionEarlyWiring'
import { createProjectHierarchyTreeSessionHydrateWiring } from './projectHierarchyTreeSessionHydrateWiring'
import { wireProjectHierarchyTreeSessionLifecycle } from './projectHierarchyTreeSessionWatchWiring'

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
  hierarchyStore: T_sessionHierarchyStore
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
    hydrateTreeSession: hydrateWiring.hydrateTreeSession,
    layoutRefreshGeneration: deps.layoutRefreshGeneration,
    onMounted: deps.onMounted,
    onUnmounted: deps.onUnmounted,
    openNodeIds: deps.earlyWiring.bootstrap.sessionRefs.openNodeIds,
    pendingRevealPath: deps.pendingRevealPath,
    resetOnProjectClose: () => deps.hierarchyStore.resetOnProjectClose(),
    resyncTreeDataFromLayout: deps.earlyWiring.subWiring.syncWiring.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: deps.earlyWiring.subWiring.uiStateWiring.restoreExpandedSnapshot,
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
  hydrateTreeSession: () => Promise<void>
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
      dragExpandedSnapshotNodeIds: deps.getDragExpandedSnapshotNodeIds()
    }),
    teardown: deps.teardown,
    watch: deps.watch,
    worlds: deps.worlds
  })
}
