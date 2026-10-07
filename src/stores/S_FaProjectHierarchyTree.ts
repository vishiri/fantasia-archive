import { defineStore } from 'pinia'
import debounce from 'lodash-es/debounce.js'
import { readonly, ref } from 'vue'

import type { Ref } from 'vue'

import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeListPlacementChildrenInput,
  I_faProjectHierarchyTreeMoveDocumentInput,
  I_faProjectHierarchyTreeReindexDocumentSiblingsInput,
  I_faProjectHierarchyTreeSearchHit,
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'
import { buildProjectHierarchyTreeRevealPathFromSearchHit } from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreeRevealPath'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import {
  createFaProjectHierarchyDocumentIndex,
  listFaProjectHierarchyDocumentIndexPlacementChildren,
  replaceFaProjectHierarchyDocumentIndexFromDocuments,
  upsertFaProjectHierarchyDocumentIndexDocument
} from 'app/src/stores/functions/faProjectHierarchyDocumentIndex'
import {
  applyFaProjectHierarchyDocumentIndexMove,
  applyFaProjectHierarchyDocumentIndexReindex
} from 'app/src/stores/functions/faProjectHierarchyDocumentIndexMutations'
import {
  createEmptyProjectHierarchyTreeUiState,
  faProjectHierarchyTreePersistUiStatePatchFromBridge,
  faProjectHierarchyTreeRefreshDocumentsFromBridge,
  faProjectHierarchyTreeRefreshLayoutFromBridge,
  faProjectHierarchyTreeRefreshUiStateFromBridge
} from 'app/src/stores/scripts/sFaProjectHierarchyTreeBridge'

const UI_STATE_PERSIST_DEBOUNCE_MS = 150

const documentIndexMutationDeps = {
  listPlacementChildren: listFaProjectHierarchyDocumentIndexPlacementChildren,
  upsertDocument: upsertFaProjectHierarchyDocumentIndexDocument
}

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
  let uiStatePersistInFlight: Promise<void> | null = null
  let hierarchyUiStateGeneration = 0
  let refreshLayoutInFlight: Promise<void> | null = null
  let refreshLayoutNeedsFollowUp = false
  let worldColorPaletteOverrideSerial = 0
  const worldColorPaletteOverrides = new Map<string, {
    colorPalette: string
    serial: number
  }>()
  const layoutRefreshGeneration = ref(0)
  /**
   * Bumped when overview chart census inputs change so Project Overview can reload without
   * remount: persisted document create/delete, and Project Settings template or worlds save.
   */
  const documentCensusRefreshGeneration = ref(0)

  function bumpDocumentCensusRefreshGeneration (): void {
    documentCensusRefreshGeneration.value += 1
  }

  /**
   * Bumped when document_last_opened MRU changes (open tab) so Project Overview can refresh
   * Last opened without a full chart census reload.
   */
  const documentLastOpenedRefreshGeneration = ref(0)

  let documentIndex = createFaProjectHierarchyDocumentIndex()
  let documentIndexLoadedForProjectId: string | null = null
  let documentIndexInFlight: Promise<boolean> | null = null
  let documentIndexLoadGeneration = 0
  let documentIndexMutationGeneration = 0

  function bumpDocumentLastOpenedRefreshGeneration (): void {
    documentLastOpenedRefreshGeneration.value += 1
  }

  function clearDocumentIndex (): void {
    documentIndexLoadGeneration += 1
    documentIndex = createFaProjectHierarchyDocumentIndex()
    documentIndexLoadedForProjectId = null
    documentIndexInFlight = null
  }

  function replaceDocumentIndexFromDocuments (items: readonly I_faProjectDocument[]): void {
    documentIndex = createFaProjectHierarchyDocumentIndex()
    replaceFaProjectHierarchyDocumentIndexFromDocuments(documentIndex, items)
    documentIndexLoadedForProjectId = S_FaActiveProject().activeProject?.id ?? null
  }

  function listIndexedPlacementChildren (
    input: I_faProjectHierarchyTreeListPlacementChildrenInput
  ): I_faProjectHierarchyTreeDocumentChild[] {
    return listFaProjectHierarchyDocumentIndexPlacementChildren(documentIndex, input)
  }

  function noteDocumentIndexLocalMutation (): void {
    documentIndexMutationGeneration += 1
  }

  function upsertIndexedDocument (document: I_faProjectDocument): void {
    noteDocumentIndexLocalMutation()
    upsertFaProjectHierarchyDocumentIndexDocument(documentIndex, document)
  }

  function applyIndexedReindexBucket (
    input: I_faProjectHierarchyTreeReindexDocumentSiblingsInput
  ): void {
    noteDocumentIndexLocalMutation()
    applyFaProjectHierarchyDocumentIndexReindex(
      documentIndex,
      input,
      documentIndexMutationDeps
    )
  }

  function applyIndexedMove (input: I_faProjectHierarchyTreeMoveDocumentInput): void {
    noteDocumentIndexLocalMutation()
    applyFaProjectHierarchyDocumentIndexMove(
      documentIndex,
      input,
      documentIndexMutationDeps
    )
  }

  async function loadDocumentIndexForProject (
    projectId: string,
    loadGeneration: number,
    mutationAtStart: number
  ): Promise<boolean> {
    const items = await faProjectHierarchyTreeRefreshDocumentsFromBridge()
    if (loadGeneration !== documentIndexLoadGeneration) {
      return false
    }
    if (S_FaActiveProject().activeProject?.id !== projectId) {
      return false
    }
    if (mutationAtStart !== documentIndexMutationGeneration) {
      return true
    }
    if (items === null) {
      documentIndexLoadedForProjectId = projectId
      return false
    }
    replaceDocumentIndexFromDocuments(items)
    return false
  }

  async function ensureDocumentIndexLoaded (options?: { forceReload?: boolean }): Promise<void> {
    const projectId = S_FaActiveProject().activeProject?.id ?? null
    if (projectId === null) {
      clearDocumentIndex()
      return
    }
    const forceReload = options?.forceReload === true
    if (!forceReload && documentIndexLoadedForProjectId === projectId) {
      return
    }
    if (documentIndexInFlight !== null) {
      await documentIndexInFlight
      return await ensureDocumentIndexLoaded(options)
    }
    const loadGeneration = ++documentIndexLoadGeneration
    const mutationAtStart = documentIndexMutationGeneration
    const pending = loadDocumentIndexForProject(projectId, loadGeneration, mutationAtStart)
    documentIndexInFlight = pending
    let stale = false
    try {
      stale = await pending
    } finally {
      if (documentIndexInFlight === pending) {
        documentIndexInFlight = null
      }
    }
    if (stale && S_FaActiveProject().activeProject?.id === projectId) {
      await ensureDocumentIndexLoaded({
        forceReload: true
      })
    }
  }

  async function reloadDocumentIndexFromBridge (): Promise<void> {
    await ensureDocumentIndexLoaded({
      forceReload: true
    })
  }

  function applyUiState (next: I_faProjectHierarchyTreeUiState): void {
    uiState.value = {
      expandedNodeIds: [...next.expandedNodeIds],
      schemaVersion: next.schemaVersion,
      scrollTopPx: next.scrollTopPx
    }
    lastPersistedExpandedNodeIdsJson = JSON.stringify(next.expandedNodeIds)
    lastPersistedScrollTopPx = next.scrollTopPx
    schedulePersistUiStatePatch.cancel()
  }

  function resetOnProjectClose (): void {
    worlds.value = []
    treeData.value = []
    searchHits.value = []
    pendingRevealPath.value = []
    pendingDocumentRefreshIds.value = []
    pendingHierarchyNodeRefreshIds.value = []
    worldColorPaletteOverrides.clear()
    applyUiState(createEmptyProjectHierarchyTreeUiState())
    clearDocumentIndex()
  }

  function mergeLayoutWorldsWithPaletteOverrides (
    layoutWorlds: I_faProjectHierarchyTreeWorkspaceWorld[],
    overrideSerialAtStart: number
  ): I_faProjectHierarchyTreeWorkspaceWorld[] {
    for (const [worldId, override] of worldColorPaletteOverrides) {
      if (override.serial <= overrideSerialAtStart) {
        worldColorPaletteOverrides.delete(worldId)
      }
    }
    return layoutWorlds.map((world) => {
      const override = worldColorPaletteOverrides.get(world.id)
      if (override === undefined) {
        return world
      }
      const colorPalette = override.colorPalette
      return {
        ...world,
        colorPalette
      }
    })
  }

  async function applyLayoutFromBridge (): Promise<void> {
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    const overrideSerialAtStart = worldColorPaletteOverrideSerial
    const layout = await faProjectHierarchyTreeRefreshLayoutFromBridge()
    if (S_FaActiveProject().readProjectContentEpoch() !== epochAtStart) {
      worldColorPaletteOverrides.clear()
      return
    }
    if (refreshLayoutNeedsFollowUp) {
      return
    }
    if (layout === null) {
      return
    }
    const mergedWorlds = mergeLayoutWorldsWithPaletteOverrides(layout.worlds, overrideSerialAtStart)
    worlds.value = mergedWorlds
    if (mergedWorlds.length === 0) {
      treeData.value = []
    }
    layoutRefreshGeneration.value += 1
  }

  async function refreshLayout (): Promise<void> {
    if (!S_FaActiveProject().hasActiveProject) {
      resetOnProjectClose()
      return
    }
    if (refreshLayoutInFlight !== null) {
      refreshLayoutNeedsFollowUp = true
      await refreshLayoutInFlight
      if (refreshLayoutNeedsFollowUp) {
        refreshLayoutNeedsFollowUp = false
        await refreshLayout()
      }
      return
    }
    refreshLayoutInFlight = applyLayoutFromBridge()
    await refreshLayoutInFlight.finally(() => {
      refreshLayoutInFlight = null
    })
  }

  async function refreshUiState (): Promise<void> {
    if (!S_FaActiveProject().hasActiveProject) {
      applyUiState(createEmptyProjectHierarchyTreeUiState())
      return
    }
    hierarchyUiStateGeneration += 1
    const generation = hierarchyUiStateGeneration
    const epochAtStart = S_FaActiveProject().readProjectContentEpoch()
    const expandedAtReadStart = JSON.stringify(uiState.value.expandedNodeIds)
    const scrollAtReadStart = uiState.value.scrollTopPx
    const applyUiStateIfSameProject = (next: I_faProjectHierarchyTreeUiState): void => {
      if (S_FaActiveProject().readProjectContentEpoch() !== epochAtStart) {
        return
      }
      if (generation !== hierarchyUiStateGeneration) {
        return
      }
      const liveExpanded = JSON.stringify(uiState.value.expandedNodeIds)
      if (liveExpanded !== expandedAtReadStart || uiState.value.scrollTopPx !== scrollAtReadStart) {
        return
      }
      applyUiState(next)
    }
    await faProjectHierarchyTreeRefreshUiStateFromBridge({
      applyUiState: applyUiStateIfSameProject
    })
  }

  async function commitPersistedUiStatePatch (input: {
    expandedNodeIds?: string[]
    expandedNodeIdsBaseJson?: string
    scrollTopPx?: number
  }): Promise<void> {
    const expandedPayload = input.expandedNodeIds === undefined
      ? {}
      : {
          expandedNodeIds: input.expandedNodeIds,
          ...(input.expandedNodeIdsBaseJson === undefined
            ? {}
            : { expandedNodeIdsBaseJson: input.expandedNodeIdsBaseJson })
        }
    const bridgePayload = {
      ...expandedPayload,
      ...(input.scrollTopPx === undefined ? {} : { scrollTopPx: input.scrollTopPx })
    }
    const wrote = await faProjectHierarchyTreePersistUiStatePatchFromBridge(bridgePayload)
    if (!wrote) {
      return
    }
    if (input.expandedNodeIds !== undefined) {
      lastPersistedExpandedNodeIdsJson = JSON.stringify(input.expandedNodeIds)
    }
    if (input.scrollTopPx !== undefined) {
      lastPersistedScrollTopPx = input.scrollTopPx
    }
    const expandedDrifted = input.expandedNodeIds !== undefined &&
      JSON.stringify(uiState.value.expandedNodeIds) !== JSON.stringify(input.expandedNodeIds)
    const scrollDrifted = input.scrollTopPx !== undefined &&
      uiState.value.scrollTopPx !== input.scrollTopPx
    if (expandedDrifted || scrollDrifted) {
      return
    }
    const expandedNodeIds = input.expandedNodeIds ?? uiState.value.expandedNodeIds
    const scrollTopPx = input.scrollTopPx ?? uiState.value.scrollTopPx
    uiState.value = {
      expandedNodeIds,
      schemaVersion: 1,
      scrollTopPx
    }
  }

  async function persistUiStatePatchNow (
    patch: Partial<Pick<I_faProjectHierarchyTreeUiState, 'expandedNodeIds' | 'scrollTopPx'>> & {
      epochAtSchedule?: number
      expandedNodeIdsBaseJson?: string
    },
    options?: {
      ignoreReplacementFlight?: boolean
    }
  ): Promise<void> {
    hierarchyUiStateGeneration += 1
    const pendingPersist = uiStatePersistInFlight
    if (pendingPersist !== null) {
      await pendingPersist
    }
    if (!S_FaActiveProject().hasActiveProject) {
      return
    }
    const epochAtSchedule = patch.epochAtSchedule
    if (
      epochAtSchedule !== undefined &&
      S_FaActiveProject().readProjectContentEpoch() !== epochAtSchedule
    ) {
      return
    }
    const ignoreReplacementFlight = options?.ignoreReplacementFlight === true
    if (!ignoreReplacementFlight && S_FaActiveProject().isProjectReplacementInFlight()) {
      return
    }
    const liveExpandedJson = JSON.stringify(uiState.value.expandedNodeIds)
    const scheduledExpandedJson = patch.expandedNodeIds === undefined
      ? undefined
      : JSON.stringify(patch.expandedNodeIds)
    const expandedFromPatch = scheduledExpandedJson === undefined || scheduledExpandedJson === liveExpandedJson
      ? patch.expandedNodeIds
      : undefined
    const scrollFromPatch = patch.scrollTopPx === undefined || patch.scrollTopPx === uiState.value.scrollTopPx
      ? patch.scrollTopPx
      : undefined
    const nextExpanded = expandedFromPatch ?? uiState.value.expandedNodeIds
    const plainExpandedNodeIds = [...nextExpanded]
    const nextScrollTop = scrollFromPatch ?? uiState.value.scrollTopPx
    const expandedJson = JSON.stringify(plainExpandedNodeIds)
    const expandedDirty = expandedJson !== lastPersistedExpandedNodeIdsJson
    const scrollDirty = nextScrollTop !== lastPersistedScrollTopPx
    const expandedNodeIds = expandedDirty ? plainExpandedNodeIds : undefined
    const scrollTopPx = scrollDirty ? nextScrollTop : undefined
    if (expandedNodeIds === undefined && scrollTopPx === undefined) {
      return
    }
    const expandedNodeIdsBaseJson = patch.expandedNodeIdsBaseJson ?? lastPersistedExpandedNodeIdsJson
    const expandedWrite = expandedNodeIds === undefined
      ? {}
      : {
          expandedNodeIds,
          expandedNodeIdsBaseJson
        }
    const scrollWrite = scrollTopPx === undefined
      ? {}
      : {
          scrollTopPx
        }
    const write = commitPersistedUiStatePatch({
      ...expandedWrite,
      ...scrollWrite
    })
    uiStatePersistInFlight = write
    try {
      await write
    } finally {
      if (uiStatePersistInFlight === write) {
        uiStatePersistInFlight = null
      }
    }
  }

  const schedulePersistUiStatePatch = debounce(
    (patch: Partial<Pick<I_faProjectHierarchyTreeUiState, 'expandedNodeIds' | 'scrollTopPx'>> & {
      epochAtSchedule?: number
      expandedNodeIdsBaseJson?: string
    }) => {
      void persistUiStatePatchNow(patch)
    },
    UI_STATE_PERSIST_DEBOUNCE_MS
  )

  function queuePersistExpandedNodeIds (
    expandedNodeIds: string[],
    options?: { allowEmpty?: boolean }
  ): void {
    const nextExpandedNodeIds = [...expandedNodeIds]
    const blockEmptyReplace = nextExpandedNodeIds.length === 0 &&
      uiState.value.expandedNodeIds.length > 0 &&
      options?.allowEmpty !== true
    if (blockEmptyReplace) {
      return
    }
    uiState.value = {
      ...uiState.value,
      expandedNodeIds: nextExpandedNodeIds
    }
    const epochAtSchedule = S_FaActiveProject().readProjectContentEpoch()
    const expandedNodeIdsBaseJson = lastPersistedExpandedNodeIdsJson
    schedulePersistUiStatePatch({
      epochAtSchedule,
      expandedNodeIds: nextExpandedNodeIds,
      expandedNodeIdsBaseJson
    })
  }

  function queuePersistScrollTopPx (scrollTopPx: number): void {
    uiState.value = {
      ...uiState.value,
      scrollTopPx
    }
    const epochAtSchedule = S_FaActiveProject().readProjectContentEpoch()
    schedulePersistUiStatePatch({
      epochAtSchedule,
      scrollTopPx
    })
  }

  function flushUiStatePersist (): void {
    schedulePersistUiStatePatch.flush()
  }

  async function flushUiStatePersistBeforeProjectReplacement (): Promise<void> {
    schedulePersistUiStatePatch.cancel()
    if (!S_FaActiveProject().hasActiveProject) {
      return
    }
    await persistUiStatePatchNow({}, {
      ignoreReplacementFlight: true
    })
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

  function patchWorldColorPaletteInLayout (worldId: string, colorPalette: string): void {
    worldColorPaletteOverrideSerial += 1
    worldColorPaletteOverrides.set(worldId, {
      colorPalette,
      serial: worldColorPaletteOverrideSerial
    })
    worlds.value = worlds.value.map((world) => {
      if (world.id !== worldId) {
        return world
      }
      return {
        ...world,
        colorPalette
      }
    })
  }

  const applyIndexedMoveOut = applyIndexedMove
  const applyIndexedReindexBucketOut = applyIndexedReindexBucket
  const clearPendingDocumentRefreshIdsOut = clearPendingDocumentRefreshIds
  const clearPendingHierarchyNodeRefreshIdsOut = clearPendingHierarchyNodeRefreshIds
  const clearPendingRevealPathOut = clearPendingRevealPath
  const clearSearchOut = clearSearch
  const bumpDocumentCensusRefreshGenerationOut = bumpDocumentCensusRefreshGeneration
  const bumpDocumentLastOpenedRefreshGenerationOut = bumpDocumentLastOpenedRefreshGeneration
  const documentCensusRefreshGenerationOut = documentCensusRefreshGeneration
  const documentLastOpenedRefreshGenerationOut = documentLastOpenedRefreshGeneration
  const ensureDocumentIndexLoadedOut = ensureDocumentIndexLoaded
  const flushUiStatePersistBeforeProjectReplacementOut = flushUiStatePersistBeforeProjectReplacement
  const flushUiStatePersistOut = flushUiStatePersist
  const layoutRefreshGenerationOut = layoutRefreshGeneration
  const listIndexedPlacementChildrenOut = listIndexedPlacementChildren
  const patchWorldColorPaletteInLayoutOut = patchWorldColorPaletteInLayout
  const pendingDocumentRefreshIdsOut = pendingDocumentRefreshIds
  const pendingHierarchyNodeRefreshIdsOut = pendingHierarchyNodeRefreshIds
  const pendingRevealPathOut = pendingRevealPath
  const queuePersistExpandedNodeIdsOut = queuePersistExpandedNodeIds
  const queuePersistScrollTopPxOut = queuePersistScrollTopPx
  const refreshDocumentsInTreeOut = refreshDocumentsInTree
  const refreshHierarchyTreeNodesOut = refreshHierarchyTreeNodes
  const refreshLayoutOut = refreshLayout
  const refreshUiStateOut = refreshUiState
  const reloadDocumentIndexFromBridgeOut = reloadDocumentIndexFromBridge
  const replaceDocumentIndexFromDocumentsOut = replaceDocumentIndexFromDocuments
  const requestRevealSearchHitOut = requestRevealSearchHit
  const resetOnProjectCloseOut = resetOnProjectClose
  const searchHitsOut = searchHits
  const setSearchHitsOut = setSearchHits
  /**
   * Component-testing only: replace hierarchy session without bridge hydrate.
   */
  function replaceSessionForComponentTesting (input: {
    treeData?: I_faProjectHierarchyTreeHeTreeNode[] | undefined
    uiState?: I_faProjectHierarchyTreeUiState | undefined
    worlds: I_faProjectHierarchyTreeWorkspaceWorld[]
  }): void {
    worlds.value = input.worlds
    if (input.treeData !== undefined) {
      treeData.value = input.treeData
    }
    if (input.uiState !== undefined) {
      applyUiState(input.uiState)
    }
    layoutRefreshGeneration.value += 1
    clearDocumentIndex()
  }

  const treeDataOut = treeData
  const uiStateOut = uiState
  const upsertIndexedDocumentOut = upsertIndexedDocument
  const worldsOut = worlds
  const replaceSessionForComponentTestingOut = replaceSessionForComponentTesting
  const publishedDocumentCensusRefreshGeneration = readonly(documentCensusRefreshGenerationOut)
  const publishedDocumentLastOpenedRefreshGeneration = readonly(documentLastOpenedRefreshGenerationOut)
  const publishedLayoutRefreshGeneration = readonly(layoutRefreshGenerationOut)
  const publishedSearchHits = readonly(searchHitsOut)
  const publishedUiState = readonly(uiStateOut)
  const publishedWorlds = readonly(worldsOut)

  return {
    applyIndexedMove: applyIndexedMoveOut,
    applyIndexedReindexBucket: applyIndexedReindexBucketOut,
    bumpDocumentCensusRefreshGeneration: bumpDocumentCensusRefreshGenerationOut,
    bumpDocumentLastOpenedRefreshGeneration: bumpDocumentLastOpenedRefreshGenerationOut,
    clearPendingDocumentRefreshIds: clearPendingDocumentRefreshIdsOut,
    clearPendingHierarchyNodeRefreshIds: clearPendingHierarchyNodeRefreshIdsOut,
    clearPendingRevealPath: clearPendingRevealPathOut,
    clearSearch: clearSearchOut,
    documentCensusRefreshGeneration: publishedDocumentCensusRefreshGeneration,
    documentLastOpenedRefreshGeneration: publishedDocumentLastOpenedRefreshGeneration,
    ensureDocumentIndexLoaded: ensureDocumentIndexLoadedOut,
    flushUiStatePersist: flushUiStatePersistOut,
    flushUiStatePersistBeforeProjectReplacement: flushUiStatePersistBeforeProjectReplacementOut,
    layoutRefreshGeneration: publishedLayoutRefreshGeneration,
    listIndexedPlacementChildren: listIndexedPlacementChildrenOut,
    patchWorldColorPaletteInLayout: patchWorldColorPaletteInLayoutOut,
    pendingDocumentRefreshIds: pendingDocumentRefreshIdsOut,
    pendingHierarchyNodeRefreshIds: pendingHierarchyNodeRefreshIdsOut,
    pendingRevealPath: pendingRevealPathOut,
    queuePersistExpandedNodeIds: queuePersistExpandedNodeIdsOut,
    queuePersistScrollTopPx: queuePersistScrollTopPxOut,
    refreshDocumentsInTree: refreshDocumentsInTreeOut,
    refreshHierarchyTreeNodes: refreshHierarchyTreeNodesOut,
    refreshLayout: refreshLayoutOut,
    refreshUiState: refreshUiStateOut,
    reloadDocumentIndexFromBridge: reloadDocumentIndexFromBridgeOut,
    replaceDocumentIndexFromDocuments: replaceDocumentIndexFromDocumentsOut,
    replaceSessionForComponentTesting: replaceSessionForComponentTestingOut,
    requestRevealSearchHit: requestRevealSearchHitOut,
    resetOnProjectClose: resetOnProjectCloseOut,
    searchHits: publishedSearchHits,
    setSearchHits: setSearchHitsOut,
    treeData: treeDataOut,
    uiState: publishedUiState,
    upsertIndexedDocument: upsertIndexedDocumentOut,
    worlds: publishedWorlds
  }
})
