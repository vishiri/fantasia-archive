/**
 * Remounts he-tree after drag so internal stat.open state cannot desync from openNodeIds.
 */
export async function remountProjectHierarchyTreeAndRestoreExpandedSnapshot (deps: {
  bumpTreeMountKey: () => void
  expandedNodeIds: string[]
  nextTick: () => Promise<void>
  restoreExpandedSnapshot: (expandedNodeIds: string[]) => Promise<void>
}): Promise<void> {
  deps.bumpTreeMountKey()
  await deps.nextTick()
  await deps.nextTick()
  await deps.restoreExpandedSnapshot(deps.expandedNodeIds)
  await deps.nextTick()
  await deps.nextTick()
}
