/**
 * Restores he-tree expand snapshot after drag quiet period so drag-open timers
 * cannot call beforeDragOpen on a torn-down Draggable instance.
 */
import type { I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions } from 'app/types/I_faProjectHierarchyTreeDomain'

import { PROJECT_HIERARCHY_TREE_DRAG_OPEN_REMOUNT_QUIET_MS } from '../functions/projectHierarchyTreeConstants'

function waitForProjectHierarchyTreeDragOpenRemountQuietPeriod (): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, PROJECT_HIERARCHY_TREE_DRAG_OPEN_REMOUNT_QUIET_MS)
  })
}

export async function remountProjectHierarchyTreeAndRestoreExpandedSnapshot (deps: {
  expandedNodeIds: string[]
  nextTick: () => Promise<void>
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
  restoreOptions?: I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  waitBeforeRemount?: () => Promise<void>
}): Promise<void> {
  const waitBeforeRemount = deps.waitBeforeRemount ?? waitForProjectHierarchyTreeDragOpenRemountQuietPeriod
  await waitBeforeRemount()
  await deps.restoreExpandedSnapshot(deps.expandedNodeIds, deps.restoreOptions)
  await deps.nextTick()
  await deps.nextTick()
}
