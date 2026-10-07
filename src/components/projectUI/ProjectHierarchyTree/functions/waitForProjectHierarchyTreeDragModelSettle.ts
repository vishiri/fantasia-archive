/**
 * Waits for he-tree deferred update:model-value after after-drop before persisting order.
 */
export function createWaitForProjectHierarchyTreeDragModelSettle (deps: {
  maxAttempts?: number
  nextTick: () => Promise<void>
  readModelSettled: () => boolean
}): () => Promise<{ attempts: number, settled: boolean }> {
  const maxAttempts = deps.maxAttempts ?? 30
  return async function waitForProjectHierarchyTreeDragModelSettle (): Promise<{
    attempts: number
    settled: boolean
  }> {
    for (let attempts = 0; attempts < maxAttempts; attempts += 1) {
      if (deps.readModelSettled()) {
        const settledAttempts = attempts + 1
        return {
          attempts: settledAttempts,
          settled: true
        }
      }
      await deps.nextTick()
    }
    const settled = deps.readModelSettled()
    return {
      attempts: maxAttempts,
      settled
    }
  }
}
