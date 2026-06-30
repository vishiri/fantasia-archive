import type { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'

/**
 * Runs debounced hierarchy search IPC and reveals the first hit in the tree store.
 */
export async function runProjectHierarchyTreeSearchQuery (
  query: string,
  hierarchyStore: ReturnType<typeof S_FaProjectHierarchyTree>
): Promise<void> {
  const bridge = window.faContentBridgeAPIs?.projectContent
  if (typeof bridge?.searchProjectHierarchy !== 'function') {
    hierarchyStore.clearSearch()
    return
  }
  const result = await bridge.searchProjectHierarchy(query)
  hierarchyStore.setSearchHits(result.hits)
  const firstHit = result.hits[0]
  if (firstHit !== undefined) {
    hierarchyStore.requestRevealSearchHit(firstHit)
  }
}
