import { defineStore } from 'pinia'
import debounce from 'lodash-es/debounce.js'
import { readonly, ref } from 'vue'

import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeSearchHit,
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'
import {
  mapWorkspaceLayoutToHierarchyTreeSkeleton,
  patchHierarchyTreeSkeletonLabelsInPlace
} from 'app/src/components/projectUI/ProjectHierarchyTree/functions/mapWorkspaceLayoutToHierarchyTreeSkeleton'
import { projectHierarchyTreeLayoutStructureMatchesTree } from 'app/src/components/projectUI/ProjectHierarchyTree/scripts/projectHierarchyTreeLayoutStructureMatch'
import { buildProjectHierarchyTreeRevealPathFromSearchHit } from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreeRevealPath'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import {
  createEmptyProjectHierarchyTreeUiState,
  faProjectHierarchyTreePersistUiStatePatchFromBridge,
  faProjectHierarchyTreeRefreshLayoutFromBridge,
  faProjectHierarchyTreeRefreshUiStateFromBridge
} from 'app/src/stores/scripts/sFaProjectHierarchyTreeBridge'

const UI_STATE_PERSIST_DEBOUNCE_MS = 150

/**
 * Workspace hierarchy sidebar tree session state (layout skeleton, UI persist, search reveal).
 */
export const S_FaProjectHierarchyTree = defineStore('S_FaProjectHierarchyTree', () => {
  const worlds: Ref<I_faProjectHierarchyTreeWorkspaceWorld[]> = ref([])
  const treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]> = ref([])
  const uiState: Ref<I_faProjectHierarchyTreeUiState> = ref(createEmptyProjectHierarchyTreeUiState())
  const pendingRevealPath: Ref<string[]> = ref([])
  const searchHits: Ref<I_faProjectHierarchyTreeSearchHit[]> = ref([])

  let lastPersistedExpandedNodeIdsJson = JSON.stringify(uiState.value.expandedNodeIds)
  let lastPersistedScrollTopPx = uiState.value.scrollTopPx
  let refreshLayoutInFlight: Promise<void> | null = null

  function applyUiState (next: I_faProjectHierarchyTreeUiState): void {
    uiState.value = {
      expandedNodeIds: [...next.expandedNodeIds],
      schemaVersion: next.schemaVersion,
      scrollTopPx: next.scrollTopPx
    }
    lastPersistedExpandedNodeIdsJson = JSON.stringify(next.expandedNodeIds)
    lastPersistedScrollTopPx = next.scrollTopPx
  }

  function resetOnProjectClose (): void {
    worlds.value = []
    treeData.value = []
    searchHits.value = []
    pendingRevealPath.value = []
    applyUiState(createEmptyProjectHierarchyTreeUiState())
  }

  function resyncTreeDataFromWorlds (): void {
    if (worlds.value.length === 0) {
      treeData.value = []
      return
    }
    const nextSkeleton = mapWorkspaceLayoutToHierarchyTreeSkeleton(worlds.value)
    if (
      treeData.value.length > 0 &&
      projectHierarchyTreeLayoutStructureMatchesTree(treeData.value, worlds.value)
    ) {
      patchHierarchyTreeSkeletonLabelsInPlace(treeData.value, worlds.value)
      return
    }
    treeData.value = nextSkeleton
  }

  async function refreshLayout (): Promise<void> {
    if (!S_FaActiveProject().hasActiveProject) {
      resetOnProjectClose()
      return
    }
    if (refreshLayoutInFlight !== null) {
      await refreshLayoutInFlight
      return
    }
    refreshLayoutInFlight = (async () => {
      const layout = await faProjectHierarchyTreeRefreshLayoutFromBridge()
      if (layout === null) {
        return
      }
      worlds.value = layout.worlds
      resyncTreeDataFromWorlds()
    })()
    try {
      await refreshLayoutInFlight
    } finally {
      refreshLayoutInFlight = null
    }
  }

  async function refreshUiState (): Promise<void> {
    if (!S_FaActiveProject().hasActiveProject) {
      applyUiState(createEmptyProjectHierarchyTreeUiState())
      return
    }
    await faProjectHierarchyTreeRefreshUiStateFromBridge({
      applyUiState
    })
  }

  async function persistUiStatePatchNow (
    patch: Partial<Pick<I_faProjectHierarchyTreeUiState, 'expandedNodeIds' | 'scrollTopPx'>>
  ): Promise<void> {
    if (!S_FaActiveProject().hasActiveProject) {
      return
    }
    const nextExpanded = patch.expandedNodeIds ?? uiState.value.expandedNodeIds
    const nextScrollTop = patch.scrollTopPx ?? uiState.value.scrollTopPx
    const expandedJson = JSON.stringify(nextExpanded)
    if (expandedJson === lastPersistedExpandedNodeIdsJson && nextScrollTop === lastPersistedScrollTopPx) {
      return
    }
    const wrote = await faProjectHierarchyTreePersistUiStatePatchFromBridge({
      expandedNodeIds: nextExpanded,
      scrollTopPx: nextScrollTop
    })
    if (!wrote) {
      return
    }
    uiState.value = {
      expandedNodeIds: [...nextExpanded],
      schemaVersion: 1,
      scrollTopPx: nextScrollTop
    }
    lastPersistedExpandedNodeIdsJson = expandedJson
    lastPersistedScrollTopPx = nextScrollTop
  }

  const schedulePersistUiStatePatch = debounce(
    (patch: Partial<Pick<I_faProjectHierarchyTreeUiState, 'expandedNodeIds' | 'scrollTopPx'>>) => {
      void persistUiStatePatchNow(patch)
    },
    UI_STATE_PERSIST_DEBOUNCE_MS
  )

  function queuePersistExpandedNodeIds (expandedNodeIds: string[]): void {
    uiState.value = {
      ...uiState.value,
      expandedNodeIds: [...expandedNodeIds]
    }
    schedulePersistUiStatePatch({
      expandedNodeIds
    })
  }

  function queuePersistScrollTopPx (scrollTopPx: number): void {
    uiState.value = {
      ...uiState.value,
      scrollTopPx
    }
    schedulePersistUiStatePatch({
      scrollTopPx
    })
  }

  function flushUiStatePersist (): void {
    schedulePersistUiStatePatch.flush()
  }

  function setSearchHits (hits: I_faProjectHierarchyTreeSearchHit[]): void {
    searchHits.value = hits
  }

  function requestRevealSearchHit (hit: I_faProjectHierarchyTreeSearchHit): void {
    pendingRevealPath.value = buildProjectHierarchyTreeRevealPathFromSearchHit(hit, worlds.value)
  }

  function clearPendingRevealPath (): void {
    pendingRevealPath.value = []
  }

  function clearSearch (): void {
    searchHits.value = []
    pendingRevealPath.value = []
  }

  const clearPendingRevealPathOut = clearPendingRevealPath
  const clearSearchOut = clearSearch
  const flushUiStatePersistOut = flushUiStatePersist
  const pendingRevealPathOut = pendingRevealPath
  const queuePersistExpandedNodeIdsOut = queuePersistExpandedNodeIds
  const queuePersistScrollTopPxOut = queuePersistScrollTopPx
  const refreshLayoutOut = refreshLayout
  const refreshUiStateOut = refreshUiState
  const requestRevealSearchHitOut = requestRevealSearchHit
  const resetOnProjectCloseOut = resetOnProjectClose
  const searchHitsOut = searchHits
  const setSearchHitsOut = setSearchHits
  const treeDataOut = treeData
  const uiStateOut = uiState
  const worldsOut = worlds

  return {
    clearPendingRevealPath: clearPendingRevealPathOut,
    clearSearch: clearSearchOut,
    flushUiStatePersist: flushUiStatePersistOut,
    pendingRevealPath: pendingRevealPathOut,
    queuePersistExpandedNodeIds: queuePersistExpandedNodeIdsOut,
    queuePersistScrollTopPx: queuePersistScrollTopPxOut,
    refreshLayout: refreshLayoutOut,
    refreshUiState: refreshUiStateOut,
    requestRevealSearchHit: requestRevealSearchHitOut,
    resetOnProjectClose: resetOnProjectCloseOut,
    searchHits: readonly(searchHitsOut),
    setSearchHits: setSearchHitsOut,
    treeData: treeDataOut,
    uiState: readonly(uiStateOut),
    worlds: readonly(worldsOut)
  }
})
