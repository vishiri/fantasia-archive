import { ipcMain } from 'electron'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import {
  readFaProjectSidebarRoot,
  runWithFaProjectDatabaseForIpcAsync,
  upsertFaProjectSidebarKv
} from 'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
import { FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX } from 'app/types/I_faProjectSidebarDomain'
import { parseFaProjectSidebarPatch } from 'app/src-electron/shared/faProjectSidebarPatchSchema'
import type { I_faProjectSidebarRoot } from 'app/types/I_faProjectSidebarDomain'

const FA_PROJECT_MANAGEMENT_FALLBACK_PROJECT_SIDEBAR: I_faProjectSidebarRoot = {
  schemaVersion: 1,
  widthPx: FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX
}

function duplicateFaProjectSidebarSnapshot (
  next: I_faProjectSidebarRoot
): I_faProjectSidebarRoot {
  return {
    schemaVersion: next.schemaVersion,
    widthPx: next.widthPx
  }
}

/**
 * Registers workspace sidebar get/set IPC handlers on the shared project-management channel group.
 */
export function registerFaProjectManagementProjectSidebarIpc (): void {
  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.getProjectSidebarAsync,
    async (event): Promise<I_faProjectSidebarRoot> => {
      const ran = await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
        return duplicateFaProjectSidebarSnapshot(readFaProjectSidebarRoot(db))
      })
      if (!ran.ok) {
        return duplicateFaProjectSidebarSnapshot(FA_PROJECT_MANAGEMENT_FALLBACK_PROJECT_SIDEBAR)
      }
      return ran.value
    }
  )

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.setProjectSidebarPatchAsync,
    async (event, raw: unknown): Promise<boolean> => {
      const parsed = parseFaProjectSidebarPatch(raw)
      const ran = await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
        upsertFaProjectSidebarKv(db, parsed)
        return true
      })
      if (!ran.ok) {
        console.warn(
          '[faProjectManagement] setProjectSidebar skipped — no active project database (reload or session reset may be in progress)'
        )
        return false
      }
      return ran.value
    }
  )
}
