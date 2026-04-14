import { ipcRenderer } from 'electron'

import { FA_KEYBINDS_IPC } from 'app/src-electron/electron-ipc-bridge'
import type { I_faKeybindsAPI } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsSnapshot } from 'app/types/I_faKeybindsDomain'

type T_faKeybindsSetPatch = {
  overrides?: I_faKeybindsRoot['overrides']
  replaceAllOverrides?: boolean
}

/**
 * ipcRenderer.invoke uses the structured-clone algorithm; Vue and Pinia reactive proxies are not cloneable.
 */
function cloneKeybindsPatchForStructuredClone (patch: T_faKeybindsSetPatch): T_faKeybindsSetPatch {
  return JSON.parse(JSON.stringify(patch)) as T_faKeybindsSetPatch
}

export const faKeybindsAPI: I_faKeybindsAPI = {
  async getKeybinds (): Promise<I_faKeybindsSnapshot> {
    return await ipcRenderer.invoke(FA_KEYBINDS_IPC.getAsync) as I_faKeybindsSnapshot
  },

  async setKeybinds (patch: T_faKeybindsSetPatch): Promise<void> {
    await ipcRenderer.invoke(
      FA_KEYBINDS_IPC.setAsync,
      cloneKeybindsPatchForStructuredClone(patch)
    )
  }
}
