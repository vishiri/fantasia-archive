/**
 * True when the open icon should render in the expanded rotation state.
 * Uses persisted openNodeIds so lazy-load tree revisions do not drop the class mid-expand.
 */
export function resolveProjectHierarchyTreeOpenIconExpanded (
  expandedNodeIds: ReadonlySet<string>,
  nodeId: string,
  statOpen: boolean
): boolean {
  return statOpen || expandedNodeIds.has(nodeId)
}
