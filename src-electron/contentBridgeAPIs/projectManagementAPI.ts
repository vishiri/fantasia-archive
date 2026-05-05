import { ipcRenderer } from 'electron'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import type {
  I_faProjectCreateInput,
  I_faProjectCreateResult,
  I_faProjectManagementAPI
} from 'app/types/I_faProjectManagementDomain'

export const projectManagementAPI: I_faProjectManagementAPI = {
  async createProject (input: I_faProjectCreateInput): Promise<I_faProjectCreateResult> {
    const payload = JSON.parse(JSON.stringify(input)) as I_faProjectCreateInput
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.createProjectAsync,
      payload
    ) as I_faProjectCreateResult
  }
}
