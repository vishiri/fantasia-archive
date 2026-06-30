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

  async function hydrateTreeSession (): Promise<void> {
    await deps.hierarchyStore.refreshLayout()
    await deps.hierarchyStore.refreshUiState()
    deps.syncWiring.resyncTreeDataFromLayout()
    await deps.uiStateWiring.restoreUiStateFromStore()
    detachScrollPersist?.()
    detachScrollPersist = deps.uiStateWiring.attachScrollPersist()
  }

  function teardown (): void {
    detachScrollPersist?.()
    deps.uiStateWiring.onUnmountedCleanup()
    deps.dndWiring.onUnmountedCleanup()
    deps.hierarchyStore.flushUiStatePersist()
  }

  return {
    hydrateTreeSession,
    teardown
  }
}
