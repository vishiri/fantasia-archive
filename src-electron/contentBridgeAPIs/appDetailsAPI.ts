import { ipcRenderer } from 'electron'

import { FA_APP_DETAILS_IPC } from 'app/src-electron/electron-ipc-bridge'
import type { I_appDetailsAPI } from 'app/types/I_faElectronRendererBridgeAPIs'

let versionPromise: Promise<string> | null = null

function loadProjectVersion (): Promise<string> {
  return (async () => {
    try {
      const v = await ipcRenderer.invoke(FA_APP_DETAILS_IPC.getVersionAsync) as unknown

      return typeof v === 'string' ? v : ''
    } catch {
      return ''
    }
  })()
}

export const appDetailsAPI: I_appDetailsAPI = {
  getProjectVersion (): Promise<string> {
    versionPromise ??= loadProjectVersion()

    return versionPromise
  }
}
