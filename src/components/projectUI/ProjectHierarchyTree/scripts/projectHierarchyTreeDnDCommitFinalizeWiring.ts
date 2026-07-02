import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions } from 'app/types/I_faProjectHierarchyTreeDomain'

import { PROJECT_HIERARCHY_TREE_DRAG_EXPAND_SNAPSHOT_RESTORE_OPTIONS } from '../functions/projectHierarchyTreeConstants'

export async function finalizeProjectHierarchyTreeDragCommitExpandState (deps: {
  clearDragSessionFlags: () => void
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  expandedSnapshot: string[]
  flushUiStatePersist: () => void
  nextTick: () => Promise<void>
  reapplyHeTreeOpenState: () => void
  reapplyLatentDescendantExpandState: () => Promise<void>
  requestAnimationFrame: (callback: () => void) => number
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
}): Promise<void> {
  await deps.reapplyLatentDescendantExpandState()
  await deps.nextTick()
  await deps.nextTick()
  deps.dragExpandUiFrozen.value = false
  await deps.nextTick()
  await new Promise<void>((resolve) => {
    deps.requestAnimationFrame(() => {
      resolve()
    })
  })
  await deps.restoreExpandedSnapshot(
    deps.expandedSnapshot,
    PROJECT_HIERARCHY_TREE_DRAG_EXPAND_SNAPSHOT_RESTORE_OPTIONS
  )
  await deps.reapplyLatentDescendantExpandState()
  deps.reapplyHeTreeOpenState()
  deps.flushUiStatePersist()
  deps.clearDragSessionFlags()
  await deps.nextTick()
  await new Promise<void>((resolve) => {
    deps.requestAnimationFrame(() => {
      resolve()
    })
  })
  deps.reapplyHeTreeOpenState()
  await deps.reapplyLatentDescendantExpandState()
  deps.reapplyHeTreeOpenState()
  deps.dragExpandPostCommitGuard.value = false
}
