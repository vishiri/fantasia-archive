import type { Ref } from 'vue'

/**
 * Loads lazy tree rows without publishing or opening he-tree until the batch finishes.
 */
export async function runProjectHierarchyTreeDeferredLazyLoadBatch (deps: {
  deferLazyLoadTreeRevisionPublish: Ref<boolean>
  flushDeferredTreeRevisionPublish: () => Promise<void>
  nextTick?: () => Promise<void>
  reapplyHeTreeOpenState: () => void
  runBatch: () => Promise<void>
  skipReapplyHeTreeOpenState?: boolean
}): Promise<void> {
  if (deps.deferLazyLoadTreeRevisionPublish.value) {
    await deps.runBatch()
    return
  }
  deps.deferLazyLoadTreeRevisionPublish.value = true
  try {
    await deps.runBatch()
    await deps.flushDeferredTreeRevisionPublish()
    if (deps.nextTick !== undefined) {
      await deps.nextTick()
      await deps.nextTick()
    }
    if (deps.skipReapplyHeTreeOpenState !== true) {
      deps.reapplyHeTreeOpenState()
    }
  } finally {
    deps.deferLazyLoadTreeRevisionPublish.value = false
  }
}
