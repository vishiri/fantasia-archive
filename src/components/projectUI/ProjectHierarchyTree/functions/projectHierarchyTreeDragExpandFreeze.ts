/**
 * Expand/collapse UI is frozen for the hierarchy tree drag session so he-tree
 * hover open/close events do not corrupt persisted expandedNodeIds mid-drag.
 */
export function isProjectHierarchyTreeDragExpandUiFrozen (input: {
  dragExpandUiFrozen: boolean
}): boolean {
  return input.dragExpandUiFrozen
}

/**
 * Worlds layout watcher should not run full expand restore during drag commit.
 */
export function shouldDeferProjectHierarchyTreeWorldsExpandRestore (input: {
  dragCommitPending: boolean
  dragCommitScheduled: boolean
  dragExpandPostCommitGuard: boolean
  dragExpandUiFrozen: boolean
  dragExpandedSnapshotNodeIds: string[] | null
}): boolean {
  return input.dragExpandUiFrozen ||
    input.dragCommitPending ||
    input.dragCommitScheduled ||
    input.dragExpandPostCommitGuard ||
    (input.dragExpandedSnapshotNodeIds !== null && input.dragExpandedSnapshotNodeIds.length > 0)
}
