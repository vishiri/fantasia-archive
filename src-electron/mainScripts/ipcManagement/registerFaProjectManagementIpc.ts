import { app, ipcMain } from 'electron'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import { registerFaProjectManagementProjectSettingsIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaProjectManagementProjectSettingsIpc'
import { registerFaProjectManagementE2eStagingIpc } from 'app/src-electron/mainScripts/ipcManagement/registerFaProjectManagementE2eStagingIpc'
import {
  closeFaProjectActiveDatabase,
  getRecentProjectsSnapshot,
  installFaProjectManagementE2ePathOverrideGlobals,
  readFaProjectNoteboardRoot,
  readFaProjectStylingRoot,
  resolveRecentProjectMruHeadForOpen,
  runFaProjectCreateFromIpc,
  runFaProjectOpenFromIpc,
  runWithFaProjectDatabaseForIpcAsync,
  upsertFaProjectNoteboardKv,
  upsertFaProjectStylingKv
} from 'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
import { parseFaProjectNoteboardPatch } from 'app/src-electron/shared/faProjectNoteboardPatchSchema'
import { parseFaProjectStylingPatch } from 'app/src-electron/shared/faProjectStylingPatchSchema'
import type {
  I_faProjectCreateResult,
  I_faProjectOpenResult
} from 'app/types/I_faProjectManagementDomain'
import type { I_faProjectNoteboardRoot } from 'app/types/I_faProjectNoteboardDomain'
import type { I_faProjectStylingRoot } from 'app/types/I_faProjectStylingDomain'
import type {
  I_faRecentProjectEntry,
  I_faRecentProjectMruHeadResolve
} from 'app/types/I_faRecentProjectsDomain'

const FA_PROJECT_MANAGEMENT_FALLBACK_PROJECT_NOTEBOARD: I_faProjectNoteboardRoot = {
  frame: null,
  schemaVersion: 1,
  text: ''
}

const FA_PROJECT_MANAGEMENT_FALLBACK_PROJECT_STYLING: I_faProjectStylingRoot = {
  css: '',
  frame: null,
  schemaVersion: 1
}

let registered = false

function duplicateFaProjectOverlayFrame (
  frame: I_faProjectNoteboardRoot['frame']
): I_faProjectNoteboardRoot['frame'] {
  return frame === null ? null : { ...frame }
}

function duplicateFaProjectNoteboardSnapshot (
  next: I_faProjectNoteboardRoot
): I_faProjectNoteboardRoot {
  return {
    frame: duplicateFaProjectOverlayFrame(next.frame),
    schemaVersion: next.schemaVersion,
    text: next.text
  }
}

function duplicateFaProjectStylingSnapshot (
  next: I_faProjectStylingRoot
): I_faProjectStylingRoot {
  return {
    css: next.css,
    frame: duplicateFaProjectOverlayFrame(next.frame),
    schemaVersion: next.schemaVersion
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
    FA_PROJECT_MANAGEMENT_IPC.resolveRecentProjectMruHeadForOpenAsync,
    (): I_faRecentProjectMruHeadResolve => {
      return resolveRecentProjectMruHeadForOpen()
    }
  )

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.getProjectNoteboardAsync,
    async (event): Promise<I_faProjectNoteboardRoot> => {
      const ran = await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
        return duplicateFaProjectNoteboardSnapshot(readFaProjectNoteboardRoot(db))
      })
      if (!ran.ok) {
        return duplicateFaProjectNoteboardSnapshot(FA_PROJECT_MANAGEMENT_FALLBACK_PROJECT_NOTEBOARD)
      }
      return ran.value
    }
  )

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.setProjectNoteboardPatchAsync,
    async (event, raw: unknown): Promise<boolean> => {
      const parsed = parseFaProjectNoteboardPatch(raw)
      const ran = await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
        upsertFaProjectNoteboardKv(db, parsed)
        return true
      })
      if (!ran.ok) {
        console.warn(
          '[faProjectManagement] setProjectNoteboard skipped — no active project database (reload or session reset may be in progress)'
        )
        return false
      }
      return ran.value
    }
  )

  registerFaProjectManagementProjectSettingsIpc()

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.getProjectStylingAsync,
    async (event): Promise<I_faProjectStylingRoot> => {
      const ran = await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
        return duplicateFaProjectStylingSnapshot(readFaProjectStylingRoot(db))
      })
      if (!ran.ok) {
        return duplicateFaProjectStylingSnapshot(FA_PROJECT_MANAGEMENT_FALLBACK_PROJECT_STYLING)
      }
      return ran.value
    }
  )

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.setProjectStylingPatchAsync,
    async (event, raw: unknown): Promise<boolean> => {
      const parsed = parseFaProjectStylingPatch(raw)
      const ran = await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
        upsertFaProjectStylingKv(db, parsed)
        return true
      })
      if (!ran.ok) {
        console.warn(
          '[faProjectManagement] setProjectStyling skipped — no active project database (reload or session reset may be in progress)'
        )
        return false
      }
      return ran.value
    }
  )

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.openProjectAsync,
    async (event, raw: unknown): Promise<I_faProjectOpenResult> => {
      return await runFaProjectOpenFromIpc(event, raw)
    }
  )

  registerFaProjectManagementE2eStagingIpc(ipcMain)

  installFaProjectManagementE2ePathOverrideGlobals()

  app.on('before-quit', () => {
    closeFaProjectActiveDatabase()
  })
}
