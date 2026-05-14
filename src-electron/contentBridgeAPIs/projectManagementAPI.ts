import { ipcRenderer } from 'electron'

import { FA_PROJECT_MANAGEMENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import type {
  I_faProjectCreateInput,
  I_faProjectCreateResult,
  I_faProjectManagementAPI,
  I_faProjectOpenInput,
  I_faProjectOpenResult
} from 'app/types/I_faProjectManagementDomain'
import type {
  I_faProjectNoteboardPatch,
  I_faProjectNoteboardRoot
} from 'app/types/I_faProjectNoteboardDomain'
import type { I_faRecentProjectEntry } from 'app/types/I_faRecentProjectsDomain'

export const projectManagementAPI: I_faProjectManagementAPI = {
  async createProject (input: I_faProjectCreateInput): Promise<I_faProjectCreateResult> {
    const payload = JSON.parse(JSON.stringify(input)) as I_faProjectCreateInput
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.createProjectAsync,
      payload
    ) as I_faProjectCreateResult
  },

  async getProjectNoteboard (): Promise<I_faProjectNoteboardRoot> {
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.getProjectNoteboardAsync
    ) as I_faProjectNoteboardRoot
  },

  async getRecentProjects (): Promise<I_faRecentProjectEntry[]> {
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.getRecentProjectsAsync
    ) as I_faRecentProjectEntry[]
  },

  async openProject (input?: I_faProjectOpenInput): Promise<I_faProjectOpenResult> {
    const payload = (input === undefined)
      ? {}
      : JSON.parse(JSON.stringify(input)) as I_faProjectOpenInput
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.openProjectAsync,
      payload
    ) as I_faProjectOpenResult
  },

  async setProjectNoteboard (patch: I_faProjectNoteboardPatch): Promise<boolean> {
    const payload = JSON.parse(JSON.stringify(patch)) as I_faProjectNoteboardPatch
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.setProjectNoteboardPatchAsync,
      payload
    ) as boolean
  }
}
