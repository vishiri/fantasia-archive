import { ipcRenderer } from 'electron'

import { FA_APP_DETAILS_IPC } from 'app/src-electron/electron-ipc-bridge'
import type { I_appDetailsAPI } from '../../types/I_appDetailsAPI'

function readProjectVersion (): string {
  try {
    const v = ipcRenderer.sendSync(FA_APP_DETAILS_IPC.getVersionSync)
    return typeof v === 'string' ? v : ''
  } catch {
    return ''
  }
}

export const appDetailsAPI: I_appDetailsAPI = {
  PROJECT_VERSION: readProjectVersion()
}
