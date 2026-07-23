export function createProjectHierarchyTreeSessionHydrateWiring (deps: {
  hierarchyStore: {
    flushUiStatePersist: () => void
    refreshLayout: () => Promise<void>
    refreshUiState: () => Promise<void>
  }
  syncWiring: {
    resyncTreeDataFromLayout: () => void
  }
  uiStateWiring: {
    attachScrollPersist: () => () => void
    onUnmountedCleanup: () => void
    restoreUiStateFromStore: () => Promise<void>
  }
  dndWiring: {
    onUnmountedCleanup: () => void
  }
}) {
  let detachScrollPersist: (() => void) | undefined
  let treeSessionHydrateInFlight = false
  let hydrateGeneration = 0

  function isTreeSessionHydrateInFlight (): boolean {
    return treeSessionHydrateInFlight
  }

  async function hydrateTreeSession (): Promise<void> {
    const thisGeneration = ++hydrateGeneration
    treeSessionHydrateInFlight = true
    try {
      await deps.hierarchyStore.refreshLayout()
      if (thisGeneration !== hydrateGeneration) {
        return
      }
      await deps.hierarchyStore.refreshUiState()
      if (thisGeneration !== hydrateGeneration) {
        return
      }
      deps.syncWiring.resyncTreeDataFromLayout()
      await deps.uiStateWiring.restoreUiStateFromStore()
      if (thisGeneration !== hydrateGeneration) {
        return
      }
      detachScrollPersist?.()
      detachScrollPersist = deps.uiStateWiring.attachScrollPersist()
    } finally {
      if (thisGeneration === hydrateGeneration) {
        treeSessionHydrateInFlight = false
      }
    }
  }

  function teardown (): void {
    hydrateGeneration += 1
    treeSessionHydrateInFlight = false
    detachScrollPersist?.()
    deps.uiStateWiring.onUnmountedCleanup()
    deps.dndWiring.onUnmountedCleanup()
    deps.hierarchyStore.flushUiStatePersist()
  }

  return {
    hydrateTreeSession,
    isTreeSessionHydrateInFlight,
    teardown
  }
}
