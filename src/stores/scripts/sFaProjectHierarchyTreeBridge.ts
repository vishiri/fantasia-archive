import { ResultAsync } from 'neverthrow'

import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type {
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeUiStatePatch,
  I_faProjectHierarchyTreeWorkspaceLayoutResult
} from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  listFaProjectTagsWithDocumentCountsForWorldForRenderer,
  listFaProjectWorkspaceHierarchyLayoutForRenderer
} from 'app/src/scripts/componentTesting/faComponentTestingProjectContentTagsOverridesWiring'

const EMPTY_UI_STATE: I_faProjectHierarchyTreeUiState = {
  expandedNodeIds: [],
  schemaVersion: 1,
  scrollTopPx: 0
}

/**
 * Reads hierarchy_tree_ui_state from the active project via preload bridge.
 */
export async function faProjectHierarchyTreeRefreshUiStateFromBridge (opts: {
  applyUiState: (next: I_faProjectHierarchyTreeUiState) => void
}): Promise<boolean> {
  const api = window.faContentBridgeAPIs?.projectManagement
  if (typeof api?.getHierarchyTreeUiState !== 'function') {
    return false
  }
  const readResult = await ResultAsync.fromPromise(
    api.getHierarchyTreeUiState(),
    (error): unknown => error
  )
  if (readResult.isErr()) {
    console.error('[S_FaProjectHierarchyTree] getHierarchyTreeUiState failed', readResult.error)
    return false
  }
  opts.applyUiState(readResult.value)
  return true
}

/**
 * Persists a hierarchy_tree_ui_state patch via preload bridge.
 */
export async function faProjectHierarchyTreePersistUiStatePatchFromBridge (
  patch: I_faProjectHierarchyTreeUiStatePatch
): Promise<boolean> {
  const api = window.faContentBridgeAPIs?.projectManagement
  if (typeof api?.setHierarchyTreeUiState !== 'function') {
    console.warn('[S_FaProjectHierarchyTree] setHierarchyTreeUiState unavailable — restart Electron dev to load preload')
    return false
  }
  const writeResult = await ResultAsync.fromPromise(
    api.setHierarchyTreeUiState(patch),
    (error): unknown => error
  )
  if (writeResult.isErr()) {
    console.error('[S_FaProjectHierarchyTree] setHierarchyTreeUiState failed', writeResult.error)
    return false
  }
  if (!writeResult.value) {
    console.warn('[S_FaProjectHierarchyTree] setHierarchyTreeUiState returned false')
    return false
  }
  return true
}

/**
 * Loads workspace hierarchy layout skeleton via projectContent bridge,
 * then attaches per-world tags with document counts.
 */
export async function faProjectHierarchyTreeRefreshLayoutFromBridge (): Promise<
I_faProjectHierarchyTreeWorkspaceLayoutResult | null
> {
  const readResult = await ResultAsync.fromPromise(
    listFaProjectWorkspaceHierarchyLayoutForRenderer(),
    (error): unknown => error
  )
  if (readResult.isErr()) {
    console.error('[S_FaProjectHierarchyTree] listWorkspaceHierarchyLayout failed', readResult.error)
    return null
  }
  const worlds = await Promise.all(readResult.value.worlds.map(async (world) => {
    const tagsResult = await ResultAsync.fromPromise(
      listFaProjectTagsWithDocumentCountsForWorldForRenderer({ worldId: world.id }),
      (error): unknown => error
    )
    if (tagsResult.isErr()) {
      console.error('[S_FaProjectHierarchyTree] listTagsWithDocumentCountsForWorld failed', tagsResult.error)
      const tags = world.tags ?? []
      return {
        ...world,
        tags
      }
    }
    const tags = tagsResult.value.items.map((item) => {
      const categoryCount = item.categoryCount
      const documentCount = item.documentCount
      const id = item.id
      const name = item.name
      return {
        categoryCount,
        documentCount,
        id,
        name
      }
    })
    return {
      ...world,
      tags
    }
  }))
  return {
    worlds
  }
}

export function createEmptyProjectHierarchyTreeUiState (): I_faProjectHierarchyTreeUiState {
  const expandedNodeIds: I_faProjectHierarchyTreeUiState['expandedNodeIds'] = []
  return {
    ...EMPTY_UI_STATE,
    expandedNodeIds
  }
}

/**
 * Loads every project document via listDocuments with no world filter.
 * Missing API returns an empty list. Bridge errors return null so callers keep a prior dump.
 */
export async function faProjectHierarchyTreeRefreshDocumentsFromBridge (): Promise<
I_faProjectDocument[] | null
> {
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listDocuments !== 'function') {
    return []
  }
  const readResult = await ResultAsync.fromPromise(
    api.listDocuments(),
    (error): unknown => error
  )
  if (readResult.isErr()) {
    console.error('[S_FaProjectHierarchyTree] listDocuments failed', readResult.error)
    return null
  }
  return readResult.value.items
}
