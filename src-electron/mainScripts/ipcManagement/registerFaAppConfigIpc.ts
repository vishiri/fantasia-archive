import type { OpenDialogOptions } from 'electron'
import { dialog, ipcMain } from 'electron'

import { FA_APP_CONFIG_IPC } from 'app/src-electron/electron-ipc-bridge'
import { windowFromIpcEvent } from 'app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc'
import {
  faAppConfigImportStagedSessions,
  pathLooksLikeFaconfigFile,
  purgeFaAppConfigStagedImportSessionsExpired
} from 'app/src-electron/mainScripts/appConfig/faAppConfigImportStagedState'
import { getFaAppConfigImportOpenDefaultPath } from 'app/src-electron/mainScripts/appConfig/faAppConfigFileDialogDefaultPaths'
import {
  installFaAppConfigE2ePathOverrideGlobals,
  takeNextE2eAppConfigImportPath
} from 'app/src-electron/mainScripts/appConfig/faAppConfigE2ePathOverride'
import { runApplyStagedAppConfigImport } from 'app/src-electron/mainScripts/appConfig/faAppConfigIpcRunApplyStagedImport'
import { runExportAppConfigToFile } from 'app/src-electron/mainScripts/appConfig/faAppConfigIpcRunExportToFileDialog'
import { runPrepareImportFromFaconfigFilePath } from 'app/src-electron/mainScripts/appConfig/faAppConfigIpcRunPrepareImportFromFile'
import { appWindow } from 'app/src-electron/mainScripts/windowManagement/mainWindowCreation'
import {
  parseFaAppConfigApplyInput,
  parseFaAppConfigExportOptions
} from 'app/src-electron/shared/faAppConfigIpcPayloadSchemas'
import type {
  I_faAppConfigApplyResult,
  I_faAppConfigExportResult,
  I_faAppConfigPrepareResult
} from 'app/types/I_faAppConfigDomain'

let registered = false

/**
 * Safe to call once from 'startApp'; subsequent calls no-op.
 */
export function registerFaAppConfigIpc (): void {
  if (registered) {
    return
  }
  registered = true

  ipcMain.handle(
    FA_APP_CONFIG_IPC.exportToFileAsync,
    async (event, options: unknown): Promise<I_faAppConfigExportResult> => {
      try {
        const parsed = parseFaAppConfigExportOptions(options)
        return await runExportAppConfigToFile(event, parsed)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        return {
          errorMessage: err.message,
          errorName: err.name,
          outcome: 'error'
        }
      }
    }
  )

  ipcMain.handle(
    FA_APP_CONFIG_IPC.prepareImportAsync,
    async (event): Promise<I_faAppConfigPrepareResult> => {
      purgeFaAppConfigStagedImportSessionsExpired()
      const e2eImportPath = takeNextE2eAppConfigImportPath()
      if (e2eImportPath !== null) {
        if (!pathLooksLikeFaconfigFile(e2eImportPath)) {
          return {
            errorName: 'FileError',
            errorMessage: 'Only .faconfig files are accepted',
            outcome: 'error'
          }
        }
        return await runPrepareImportFromFaconfigFilePath(e2eImportPath)
      }
      const win = windowFromIpcEvent(event) ?? appWindow
      const openOpts: OpenDialogOptions = {
        defaultPath: getFaAppConfigImportOpenDefaultPath(),
        filters: [
          {
            extensions: ['faconfig'],
            name: 'Fantasia app configuration'
          }
        ],
        properties: ['openFile'],
        title: 'Import app configuration'
      }
      const { canceled, filePaths } = win !== undefined
        ? await dialog.showOpenDialog(win, openOpts)
        : await dialog.showOpenDialog(openOpts)
      if (canceled || filePaths.length === 0) {
        return { outcome: 'canceled' }
      }
      const filePath = filePaths[0]
      if (filePath === undefined || !pathLooksLikeFaconfigFile(filePath)) {
        return {
          errorName: 'FileError',
          errorMessage: 'Only .faconfig files are accepted',
          outcome: 'error'
        }
      }
      return await runPrepareImportFromFaconfigFilePath(filePath)
    }
  )

  ipcMain.handle(
    FA_APP_CONFIG_IPC.applyImportAsync,
    (_event, input: unknown): I_faAppConfigApplyResult => {
      const parsed = parseFaAppConfigApplyInput(input)
      return runApplyStagedAppConfigImport(parsed)
    }
  )

  ipcMain.handle(
    FA_APP_CONFIG_IPC.disposeImportSessionAsync,
    async (_event, sessionId: unknown) => {
      if (typeof sessionId === 'string' && sessionId.length > 0) {
        faAppConfigImportStagedSessions.delete(sessionId)
      }
    }
  )

  installFaAppConfigE2ePathOverrideGlobals()
}
