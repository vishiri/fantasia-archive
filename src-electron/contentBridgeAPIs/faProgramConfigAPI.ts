import { ipcRenderer } from 'electron'

import { FA_PROGRAM_CONFIG_IPC } from 'app/src-electron/electron-ipc-bridge'
import type {
  I_faProgramConfigAPI,
  I_faProgramConfigApplyInput,
  I_faProgramConfigApplyResult,
  I_faProgramConfigExportOptions,
  I_faProgramConfigExportResult,
  I_faProgramConfigPrepareResult
} from 'app/types/I_faProgramConfigDomain'

export const faProgramConfigAPI: I_faProgramConfigAPI = {
  async exportToFile (options: I_faProgramConfigExportOptions): Promise<I_faProgramConfigExportResult> {
    return await ipcRenderer.invoke(FA_PROGRAM_CONFIG_IPC.exportToFileAsync, options) as I_faProgramConfigExportResult
  },

  async prepareImport (): Promise<I_faProgramConfigPrepareResult> {
    return await ipcRenderer.invoke(FA_PROGRAM_CONFIG_IPC.prepareImportAsync) as I_faProgramConfigPrepareResult
  },

  async applyImport (input: I_faProgramConfigApplyInput): Promise<I_faProgramConfigApplyResult> {
    return await ipcRenderer.invoke(FA_PROGRAM_CONFIG_IPC.applyImportAsync, input) as I_faProgramConfigApplyResult
  },

  async disposeImportSession (sessionId: string): Promise<void> {
    await ipcRenderer.invoke(FA_PROGRAM_CONFIG_IPC.disposeImportSessionAsync, sessionId)
  }
}
