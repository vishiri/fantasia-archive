import { ipcMain } from 'electron'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import {
  readFaProjectDialogUiPref,
  runWithFaProjectDatabaseForIpcAsync,
  upsertFaProjectDialogUiPref
} from 'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
import {
  parseFaProjectDialogUiPrefGetInput,
  parseFaProjectDialogUiPrefSetInput
} from 'app/src-electron/shared/faProjectDialogUiPrefSchema'
import type { I_faProjectDialogUiPrefGetResult } from 'app/types/I_faProjectDialogUiPrefDomain'

/**
 * Registers allowlisted dialog UI preference get/set IPC handlers.
 */
export function registerFaProjectManagementDialogUiPrefIpc (): void {
  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.getProjectDialogUiPrefAsync,
    async (event, raw: unknown): Promise<I_faProjectDialogUiPrefGetResult> => {
      const parsed = parseFaProjectDialogUiPrefGetInput(raw)
      const ran = await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
        return readFaProjectDialogUiPref(db, parsed.key)
      })
      if (!ran.ok) {
        const key = parsed.key
        return {
          key,
          value: null
        }
      }
      return ran.value
    }
  )

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.setProjectDialogUiPrefAsync,
    async (event, raw: unknown): Promise<boolean> => {
      const parsed = parseFaProjectDialogUiPrefSetInput(raw)
      const ran = await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
        upsertFaProjectDialogUiPref(db, parsed.key, parsed.value)
        return true
      })
      if (!ran.ok) {
        console.warn(
          '[faProjectManagement] setProjectDialogUiPref skipped — no active project database (reload or session reset may be in progress)'
        )
        return false
      }
      return ran.value
    }
  )
}
