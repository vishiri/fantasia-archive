/**
 * Waits until he-tree suppressTreeEmit clears before persisting drag reorder.
 */
export function createWaitForProjectHierarchyTreeDragCommitWindow (deps: {
  maxAttempts?: number
  nextTick: () => Promise<void>
  readSuppressTreeEmit: () => boolean
}): () => Promise<{ attempts: number, ready: boolean }> {
  const maxAttempts = deps.maxAttempts ?? 30
  return async function waitForProjectHierarchyTreeDragCommitWindow (): Promise<{
    attempts: number
    ready: boolean
  }> {
    for (let attempts = 0; attempts < maxAttempts; attempts += 1) {
      if (!deps.readSuppressTreeEmit()) {
        return {
          attempts,
          ready: true
        }
      }
      await deps.nextTick()
    }
    return {
      attempts: maxAttempts,
      ready: false
    }
  }
}
