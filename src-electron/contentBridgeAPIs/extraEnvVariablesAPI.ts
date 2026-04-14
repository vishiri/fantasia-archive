import { ipcRenderer } from 'electron'

import { FA_EXTRA_ENV_IPC } from 'app/src-electron/electron-ipc-bridge'
import type {
  I_extraEnvVariablesAPI,
  I_extraEnvVariablesBridge
} from 'app/types/I_faElectronRendererBridgeAPIs'

let cachedSnapshot: I_extraEnvVariablesAPI | null = null
let snapshotPromise: Promise<I_extraEnvVariablesAPI> | null = null

// Extra variables for the app window (mostly used by component/E2E testing); main builds the snapshot (sandbox-safe preload).
export const extraEnvVariablesAPI: I_extraEnvVariablesBridge = {
  getCachedSnapshot (): I_extraEnvVariablesAPI | null {
    return cachedSnapshot
  },

  getSnapshot (): Promise<I_extraEnvVariablesAPI> {
    snapshotPromise ??= (
      ipcRenderer.invoke(
        FA_EXTRA_ENV_IPC.snapshotAsync
      ) as Promise<I_extraEnvVariablesAPI>
    ).then((snap) => {
      cachedSnapshot = snap
      return snap
    })

    return snapshotPromise
  }
}
