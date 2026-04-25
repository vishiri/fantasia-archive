import type { OpenDialogOptions } from 'electron'
import { dialog, ipcMain } from 'electron'

import { FA_PROGRAM_CONFIG_IPC } from 'app/src-electron/electron-ipc-bridge'
import { windowFromIpcEvent } from 'app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc'
import {
  faProgramConfigImportStagedSessions,
  pathLooksLikeFaconfigFile,
  purgeFaProgramConfigStagedImportSessionsExpired
} from 'app/src-electron/mainScripts/programConfig/faProgramConfigImportStagedState'
import { getFaProgramConfigImportOpenDefaultPath } from 'app/src-electron/mainScripts/programConfig/faProgramConfigFileDialogDefaultPaths'
import {
  installFaProgramConfigE2ePathOverrideGlobals,
  takeNextE2eProgramConfigImportPath
} from 'app/src-electron/mainScripts/programConfig/faProgramConfigE2ePathOverride'
import { runApplyStagedProgramConfigImport } from 'app/src-electron/mainScripts/programConfig/faProgramConfigIpcRunApplyStagedImport'
import { runExportProgramConfigToFile } from 'app/src-electron/mainScripts/programConfig/faProgramConfigIpcRunExportToFileDialog'
import { runPrepareImportFromFaconfigFilePath } from 'app/src-electron/mainScripts/programConfig/faProgramConfigIpcRunPrepareImportFromFile'
import { appWindow } from 'app/src-electron/mainScripts/windowManagement/mainWindowCreation'
import type {
  I_faProgramConfigApplyInput,
  I_faProgramConfigApplyResult,
  I_faProgramConfigExportOptions,
  I_faProgramConfigExportResult,
  I_faProgramConfigPrepareResult
} from 'app/types/I_faProgramConfigDomain'

let registered = false

/**
 * Safe to call once from 'startApp'; subsequent calls no-op.
 */
export function registerFaProgramConfigIpc (): void {
  if (registered) {
    return
  }
  registered = true

  ipcMain.handle(
    FA_PROGRAM_CONFIG_IPC.exportToFileAsync,
    async (event, options: unknown): Promise<I_faProgramConfigExportResult> => {
      return await runExportProgramConfigToFile(event, options as I_faProgramConfigExportOptions)
    }
  )

  ipcMain.handle(
    FA_PROGRAM_CONFIG_IPC.prepareImportAsync,
    async (event): Promise<I_faProgramConfigPrepareResult> => {
      purgeFaProgramConfigStagedImportSessionsExpired()
      const e2eImportPath = takeNextE2eProgramConfigImportPath()
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
        defaultPath: getFaProgramConfigImportOpenDefaultPath(),
        filters: [
          {
            extensions: ['faconfig'],
            name: 'Fantasia program configuration'
          }
        ],
        properties: ['openFile'],
        title: 'Import program configuration'
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
    FA_PROGRAM_CONFIG_IPC.applyImportAsync,
    (_event, input: unknown): I_faProgramConfigApplyResult => {
      if (typeof input !== 'object' || input === null) {
        throw new TypeError('applyImport: expected object')
      }
      const p = input as I_faProgramConfigApplyInput
      if (typeof p.sessionId !== 'string') {
        throw new TypeError('applyImport: expected sessionId')
      }
      if (
        typeof p.applyProgramSettings !== 'boolean' ||
        typeof p.applyKeybinds !== 'boolean' ||
        typeof p.applyProgramStyling !== 'boolean'
      ) {
        throw new TypeError('applyImport: expected boolean apply flags')
      }
      return runApplyStagedProgramConfigImport(p)
    }
  )

  ipcMain.handle(
    FA_PROGRAM_CONFIG_IPC.disposeImportSessionAsync,
    async (_event, sessionId: unknown) => {
      if (typeof sessionId === 'string' && sessionId.length > 0) {
        faProgramConfigImportStagedSessions.delete(sessionId)
      }
    }
  )

  installFaProgramConfigE2ePathOverrideGlobals()
}
