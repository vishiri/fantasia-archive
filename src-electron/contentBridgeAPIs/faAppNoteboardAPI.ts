import { ipcRenderer } from 'electron'

import { FA_APP_NOTEBOARD_IPC } from 'app/src-electron/electron-ipc-bridge'
import type {
  I_faAppNoteboardAPI,
  I_faAppNoteboardPatch,
  I_faAppNoteboardRoot
} from 'app/types/I_faAppNoteboardDomain'

/**
 * 'ipcStructuredClone' rejects Vue / Pinia reactive proxies; clone plain JSON payloads before invoke.
 */
function cloneNoteboardPatchForStructuredClone (patch: I_faAppNoteboardPatch): I_faAppNoteboardPatch {
  return JSON.parse(JSON.stringify(patch)) as I_faAppNoteboardPatch
}

export const faAppNoteboardAPI: I_faAppNoteboardAPI = {
  async getNoteboard (): Promise<I_faAppNoteboardRoot> {
    return await ipcRenderer.invoke(FA_APP_NOTEBOARD_IPC.getAsync) as I_faAppNoteboardRoot
  },

  async setNoteboard (patch: I_faAppNoteboardPatch): Promise<void> {
    await ipcRenderer.invoke(
      FA_APP_NOTEBOARD_IPC.setAsync,
      cloneNoteboardPatchForStructuredClone(patch)
    )
  }
}
