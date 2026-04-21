import { ipcRenderer } from 'electron'

import { FA_PROGRAM_STYLING_IPC } from 'app/src-electron/electron-ipc-bridge'
import type {
  I_faProgramStylingAPI,
  I_faProgramStylingPatch,
  I_faProgramStylingRoot
} from 'app/types/I_faProgramStylingDomain'

/**
 * 'ipcRenderer.invoke' uses the structured-clone algorithm; Vue and Pinia reactive proxies are not cloneable.
 */
function cloneProgramStylingPatchForStructuredClone (patch: I_faProgramStylingPatch): I_faProgramStylingPatch {
  return JSON.parse(JSON.stringify(patch)) as I_faProgramStylingPatch
}

export const faProgramStylingAPI: I_faProgramStylingAPI = {
  async getProgramStyling (): Promise<I_faProgramStylingRoot> {
    return await ipcRenderer.invoke(FA_PROGRAM_STYLING_IPC.getAsync) as I_faProgramStylingRoot
  },

  async setProgramStyling (patch: I_faProgramStylingPatch): Promise<void> {
    await ipcRenderer.invoke(
      FA_PROGRAM_STYLING_IPC.setAsync,
      cloneProgramStylingPatchForStructuredClone(patch)
    )
  }
}
