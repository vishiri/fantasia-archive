/**
 * Remounts he-tree after drag so internal stat.open state cannot desync from openNodeIds.
 */
import { PROJECT_HIERARCHY_TREE_DRAG_OPEN_REMOUNT_QUIET_MS } from '../functions/projectHierarchyTreeConstants'

function waitForProjectHierarchyTreeDragOpenRemountQuietPeriod (): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, PROJECT_HIERARCHY_TREE_DRAG_OPEN_REMOUNT_QUIET_MS)
  })
}

export async function remountProjectHierarchyTreeAndRestoreExpandedSnapshot (deps: {
  bumpTreeMountKey: () => void
  expandedNodeIds: string[]
  nextTick: () => Promise<void>
  restoreExpandedSnapshot: (expandedNodeIds: string[]) => Promise<void>
  waitBeforeRemount?: () => Promise<void>
}): Promise<void> {
  const waitBeforeRemount = deps.waitBeforeRemount ?? waitForProjectHierarchyTreeDragOpenRemountQuietPeriod
  await waitBeforeRemount()
  deps.bumpTreeMountKey()
  await deps.nextTick()
  await deps.nextTick()
  await deps.restoreExpandedSnapshot(deps.expandedNodeIds)
  await deps.nextTick()
  await deps.nextTick()
}
