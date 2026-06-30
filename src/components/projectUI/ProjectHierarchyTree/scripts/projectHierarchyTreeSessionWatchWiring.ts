import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'

import { logProjectHierarchyTreeDebugSession } from './projectHierarchyTreeDebugSessionLogWiring'

export function wireProjectHierarchyTreeSessionLifecycle (deps: {
  S_FaActiveProject: () => {
    activeProject: { id: string } | null
    hasActiveProject: boolean
  }
  clearPendingRevealPath: () => void
  flushUiStatePersist: () => void
  hydrateTreeSession: () => Promise<void>
  onMounted: (hook: () => void) => void
  onUnmounted: (hook: () => void) => void
  openNodeIds: Ref<Set<string>>
  pendingRevealPath: Ref<string[]>
  resetOnProjectClose: () => void
  resyncTreeDataFromLayout: () => void
  restoreUiStateFromStore: () => Promise<void>
  revealPendingPath: () => Promise<void>
  shouldDeferWorldsExpandRestore: () => boolean
  teardown: () => void
  watch: typeof watchFn
  worlds: Ref<unknown[]>
}): void {
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
    () => deps.worlds.value,
    async () => {
      deps.resyncTreeDataFromLayout()
      const deferred = deps.shouldDeferWorldsExpandRestore()
      logProjectHierarchyTreeDebugSession({
        data: {
          deferred,
          worldsCount: deps.worlds.value.length
        },
        hypothesisId: 'H2-H4',
        location: 'projectHierarchyTreeSessionWatchWiring.ts:worldsWatch',
        message: deferred ? 'worlds changed while drag restore deferred' : 'worlds changed — restoreUiStateFromStore',
        runId: 'post-fix'
      })
      if (deferred) {
        return
      }
      await deps.restoreUiStateFromStore()
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
