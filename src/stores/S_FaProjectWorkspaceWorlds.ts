import { defineStore, storeToRefs } from 'pinia'
import { readonly, ref, watch } from 'vue'

import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faProjectWorkspaceWorldListItem } from 'app/types/I_faProjectWorkspaceWorldsDomain'

import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { mapFaProjectHierarchyWorldsToWorkspaceListItems } from 'app/src/stores/functions/mapFaProjectHierarchyWorldsToWorkspaceListItems'

/**
 * Workspace sidebar world name list derived from S_FaProjectHierarchyTree worlds.
 * Expand/scroll persistence stays on hierarchy_tree_ui_state via the hierarchy store.
 */
export const S_FaProjectWorkspaceWorlds = defineStore('S_FaProjectWorkspaceWorlds', () => {
  const worldListItems: Ref<I_faProjectWorkspaceWorldListItem[]> = ref([])
  const { worlds: hierarchyWorlds } = storeToRefs(S_FaProjectHierarchyTree())

  function applyMappedList (
    worlds: ReadonlyArray<{
      displayName: string
      id: string
    }>
  ): void {
    worldListItems.value = mapFaProjectHierarchyWorldsToWorkspaceListItems(worlds)
  }

  function syncFromHierarchyTree (): void {
    applyMappedList(hierarchyWorlds.value)
  }

  /**
   * Component-testing only: seed hierarchy worlds then remap the sidebar list.
   */
  function replaceSessionForComponentTesting (
    worlds: readonly I_faProjectHierarchyTreeWorkspaceWorld[]
  ): void {
    S_FaProjectHierarchyTree().replaceSessionForComponentTesting({
      worlds: worlds.map((world) => ({ ...world }))
    })
    applyMappedList(worlds)
  }

  /**
   * Refresh hierarchy layout (single IPC source); list remaps from hierarchy worlds.
   */
  async function refreshWorkspaceWorlds (): Promise<void> {
    await S_FaProjectHierarchyTree().refreshLayout()
    syncFromHierarchyTree()
  }

  watch(
    hierarchyWorlds,
    (worlds) => {
      applyMappedList(worlds)
    },
    {
      deep: true,
      immediate: true
    }
  )

  return {
    refreshWorkspaceWorlds,
    replaceSessionForComponentTesting,
    worldListItems: readonly(worldListItems)
  }
})
