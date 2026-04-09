import { ipcRenderer } from 'electron'

import { FA_EXTRA_ENV_IPC } from 'app/src-electron/electron-ipc-bridge'
import type { I_extraEnvVariablesAPI } from 'app/types/I_extraEnvVariablesAPI'

// Extra variables for the app window (mostly used by component/E2E testing); main builds the snapshot (sandbox-safe preload).
export const extraEnvVariablesAPI: I_extraEnvVariablesAPI = ipcRenderer.sendSync(
  FA_EXTRA_ENV_IPC.snapshotSync
) as I_extraEnvVariablesAPI
