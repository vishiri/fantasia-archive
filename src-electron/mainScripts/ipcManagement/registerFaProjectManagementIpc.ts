import { app, ipcMain } from 'electron'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import { closeFaProjectActiveDatabase } from 'app/src-electron/mainScripts/projectManagement/faProjectActiveDatabase'
import { runFaProjectCreateFromIpc } from 'app/src-electron/mainScripts/projectManagement/faProjectCreateRun'
import { installFaProjectManagementE2ePathOverrideGlobals } from 'app/src-electron/mainScripts/projectManagement/faProjectManagementE2ePathOverride'
import { runFaProjectOpenFromIpc } from 'app/src-electron/mainScripts/projectManagement/faProjectOpenRun'
import { getRecentProjectsSnapshot } from 'app/src-electron/mainScripts/projectManagement/faRecentProjectListRuntime'
import type {
  I_faProjectCreateResult,
  I_faProjectOpenResult
} from 'app/types/I_faProjectManagementDomain'
import type { I_faRecentProjectEntry } from 'app/types/I_faRecentProjectsDomain'

let registered = false

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
