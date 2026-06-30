import type Database from 'better-sqlite3'

import type {
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeUiStatePatch
} from 'app/types/I_faProjectHierarchyTreeDomain'
import {
  parseFaProjectHierarchyTreeUiStateJson,
  serializeFaProjectHierarchyTreeUiStateJson
} from 'app/src-electron/shared/faProjectHierarchyTreeUiStateSchema'
import {
  readFaProjectDataKv,
  upsertFaProjectDataKv
} from './faProjectDataKvWiring'

export const FA_PROJECT_HIERARCHY_TREE_UI_STATE_KV_KEY = 'hierarchy_tree_ui_state' as const

const FA_PROJECT_HIERARCHY_TREE_UI_STATE_DEFAULT: I_faProjectHierarchyTreeUiState = {
  schemaVersion: 1,
  expandedNodeIds: [],
  scrollTopPx: 0
}

function duplicateFaProjectHierarchyTreeUiState (
  state: I_faProjectHierarchyTreeUiState
): I_faProjectHierarchyTreeUiState {
  return {
    schemaVersion: state.schemaVersion,
    expandedNodeIds: [...state.expandedNodeIds],
    scrollTopPx: state.scrollTopPx
  }
}

/**
 * Reads persisted hierarchy tree UI state from project_data KV.
 */
export function readFaProjectHierarchyTreeUiState (
  db: Database
): I_faProjectHierarchyTreeUiState {
  const raw = readFaProjectDataKv(db, FA_PROJECT_HIERARCHY_TREE_UI_STATE_KV_KEY)
  if (raw === undefined) {
    return duplicateFaProjectHierarchyTreeUiState(FA_PROJECT_HIERARCHY_TREE_UI_STATE_DEFAULT)
  }
  return duplicateFaProjectHierarchyTreeUiState(parseFaProjectHierarchyTreeUiStateJson(raw))
}

/**
 * Merges a validated patch into hierarchy_tree_ui_state KV for the loaded project SQLite file.
 */
export function upsertFaProjectHierarchyTreeUiStateKv (
  db: Database,
  patch: I_faProjectHierarchyTreeUiStatePatch
): void {
  if (patch.expandedNodeIds === undefined && patch.scrollTopPx === undefined) {
    return
  }
  const current = readFaProjectHierarchyTreeUiState(db)
  const next: I_faProjectHierarchyTreeUiState = {
    schemaVersion: 1,
    expandedNodeIds: patch.expandedNodeIds ?? current.expandedNodeIds,
    scrollTopPx: patch.scrollTopPx ?? current.scrollTopPx
  }
  upsertFaProjectDataKv(
    db,
    FA_PROJECT_HIERARCHY_TREE_UI_STATE_KV_KEY,
    serializeFaProjectHierarchyTreeUiStateJson(next)
  )
}
