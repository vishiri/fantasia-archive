import { app, ipcMain } from 'electron'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import {
  closeFaProjectActiveDatabase,
  getFaProjectActiveDatabase
} from 'app/src-electron/mainScripts/projectManagement/faProjectActiveDatabase'
import { runFaProjectCreateFromIpc } from 'app/src-electron/mainScripts/projectManagement/faProjectCreateRun'
import { installFaProjectManagementE2ePathOverrideGlobals } from 'app/src-electron/mainScripts/projectManagement/faProjectManagementE2ePathOverride'
import { runFaProjectOpenFromIpc } from 'app/src-electron/mainScripts/projectManagement/faProjectOpenRun'
import {
  readFaProjectNoteboardRoot,
  upsertFaProjectNoteboardKv
} from 'app/src-electron/mainScripts/projectManagement/faProjectNoteboardPersist'
import { getRecentProjectsSnapshot } from 'app/src-electron/mainScripts/projectManagement/faRecentProjectListRuntime'
import { parseFaProjectNoteboardPatch } from 'app/src-electron/shared/faProjectNoteboardPatchSchema'
import type {
  I_faProjectCreateResult,
  I_faProjectOpenResult
} from 'app/types/I_faProjectManagementDomain'
import type { I_faProjectNoteboardRoot } from 'app/types/I_faProjectNoteboardDomain'
import type { I_faRecentProjectEntry } from 'app/types/I_faRecentProjectsDomain'

const FA_PROJECT_MANAGEMENT_FALLBACK_PROJECT_NOTEBOARD: I_faProjectNoteboardRoot = {
  frame: null,
  schemaVersion: 1,
  text: ''
}

let registered = false

function duplicateFaProjectNoteboardSnapshot (
  next: I_faProjectNoteboardRoot
): I_faProjectNoteboardRoot {
  const frameFrom = next.frame
  const frame =
    frameFrom === null ? null : { ...frameFrom }
  const snapshotText = next.text
  const schemaVersionValue = next.schemaVersion
  return {
    frame,
    schemaVersion: schemaVersionValue,
    text: snapshotText
  }
}

/**
 * Registers project-management IPC; safe to call once from 'startApp'.
 */
export function registerFaProjectManagementIpc (): void {
  if (registered) {
    return
  }
  registered = true

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.createProjectAsync,
    async (event, raw: unknown): Promise<I_faProjectCreateResult> => {
      return await runFaProjectCreateFromIpc(event, raw)
    }
  )

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.getRecentProjectsAsync,
    (): I_faRecentProjectEntry[] => {
      return getRecentProjectsSnapshot()
    }
  )

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.getProjectNoteboardAsync,
    (): I_faProjectNoteboardRoot => {
      const db = getFaProjectActiveDatabase()
      if (db === null) {
        return duplicateFaProjectNoteboardSnapshot(FA_PROJECT_MANAGEMENT_FALLBACK_PROJECT_NOTEBOARD)
      }
      return duplicateFaProjectNoteboardSnapshot(readFaProjectNoteboardRoot(db))
    }
  )

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.setProjectNoteboardPatchAsync,
    (_event, raw: unknown): boolean => {
      const parsed = parseFaProjectNoteboardPatch(raw)
      const db = getFaProjectActiveDatabase()
      if (db === null) {
        console.warn(
          '[faProjectManagement] setProjectNoteboard skipped — no active project database (reload or session reset may be in progress)'
        )
        return false
      }
      upsertFaProjectNoteboardKv(db, parsed)
      return true
    }
  )

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.openProjectAsync,
    async (event, raw: unknown): Promise<I_faProjectOpenResult> => {
      return await runFaProjectOpenFromIpc(event, raw)
    }
  )

  installFaProjectManagementE2ePathOverrideGlobals()

  app.on('before-quit', () => {
    closeFaProjectActiveDatabase()
  })
}
