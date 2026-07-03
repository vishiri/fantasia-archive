import { areProjectHierarchyTreeOrderedDocumentIdsEqual } from '../functions/projectHierarchyTreeOrderedDocumentIdsEqual'

/**
 * Waits until he-tree getData sibling order is stable across consecutive reads.
 * he-tree updateBehavior modify mutates in place and may not emit update:model-value after drop.
 */
export function createWaitForProjectHierarchyTreeDragGetDataOrderStable (deps: {
  maxAttempts?: number
  nextTick: () => Promise<void>
  readSiblingOrderFromGetData: () => string[] | null
}): () => Promise<{
  attempts: number
  orderedDocumentIds: string[] | null
  settled: boolean
}> {
  const maxAttempts = deps.maxAttempts ?? 30
  return async function waitForProjectHierarchyTreeDragGetDataOrderStable (): Promise<{
    attempts: number
    orderedDocumentIds: string[] | null
    settled: boolean
  }> {
    let previousOrder: string[] | null = null
    for (let attempts = 1; attempts <= maxAttempts; attempts += 1) {
      const currentOrder = deps.readSiblingOrderFromGetData()
      if (
        currentOrder !== null &&
        previousOrder !== null &&
        areProjectHierarchyTreeOrderedDocumentIdsEqual(previousOrder, currentOrder)
      ) {
        return {
          attempts,
          orderedDocumentIds: currentOrder,
          settled: true
        }
      }
      previousOrder = currentOrder
      await deps.nextTick()
    }
    const lastOrder = deps.readSiblingOrderFromGetData()
    return {
      attempts: maxAttempts,
      orderedDocumentIds: lastOrder,
      settled: lastOrder !== null
    }
  }
}
