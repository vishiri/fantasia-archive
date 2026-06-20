import type { IpcMain } from 'electron'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import { parseFaProjectManagementE2eStageFilePath } from 'app/src-electron/mainScripts/projectManagement/functions/faProjectManagementStageE2ePath'
import {
  writeFaE2ePendingProjectCreatePath,
  writeFaE2ePendingProjectOpenPath
} from 'app/src-electron/mainScripts/projectManagement/functions/faProjectManagementE2ePathOverride'

/**
 * Registers Playwright E2E path-staging handlers on an existing ipcMain instance.
 */
export function registerFaProjectManagementE2eStagingIpc (ipcMain: IpcMain): void {
  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.stageE2eNextProjectCreatePathAsync,
    (_event, raw: unknown): boolean => {
      const filePath = parseFaProjectManagementE2eStageFilePath(process.env.TEST_ENV, raw)
      if (filePath === null) {
        return false
      }
      writeFaE2ePendingProjectCreatePath(filePath)
      return true
    }
  )

  ipcMain.handle(
    FA_PROJECT_MANAGEMENT_IPC.stageE2eNextProjectOpenPathAsync,
    (_event, raw: unknown): boolean => {
      const filePath = parseFaProjectManagementE2eStageFilePath(process.env.TEST_ENV, raw)
      if (filePath === null) {
        return false
      }
      writeFaE2ePendingProjectOpenPath(filePath)
      return true
    }
  )
}
