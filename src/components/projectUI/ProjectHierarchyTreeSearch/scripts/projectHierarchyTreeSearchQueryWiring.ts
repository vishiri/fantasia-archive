import type { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import {
  hasFaProjectHierarchySearch,
  searchFaProjectHierarchyForRenderer
} from 'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'

function beginHierarchySearchRequest (
  requestSerialBox: { current: number } | undefined
): number {
  if (requestSerialBox === undefined) {
    return 0
  }
  const requestSerial = requestSerialBox.current + 1
  requestSerialBox.current = requestSerial
  return requestSerial
}

/**
 * Runs debounced hierarchy search IPC and reveals the first hit in the tree store.
 */
export async function runProjectHierarchyTreeSearchQuery (
  query: string,
  hierarchyStore: ReturnType<typeof S_FaProjectHierarchyTree>,
  isCurrentQuery?: (query: string) => boolean,
  readProjectContentEpoch?: () => number,
  requestSerialBox?: { current: number }
): Promise<void> {
  const epochAtStart = readProjectContentEpoch?.()
  const queryStillCurrent = isCurrentQuery === undefined || isCurrentQuery(query)
  if (!queryStillCurrent) {
    return
  }
  if (!hasFaProjectHierarchySearch()) {
    hierarchyStore.clearSearch()
    return
  }
  const requestSerial = beginHierarchySearchRequest(requestSerialBox)
  const result = await searchFaProjectHierarchyForRenderer(query)
  const epochNow = readProjectContentEpoch?.()
  if (epochNow !== epochAtStart) {
    return
  }
  if (isCurrentQuery !== undefined && !isCurrentQuery(query)) {
    return
  }
  if (requestSerialBox !== undefined && requestSerialBox.current !== requestSerial) {
    return
  }
  hierarchyStore.setSearchHits(result.hits)
  const firstHit = result.hits[0]
  if (firstHit !== undefined) {
    hierarchyStore.requestRevealSearchHit(firstHit)
  }
}
