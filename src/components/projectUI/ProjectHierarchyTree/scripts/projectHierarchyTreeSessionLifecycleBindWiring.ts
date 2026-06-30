import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'

import { shouldDeferProjectHierarchyTreeWorldsExpandRestore } from '../functions/projectHierarchyTreeDragExpandFreeze'
import { wireProjectHierarchyTreeSessionLifecycle } from './projectHierarchyTreeSessionWatchWiring'

export function bindProjectHierarchyTreeSessionLifecycle (deps: {
  S_FaActiveProject: () => {
    activeProject: { id: string } | null
    hasActiveProject: boolean
  }
  clearPendingRevealPath: () => void
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  flushUiStatePersist: () => void
  hydrateTreeSession: () => Promise<void>
  onMounted: (hook: () => void) => void
  onUnmounted: (hook: () => void) => void
  openNodeIds: Ref<Set<string>>
  pendingRevealPath: Ref<string[]>
  resetOnProjectClose: () => void
  resyncTreeDataFromLayout: () => void
  restoreUiStateFromStore: () => Promise<void>
  revealPendingPath: () => Promise<void>
  teardown: () => void
  watch: typeof watchFn
  worlds: Ref<unknown[]>
}): void {
  wireProjectHierarchyTreeSessionLifecycle({
    S_FaActiveProject: deps.S_FaActiveProject,
    clearPendingRevealPath: deps.clearPendingRevealPath,
    flushUiStatePersist: deps.flushUiStatePersist,
    hydrateTreeSession: deps.hydrateTreeSession,
    onMounted: deps.onMounted,
    onUnmounted: deps.onUnmounted,
    openNodeIds: deps.openNodeIds,
    pendingRevealPath: deps.pendingRevealPath,
    resetOnProjectClose: deps.resetOnProjectClose,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    restoreUiStateFromStore: deps.restoreUiStateFromStore,
    revealPendingPath: deps.revealPendingPath,
    shouldDeferWorldsExpandRestore: () => shouldDeferProjectHierarchyTreeWorldsExpandRestore({
      dragCommitPending: deps.dragCommitPending.value,
      dragCommitScheduled: deps.dragCommitScheduled.value,
      dragExpandUiFrozen: deps.dragExpandUiFrozen.value
    }),
    teardown: deps.teardown,
    watch: deps.watch,
    worlds: deps.worlds
  })
}
