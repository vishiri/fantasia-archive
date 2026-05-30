import { ipcMain } from 'electron'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import {
  readFaProjectSettingsRoot,
  readMirroredActiveProjectFilePathSync,
  recordRecentProjectEntry,
  runWithFaProjectDatabaseForIpcAsync,
  upsertFaProjectSettingsKv
} from 'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
import { parseFaProjectSettingsPatch } from 'app/src-electron/shared/faProjectSettingsPatchSchema'
import {
  FA_PROJECT_SETTINGS_FALLBACK_ROOT,
  type I_faProjectSettingsRoot
} from 'app/types/I_faProjectSettingsDomain'

const FA_PROJECT_MANAGEMENT_FALLBACK_PROJECT_SETTINGS: I_faProjectSettingsRoot =
  FA_PROJECT_SETTINGS_FALLBACK_ROOT

function duplicateFaProjectSettingsSnapshot (
  next: I_faProjectSettingsRoot
): I_faProjectSettingsRoot {
  return {
    projectName: next.projectName,
    schemaVersion: next.schemaVersion
  }
}

/**
 * Registers project-settings get/set IPC handlers on the shared project-management channel group.
 */
export function registerFaProjectManagementProjectSettingsIpc (): void {
  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.getProjectSettingsAsync,
    async (event): Promise<I_faProjectSettingsRoot> => {
      const ran = await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
        return duplicateFaProjectSettingsSnapshot(readFaProjectSettingsRoot(db))
      })
      if (!ran.ok) {
        return duplicateFaProjectSettingsSnapshot(FA_PROJECT_MANAGEMENT_FALLBACK_PROJECT_SETTINGS)
      }
      return ran.value
    }
  )

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.setProjectSettingsPatchAsync,
    async (event, raw: unknown): Promise<boolean> => {
      const parsed = parseFaProjectSettingsPatch(raw)
      const ran = await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
        upsertFaProjectSettingsKv(db, parsed)
        if (parsed.projectName !== undefined) {
          const filePath = readMirroredActiveProjectFilePathSync()
          if (filePath !== null) {
            recordRecentProjectEntry({
              filePath,
              name: parsed.projectName
            })
          }
        }
        return true
      })
      if (!ran.ok) {
        console.warn(
          '[faProjectManagement] setProjectSettings skipped — no active project database (reload or session reset may be in progress)'
        )
        return false
      }
      return ran.value
    }
  )
}
