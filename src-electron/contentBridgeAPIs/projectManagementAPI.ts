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
import type {
  I_faProjectStylingPatch,
  I_faProjectStylingRoot
} from 'app/types/I_faProjectStylingDomain'
import type {
  I_faProjectSettingsPatch,
  I_faProjectSettingsRoot
} from 'app/types/I_faProjectSettingsDomain'
import type {
  I_faRecentProjectEntry,
  I_faRecentProjectMruHeadResolve
} from 'app/types/I_faRecentProjectsDomain'

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

  async getProjectSettings (): Promise<I_faProjectSettingsRoot> {
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.getProjectSettingsAsync
    ) as I_faProjectSettingsRoot
  },

  async getProjectStyling (): Promise<I_faProjectStylingRoot> {
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.getProjectStylingAsync
    ) as I_faProjectStylingRoot
  },

  async getRecentProjects (): Promise<I_faRecentProjectEntry[]> {
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.getRecentProjectsAsync
    ) as I_faRecentProjectEntry[]
  },

  async resolveRecentProjectMruHeadForOpen (): Promise<I_faRecentProjectMruHeadResolve> {
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.resolveRecentProjectMruHeadForOpenAsync
    ) as I_faRecentProjectMruHeadResolve
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
  },

  async setProjectSettings (patch: I_faProjectSettingsPatch): Promise<boolean> {
    const payload = JSON.parse(JSON.stringify(patch)) as I_faProjectSettingsPatch
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.setProjectSettingsPatchAsync,
      payload
    ) as boolean
  },

  async setProjectStyling (patch: I_faProjectStylingPatch): Promise<boolean> {
    const payload = JSON.parse(JSON.stringify(patch)) as I_faProjectStylingPatch
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.setProjectStylingPatchAsync,
      payload
    ) as boolean
  },

  async stageE2eNextCreatePath (filePath: string): Promise<boolean> {
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.stageE2eNextProjectCreatePathAsync,
      filePath
    ) as boolean
  },

  async stageE2eNextOpenPath (filePath: string): Promise<boolean> {
    return await ipcRenderer.invoke(
      FA_PROJECT_MANAGEMENT_IPC.stageE2eNextProjectOpenPathAsync,
      filePath
    ) as boolean
  }
}
