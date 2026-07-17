/**
 * Sort key for shallow-first lazy-load: ancestor depth, then stable node id.
 */
export function compareProjectHierarchyTreeShallowFirstLazyLoadRows (
  left: { depth: number, nodeId: string },
  right: { depth: number, nodeId: string }
): number {
  if (left.depth !== right.depth) {
    return left.depth - right.depth
  }
  return left.nodeId.localeCompare(right.nodeId)
}

/**
 * True when a stalled latent expand pass should continue after staged commit.
 */
export function shouldContinueLatentExpandAfterStallRetry (
  stallKey: string,
  retryStallKey: string
): boolean {
  return retryStallKey !== stallKey
}
