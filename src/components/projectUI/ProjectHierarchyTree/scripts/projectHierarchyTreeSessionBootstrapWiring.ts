import type { Ref, watch as watchFn } from 'vue'
import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import { bindProjectHierarchyTreeHeTreeNodeTabIndexGuard } from './projectHierarchyTreeHeTreeHelpersWiring'
import { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import { resolveProjectHierarchyTreeWorldsLayoutExpandSnapshot } from '../functions/projectHierarchyTreeWorldsLayoutExpandSnapshot'
import { collectProjectHierarchyTreePersistedExpandedNodeIds } from '../functions/projectHierarchyTreePersistedOpenNodeIds'

export function createProjectHierarchyTreeSessionRefs (deps: {
  ref: <T>(initial: T) => Ref<T>
}) {
  const suppressTreeEmit = deps.ref(false)
  const isTreeDragActive = deps.ref(false)
  const dragCommitPending = deps.ref(false)
  const dragCommitScheduled = deps.ref(false)
  const dragDropCommitted = deps.ref(false)
  const dragExpandUiFrozen = deps.ref(false)
  const deferLazyLoadTreeRevisionPublish = deps.ref(false)
  const dragExpandPostCommitGuard = deps.ref(false)
  const openNodeIds = deps.ref<Set<string>>(new Set())
  const treeComponentRef = deps.ref<I_faProjectHierarchyTreeHeTreeInstance | null>(null)
  const treeScrollHostRef = deps.ref<HTMLElement | null>(null)

  return {
    dragCommitPending,
    dragCommitScheduled,
    dragDropCommitted,
    deferLazyLoadTreeRevisionPublish,
    dragExpandPostCommitGuard,
    dragExpandUiFrozen,
    isTreeDragActive,
    openNodeIds,
    suppressTreeEmit,
    treeComponentRef,
    treeScrollHostRef
  }
}

export function createProjectHierarchyTreeSessionBootstrapWiring (deps: {
  onUnmounted: (hook: () => void) => void
  ref: <T>(initial: T) => Ref<T>
  watch: typeof watchFn
}) {
  const sessionRefs = createProjectHierarchyTreeSessionRefs({ ref: deps.ref })

  const documentRowExpandClickGesture = createProjectHierarchyTreeDocumentRowExpandClickGestureWiring({
    isTreeDragActive: sessionRefs.isTreeDragActive
  })

  bindProjectHierarchyTreeHeTreeNodeTabIndexGuard({
    onUnmounted: deps.onUnmounted,
    treeScrollHostRef: sessionRefs.treeScrollHostRef,
    watch: deps.watch
  })

  return {
    documentRowExpandClickGesture,
    sessionRefs
  }
}

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

type T_projectHierarchyTreeSessionLifecycleDeps = {
  S_FaActiveProject: () => {
    activeProject: { id: string } | null
    hasActiveProject: boolean
  }
  clearPendingRevealPath: () => void
  flushUiStatePersist: () => void
  getStoreExpandedNodeIds: () => readonly string[]
  hydrateTreeSession: () => Promise<void>
  layoutRefreshGeneration: Ref<number>
  onMounted: (hook: () => void) => void
  onUnmounted: (hook: () => void) => void
  openNodeIds: Ref<Set<string>>
  pendingRevealPath: Ref<string[]>
  resetOnProjectClose: () => void
  resyncTreeDataFromLayout: () => { structureMatched: boolean } | void
  restoreExpandedSnapshot: (expandedNodeIds: string[]) => Promise<void>
  revealPendingPath: () => Promise<void>
  shouldDeferWorldsExpandRestore: () => boolean
  teardown: () => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  watch: typeof watchFn
  worlds: Ref<unknown[]>
}

async function runProjectHierarchyTreeWorldsLayoutRestore (
  deps: T_projectHierarchyTreeSessionLifecycleDeps
): Promise<void> {
  if (deps.shouldDeferWorldsExpandRestore()) {
    return
  }
  const expandedSnapshot = resolveProjectHierarchyTreeWorldsLayoutExpandSnapshot({
    liveExpandedSnapshot: collectProjectHierarchyTreePersistedExpandedNodeIds(
      deps.treeData.value,
      deps.openNodeIds.value
    ),
    storeExpandedNodeIds: deps.getStoreExpandedNodeIds()
  })
  const resyncResult = deps.resyncTreeDataFromLayout()
  if (resyncResult?.structureMatched === true) {
    return
  }
  if (deps.shouldDeferWorldsExpandRestore()) {
    return
  }
  await deps.restoreExpandedSnapshot(expandedSnapshot)
}

export function wireProjectHierarchyTreeSessionLifecycle (
  deps: T_projectHierarchyTreeSessionLifecycleDeps
): void {
  deps.watch(
    () => deps.S_FaActiveProject().activeProject?.id ?? null,
    async (projectId) => {
      deps.flushUiStatePersist()
      if (projectId === null) {
        deps.resetOnProjectClose()
        deps.openNodeIds.value = new Set()
        return
      }
      await deps.hydrateTreeSession()
    },
    {
      immediate: true
    }
  )

  deps.watch(
    () => [
      deps.layoutRefreshGeneration.value,
      deps.worlds.value
    ] as const,
    () => {
      void runProjectHierarchyTreeWorldsLayoutRestore(deps)
    },
    {
      deep: true
    }
  )

  deps.watch(
    () => [...deps.pendingRevealPath.value],
    () => {
      if (deps.pendingRevealPath.value.length === 0) {
        return
      }
      void deps.revealPendingPath().then(() => {
        deps.clearPendingRevealPath()
      })
    }
  )

  deps.onMounted(() => {
    if (deps.S_FaActiveProject().hasActiveProject) {
      void deps.hydrateTreeSession()
    }
  })

  deps.onUnmounted(() => {
    deps.teardown()
  })
}
