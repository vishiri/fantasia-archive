/**
 * Returns the next worlds.sort_order for a new row given the current table maximum.
 */
export function computeNextFaProjectWorldSortOrder (
  currentMaxSortOrder: number | null | undefined
): number {
  if (currentMaxSortOrder === null || currentMaxSortOrder === undefined) {
    return 0
  }
  return currentMaxSortOrder + 1
}
