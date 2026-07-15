import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { collectProjectHierarchyTreePersistedExpandedNodeIds } from '../functions/projectHierarchyTreePersistedOpenNodeIds'

type T_projectHierarchyTreeSessionLifecycleDeps = {
  S_FaActiveProject: () => {
    activeProject: { id: string } | null
    hasActiveProject: boolean
  }
  clearPendingRevealPath: () => void
  flushUiStatePersist: () => void
  hydrateTreeSession: () => Promise<void>
  layoutRefreshGeneration: Ref<number>
  onMounted: (hook: () => void) => void
  onUnmounted: (hook: () => void) => void
  openNodeIds: Ref<Set<string>>
  pendingRevealPath: Ref<string[]>
  resetOnProjectClose: () => void
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (expandedNodeIds: string[]) => Promise<void>
  revealPendingPath: () => Promise<void>
  shouldDeferWorldsExpandRestore: () => boolean
  teardown: () => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  watch: typeof watchFn
  worlds: Ref<unknown[]>
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
    async () => {
      const deferRestore = deps.shouldDeferWorldsExpandRestore()
      if (deferRestore) {
        return
      }
      const expandedSnapshot = collectProjectHierarchyTreePersistedExpandedNodeIds(
        deps.treeData.value,
        deps.openNodeIds.value
      )
      deps.resyncTreeDataFromLayout()
      await deps.restoreExpandedSnapshot(expandedSnapshot)
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
