import { ipcRenderer } from 'electron'

import { FA_APP_CONFIG_IPC } from 'app/src-electron/electron-ipc-bridge'
import type {
  I_faAppConfigAPI,
  I_faAppConfigApplyInput,
  I_faAppConfigApplyResult,
  I_faAppConfigExportOptions,
  I_faAppConfigExportResult,
  I_faAppConfigPrepareResult
} from 'app/types/I_faAppConfigDomain'

export const faAppConfigAPI: I_faAppConfigAPI = {
  async exportToFile (options: I_faAppConfigExportOptions): Promise<I_faAppConfigExportResult> {
    return await ipcRenderer.invoke(FA_APP_CONFIG_IPC.exportToFileAsync, options) as I_faAppConfigExportResult
  },

  async prepareImport (): Promise<I_faAppConfigPrepareResult> {
    return await ipcRenderer.invoke(FA_APP_CONFIG_IPC.prepareImportAsync) as I_faAppConfigPrepareResult
  },

  async applyImport (input: I_faAppConfigApplyInput): Promise<I_faAppConfigApplyResult> {
    return await ipcRenderer.invoke(FA_APP_CONFIG_IPC.applyImportAsync, input) as I_faAppConfigApplyResult
  },

  async disposeImportSession (sessionId: string): Promise<void> {
    await ipcRenderer.invoke(FA_APP_CONFIG_IPC.disposeImportSessionAsync, sessionId)
  },

  async stageE2eNextExportPath (filePath: string): Promise<boolean> {
    return await ipcRenderer.invoke(
      FA_APP_CONFIG_IPC.stageE2eNextExportPathAsync,
      filePath
    ) as boolean
  },

  async stageE2eNextImportPath (filePath: string): Promise<boolean> {
    return await ipcRenderer.invoke(
      FA_APP_CONFIG_IPC.stageE2eNextImportPathAsync,
      filePath
    ) as boolean
  }
}
