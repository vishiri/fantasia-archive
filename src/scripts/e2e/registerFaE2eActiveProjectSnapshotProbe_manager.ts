import { getActivePinia } from 'pinia'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

import { createRegisterFaE2eActiveProjectSnapshotProbe } from './functions/createRegisterFaE2eActiveProjectSnapshotProbe'

const registerFaE2eActiveProjectSnapshotProbeApi = createRegisterFaE2eActiveProjectSnapshotProbe({
  getActivePinia,
  getActiveProjectFromStore: (pinia) => {
    const store = S_FaActiveProject(pinia)
    const project = store.activeProject
    if (project === null) {
      return null
    }
    return {
      filePath: project.filePath,
      id: project.id,
      name: project.name
    }
  },
  setE2eSnapshotGetter: (getter) => {
    window.__faE2eGetActiveProjectSnapshot = getter
  }
})

export const registerFaE2eActiveProjectSnapshotProbe =
  registerFaE2eActiveProjectSnapshotProbeApi.registerFaE2eActiveProjectSnapshotProbe
