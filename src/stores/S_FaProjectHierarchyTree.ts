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
  const pendingDocumentRefreshIds: Ref<string[]> = ref([])
  const pendingHierarchyNodeRefreshIds: Ref<string[]> = ref([])
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
    pendingDocumentRefreshIds.value = []
    pendingHierarchyNodeRefreshIds.value = []
    applyUiState(createEmptyProjectHierarchyTreeUiState())
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
      if (layout.worlds.length === 0) {
        treeData.value = []
      }
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
    const plainExpandedNodeIds = [...nextExpanded]
    const nextScrollTop = patch.scrollTopPx ?? uiState.value.scrollTopPx
    const expandedJson = JSON.stringify(plainExpandedNodeIds)
    if (expandedJson === lastPersistedExpandedNodeIdsJson && nextScrollTop === lastPersistedScrollTopPx) {
      return
    }
    const bridgePayload = {
      expandedNodeIds: plainExpandedNodeIds,
      scrollTopPx: nextScrollTop
    }
    const wrote = await faProjectHierarchyTreePersistUiStatePatchFromBridge(bridgePayload)
    if (!wrote) {
      return
    }
    uiState.value = {
      expandedNodeIds: plainExpandedNodeIds,
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

  function clearPendingDocumentRefreshIds (): void {
    pendingDocumentRefreshIds.value = []
  }

  function clearPendingHierarchyNodeRefreshIds (): void {
    pendingHierarchyNodeRefreshIds.value = []
  }

  function refreshDocumentsInTree (documentIds: string[]): void {
    if (!S_FaActiveProject().hasActiveProject || documentIds.length === 0) {
      return
    }
    pendingDocumentRefreshIds.value = [
      ...new Set([...pendingDocumentRefreshIds.value, ...documentIds])
    ]
  }

  function refreshHierarchyTreeNodes (nodeIds: string[]): void {
    if (!S_FaActiveProject().hasActiveProject || nodeIds.length === 0) {
      return
    }
    pendingHierarchyNodeRefreshIds.value = [
      ...new Set([...pendingHierarchyNodeRefreshIds.value, ...nodeIds])
    ]
  }

  function patchWorldColorPalleteInLayout (worldId: string, colorPallete: string): void {
    worlds.value = worlds.value.map((world) => {
      if (world.id !== worldId) {
        return world
      }
      return {
        ...world,
        colorPallete
      }
    })
  }

  const clearPendingDocumentRefreshIdsOut = clearPendingDocumentRefreshIds
  const clearPendingHierarchyNodeRefreshIdsOut = clearPendingHierarchyNodeRefreshIds
  const clearPendingRevealPathOut = clearPendingRevealPath
  const clearSearchOut = clearSearch
  const flushUiStatePersistOut = flushUiStatePersist
  const patchWorldColorPalleteInLayoutOut = patchWorldColorPalleteInLayout
  const pendingDocumentRefreshIdsOut = pendingDocumentRefreshIds
  const pendingHierarchyNodeRefreshIdsOut = pendingHierarchyNodeRefreshIds
  const pendingRevealPathOut = pendingRevealPath
  const queuePersistExpandedNodeIdsOut = queuePersistExpandedNodeIds
  const queuePersistScrollTopPxOut = queuePersistScrollTopPx
  const refreshDocumentsInTreeOut = refreshDocumentsInTree
  const refreshHierarchyTreeNodesOut = refreshHierarchyTreeNodes
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
    clearPendingDocumentRefreshIds: clearPendingDocumentRefreshIdsOut,
    clearPendingHierarchyNodeRefreshIds: clearPendingHierarchyNodeRefreshIdsOut,
    clearPendingRevealPath: clearPendingRevealPathOut,
    clearSearch: clearSearchOut,
    flushUiStatePersist: flushUiStatePersistOut,
    patchWorldColorPalleteInLayout: patchWorldColorPalleteInLayoutOut,
    pendingDocumentRefreshIds: pendingDocumentRefreshIdsOut,
    pendingHierarchyNodeRefreshIds: pendingHierarchyNodeRefreshIdsOut,
    pendingRevealPath: pendingRevealPathOut,
    queuePersistExpandedNodeIds: queuePersistExpandedNodeIdsOut,
    queuePersistScrollTopPx: queuePersistScrollTopPxOut,
    refreshDocumentsInTree: refreshDocumentsInTreeOut,
    refreshHierarchyTreeNodes: refreshHierarchyTreeNodesOut,
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
