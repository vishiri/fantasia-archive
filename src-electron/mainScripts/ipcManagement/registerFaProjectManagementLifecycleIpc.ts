import { ipcMain } from 'electron'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import { assertMainWindowSender } from 'app/src-electron/mainScripts/ipcManagement/assertMainWindowSenderWiring'
import {
  runFaProjectCreateFromIpc,
  runFaProjectOpenFromIpc
} from 'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
import type {
  I_faProjectCreateResult,
  I_faProjectOpenResult
} from 'app/types/I_faProjectManagementDomain'

/**
 * Registers create/open project IPC with main-window sender gate.
 */
export function registerFaProjectManagementLifecycleIpc (): void {
  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.createProjectAsync,
    async (event, raw: unknown): Promise<I_faProjectCreateResult> => {
      if (!assertMainWindowSender(event.sender)) {
        return { outcome: 'canceled' }
      }
      return await runFaProjectCreateFromIpc(event, raw)
    }
  )

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.openProjectAsync,
    async (event, raw: unknown): Promise<I_faProjectOpenResult> => {
      if (!assertMainWindowSender(event.sender)) {
        return { outcome: 'canceled' }
      }
      return await runFaProjectOpenFromIpc(event, raw)
    }
  )
}
