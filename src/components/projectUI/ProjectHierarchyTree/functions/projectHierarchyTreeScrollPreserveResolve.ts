/**
 * Prefer live DOM scrollTop; else drag-session capture; else persisted uiState.
 * Drop/virt remount often zeros live (and may poison persist) before preserve starts.
 */
export function resolveProjectHierarchyTreePreservedScrollTopPx (input: {
  dragSessionScrollTopPx?: number
  liveScrollTopPx: number
  persistedScrollTopPx: number
}): number {
  if (input.liveScrollTopPx > 0) {
    return input.liveScrollTopPx
  }
  const dragSessionScrollTopPx = input.dragSessionScrollTopPx ?? 0
  if (dragSessionScrollTopPx > 0) {
    return dragSessionScrollTopPx
  }
  if (input.persistedScrollTopPx > 0) {
    return input.persistedScrollTopPx
  }
  return 0
}

/**
 * Skip writing scrollTop 0 into uiState while drag/commit/preserve is in flight.
 * Remount flashes would otherwise poison the persisted fallback and yank the tree to top.
 */
export function shouldSkipProjectHierarchyTreeScrollPersistWhileDrag (input: {
  dragCommitPending: boolean
  isTreeDragActive: boolean
  scrollPreserveActive?: boolean
  scrollTopPx: number
}): boolean {
  if (input.scrollTopPx > 0) {
    return false
  }
  return input.dragCommitPending ||
    input.isTreeDragActive ||
    input.scrollPreserveActive === true
}
