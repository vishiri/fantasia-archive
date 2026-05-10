import { ipcRenderer } from 'electron'

import { FA_APP_STYLING_IPC } from 'app/src-electron/electron-ipc-bridge'
import type {
  I_faAppStylingAPI,
  I_faAppStylingPatch,
  I_faAppStylingRoot
} from 'app/types/I_faAppStylingDomain'

/**
 * 'ipcRenderer.invoke' uses the structured-clone algorithm; Vue and Pinia reactive proxies are not cloneable.
 */
function cloneAppStylingPatchForStructuredClone (patch: I_faAppStylingPatch): I_faAppStylingPatch {
  return JSON.parse(JSON.stringify(patch)) as I_faAppStylingPatch
}

export const faAppStylingAPI: I_faAppStylingAPI = {
  async getAppStyling (): Promise<I_faAppStylingRoot> {
    return await ipcRenderer.invoke(FA_APP_STYLING_IPC.getAsync) as I_faAppStylingRoot
  },

  async setAppStyling (patch: I_faAppStylingPatch): Promise<void> {
    await ipcRenderer.invoke(
      FA_APP_STYLING_IPC.setAsync,
      cloneAppStylingPatchForStructuredClone(patch)
    )
  }
}
