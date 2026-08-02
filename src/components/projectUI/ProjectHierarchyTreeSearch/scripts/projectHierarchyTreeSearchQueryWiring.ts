import type { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import {
  hasFaProjectHierarchySearch,
  searchFaProjectHierarchyForRenderer
} from 'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'

/**
 * Runs debounced hierarchy search IPC and reveals the first hit in the tree store.
 */
export async function runProjectHierarchyTreeSearchQuery (
  query: string,
  hierarchyStore: ReturnType<typeof S_FaProjectHierarchyTree>
): Promise<void> {
  if (!hasFaProjectHierarchySearch()) {
    hierarchyStore.clearSearch()
    return
  }
  const result = await searchFaProjectHierarchyForRenderer(query)
  hierarchyStore.setSearchHits(result.hits)
  const firstHit = result.hits[0]
  if (firstHit !== undefined) {
    hierarchyStore.requestRevealSearchHit(firstHit)
  }
}
