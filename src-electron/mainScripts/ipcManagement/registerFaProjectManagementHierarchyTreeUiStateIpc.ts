import { ipcMain } from 'electron'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import {
  readFaProjectHierarchyTreeUiState,
  runWithFaProjectDatabaseForIpcAsync,
  upsertFaProjectHierarchyTreeUiStateKv
} from 'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
import { parseFaProjectHierarchyTreeUiStatePatch } from 'app/src-electron/shared/faProjectHierarchyTreeUiStateSchema'
import type { I_faProjectHierarchyTreeUiState } from 'app/types/I_faProjectHierarchyTreeDomain'

const FA_PROJECT_MANAGEMENT_FALLBACK_HIERARCHY_TREE_UI_STATE: I_faProjectHierarchyTreeUiState = {
  schemaVersion: 1,
  expandedNodeIds: [],
  scrollTopPx: 0
}

function duplicateFaProjectHierarchyTreeUiStateSnapshot (
  next: I_faProjectHierarchyTreeUiState
): I_faProjectHierarchyTreeUiState {
  return {
    schemaVersion: next.schemaVersion,
    expandedNodeIds: [...next.expandedNodeIds],
    scrollTopPx: next.scrollTopPx
  }
}

/**
 * Registers hierarchy tree UI state get/set IPC handlers on the project-management channel group.
 */
export function registerFaProjectManagementHierarchyTreeUiStateIpc (): void {
  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.getHierarchyTreeUiStateAsync,
    async (event): Promise<I_faProjectHierarchyTreeUiState> => {
      const ran = await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
        return duplicateFaProjectHierarchyTreeUiStateSnapshot(
          readFaProjectHierarchyTreeUiState(db)
        )
      })
      if (!ran.ok) {
        return duplicateFaProjectHierarchyTreeUiStateSnapshot(
          FA_PROJECT_MANAGEMENT_FALLBACK_HIERARCHY_TREE_UI_STATE
        )
      }
      return ran.value
    }
  )

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.setHierarchyTreeUiStatePatchAsync,
    async (event, raw: unknown): Promise<boolean> => {
      const parsed = parseFaProjectHierarchyTreeUiStatePatch(raw)
      const ran = await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
        upsertFaProjectHierarchyTreeUiStateKv(db, parsed)
        return true
      })
      if (!ran.ok) {
        console.warn(
          '[faProjectManagement] setHierarchyTreeUiState skipped — no active project database (reload or session reset may be in progress)'
        )
        return false
      }
      return ran.value
    }
  )
}
