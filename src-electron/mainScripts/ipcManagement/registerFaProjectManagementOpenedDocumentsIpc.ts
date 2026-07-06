import { ipcMain } from 'electron'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import {
  readFaProjectOpenedDocumentsSnapshot,
  runWithFaProjectDatabaseForIpcAsync,
  upsertFaProjectOpenedDocumentsSnapshot
} from 'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
import { parseFaOpenedDocumentsSnapshotPayload } from 'app/src-electron/shared/faOpenedDocumentsSnapshotSchema'
import type { I_faOpenedDocumentsSnapshot } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT } from 'app/types/I_faOpenedDocumentsDomain'

function duplicateFaOpenedDocumentsSnapshot (
  snapshot: I_faOpenedDocumentsSnapshot
): I_faOpenedDocumentsSnapshot {
  return {
    schemaVersion: snapshot.schemaVersion,
    activeDocumentId: snapshot.activeDocumentId,
    tabs: snapshot.tabs.map((tab) => ({ ...tab }))
  }
}

/**
 * Registers opened documents snapshot get/set IPC handlers on the project-management channel group.
 */
export function registerFaProjectManagementOpenedDocumentsIpc (): void {
  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.getOpenedDocumentsSnapshotAsync,
    async (event): Promise<I_faOpenedDocumentsSnapshot> => {
      const ran = await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
        return duplicateFaOpenedDocumentsSnapshot(readFaProjectOpenedDocumentsSnapshot(db))
      })
      if (!ran.ok) {
        return duplicateFaOpenedDocumentsSnapshot(FA_OPENED_DOCUMENTS_EMPTY_SNAPSHOT)
      }
      return ran.value
    }
  )

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.saveOpenedDocumentsSnapshotAsync,
    async (event, raw: unknown): Promise<boolean> => {
      const parsed = parseFaOpenedDocumentsSnapshotPayload(raw)
      const ran = await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
        upsertFaProjectOpenedDocumentsSnapshot(db, parsed)
        return true
      })
      if (!ran.ok) {
        console.warn(
          '[faProjectManagement] saveOpenedDocumentsSnapshot skipped — no active project database'
        )
        return false
      }
      return ran.value
    }
  )
}
