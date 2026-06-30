import { ResultAsync } from 'neverthrow'

import type {
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeUiStatePatch,
  I_faProjectHierarchyTreeWorkspaceLayoutResult
} from 'app/types/I_faProjectHierarchyTreeDomain'

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
 * Loads workspace hierarchy layout skeleton via projectContent bridge.
 */
export async function faProjectHierarchyTreeRefreshLayoutFromBridge (): Promise<
I_faProjectHierarchyTreeWorkspaceLayoutResult | null
> {
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listWorkspaceHierarchyLayout !== 'function') {
    return null
  }
  const readResult = await ResultAsync.fromPromise(
    api.listWorkspaceHierarchyLayout(),
    (error): unknown => error
  )
  if (readResult.isErr()) {
    console.error('[S_FaProjectHierarchyTree] listWorkspaceHierarchyLayout failed', readResult.error)
    return null
  }
  return readResult.value
}

export function createEmptyProjectHierarchyTreeUiState (): I_faProjectHierarchyTreeUiState {
  return {
    ...EMPTY_UI_STATE,
    expandedNodeIds: []
  }
}
