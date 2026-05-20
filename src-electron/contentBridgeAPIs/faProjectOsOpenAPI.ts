import { ipcRenderer } from 'electron'

import { FA_PROJECT_OS_OPEN_IPC } from 'app/src-electron/electron-ipc-bridge'

let osOpenListenerInstalled = false

/**
 * Delivers main-process OS file-open paths to the renderer (same contract as menu open-by-path).
 */
export function installFaProjectOsOpenFromOsListener (
  onOpen: (filePath: string) => void
): void {
  if (osOpenListenerInstalled) {
    return
  }
  osOpenListenerInstalled = true
  ipcRenderer.on(
    FA_PROJECT_OS_OPEN_IPC.openFromOsToRenderer,
    (_event, payload: unknown) => {
      if (typeof payload !== 'object' || payload === null) {
        return
      }
      const rec = payload as { filePath?: unknown }
      const fp = typeof rec.filePath === 'string' ? rec.filePath.trim() : ''
      if (fp.length === 0) {
        return
      }
      onOpen(fp)
    }
  )
}

export function sendFaProjectOsOpenRendererReady (): void {
  ipcRenderer.send(FA_PROJECT_OS_OPEN_IPC.rendererReadyToMain)
}

export const faProjectOsOpenAPI = {
  installOsOpenListener: installFaProjectOsOpenFromOsListener,
  sendRendererReady: sendFaProjectOsOpenRendererReady
}
