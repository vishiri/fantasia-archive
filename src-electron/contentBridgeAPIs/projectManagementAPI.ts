import { ipcRenderer } from 'electron'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import type {
  I_faProjectCreateInput,
  I_faProjectCreateResult,
  I_faProjectManagementAPI,
  I_faProjectOpenResult
} from 'app/types/I_faProjectManagementDomain'

export const projectManagementAPI: I_faProjectManagementAPI = {
  async createProject (input: I_faProjectCreateInput): Promise<I_faProjectCreateResult> {
    const payload = JSON.parse(JSON.stringify(input)) as I_faProjectCreateInput
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.createProjectAsync,
      payload
    ) as I_faProjectCreateResult
  },

  async openProject (): Promise<I_faProjectOpenResult> {
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.openProjectAsync,
      {}
    ) as I_faProjectOpenResult
  }
}
