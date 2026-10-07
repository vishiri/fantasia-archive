/**
 * Prefer live open ids; fall back to store uiState when live collect is empty
 * (e.g. tree not resynced yet during a layout watcher race).
 */
export function resolveProjectHierarchyTreeWorldsLayoutExpandSnapshot (input: {
  liveExpandedSnapshot: readonly string[]
  storeExpandedNodeIds: readonly string[]
}): string[] {
  if (input.liveExpandedSnapshot.length > 0) {
    return [...input.liveExpandedSnapshot]
  }
  if (input.storeExpandedNodeIds.length === 0) {
    return []
  }
  return [...input.storeExpandedNodeIds]
}

/**
 * Avoid wiping persisted expand ids when restore prunes to empty.
 * An empty restored list with a non-empty intended list means the skeleton
 * does not contain those rows yet, not that the user collapsed the branch.
 */
export function shouldPersistProjectHierarchyTreeRestoredExpandedNodeIds (input: {
  intendedExpandedNodeIds: readonly string[]
  restoredExpandedNodeIds: readonly string[]
}): boolean {
  if (input.restoredExpandedNodeIds.length > 0) {
    return true
  }
  return input.intendedExpandedNodeIds.length === 0
}
