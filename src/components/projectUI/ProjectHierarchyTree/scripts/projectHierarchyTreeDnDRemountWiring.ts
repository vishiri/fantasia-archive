import type { I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions } from 'app/types/I_faProjectHierarchyTreeDomain'

import { PROJECT_HIERARCHY_TREE_DRAG_OPEN_REMOUNT_QUIET_MS } from '../functions/projectHierarchyTreeConstants'

/**
 * Restores expand snapshot after drag settle so drag-open cannot race restore.
 */
function waitForProjectHierarchyTreeDragOpenRestoreSettle (): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, PROJECT_HIERARCHY_TREE_DRAG_OPEN_REMOUNT_QUIET_MS)
  })
}

export async function remountProjectHierarchyTreeAndRestoreExpandedSnapshot (deps: {
  expandedNodeIds: string[]
  isDragSessionStillCurrent?: () => boolean
  nextTick: () => Promise<void>
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
  restoreOptions?: I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  waitBeforeRemount?: () => Promise<void>
}): Promise<void> {
  const waitBeforeRemount = deps.waitBeforeRemount ?? waitForProjectHierarchyTreeDragOpenRestoreSettle
  await waitBeforeRemount()
  if (deps.isDragSessionStillCurrent?.() === false) {
    return
  }
  const sessionStillCurrent = deps.isDragSessionStillCurrent
  const restoreOptions = sessionStillCurrent === undefined
    ? deps.restoreOptions
    : {
        ...deps.restoreOptions,
        isStillCurrent: sessionStillCurrent
      }
  await deps.restoreExpandedSnapshot(deps.expandedNodeIds, restoreOptions)
  if (deps.isDragSessionStillCurrent?.() === false) {
    return
  }
  await deps.nextTick()
  await deps.nextTick()
}
