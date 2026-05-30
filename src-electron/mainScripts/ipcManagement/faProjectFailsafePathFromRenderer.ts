import { ipcMain } from 'electron'
import type { WebContents } from 'electron'
import { randomUUID } from 'node:crypto'

import { FA_PROJECT_FAILSAFE_IPC } from 'app/src-electron/electron-ipc-bridge'
import { pathLooksLikeFaProjectFile } from 'app/src-electron/mainScripts/projectManagement/projectManagement_manager'

type T_pending = {
  resolve: (value: string | null) => void
  timeoutId: ReturnType<typeof setTimeout>
}

const pendingByCorrelationId = new Map<string, T_pending>()

let replyListenerInstalled = false

function installReplyListenerOnce (): void {
  if (replyListenerInstalled) {
    return
  }
  replyListenerInstalled = true
  ipcMain.on(
    FA_PROJECT_FAILSAFE_IPC.replyActiveProjectPathToMain,
    (_event, payload: unknown) => {
      if (typeof payload !== 'object' || payload === null) {
        return
      }
      const rec = payload as { correlationId?: unknown, filePath?: unknown }
      const id = typeof rec.correlationId === 'string' ? rec.correlationId : ''
      const entry = pendingByCorrelationId.get(id)
      if (entry === undefined) {
        return
      }
      clearTimeout(entry.timeoutId)
      pendingByCorrelationId.delete(id)
      const raw = rec.filePath
      const fp = typeof raw === 'string' ? raw.trim() : ''
      if (fp.length === 0 || !pathLooksLikeFaProjectFile(fp)) {
        entry.resolve(null)
        return
      }
      entry.resolve(fp)
    }
  )
}

/**
 * Idempotent: registers the ipcMain listener that pairs with the preload request/reply bridge.
 */
export function installFaProjectFailsafePathReplyListener (): void {
  installReplyListenerOnce()
}

export function requestRendererActiveProjectPathForFailsafe (wc: WebContents): Promise<string | null> {
  installReplyListenerOnce()
  return new Promise((resolve) => {
    const correlationId = randomUUID()
    const timeoutId = setTimeout(() => {
      const stuck = pendingByCorrelationId.get(correlationId)
      pendingByCorrelationId.delete(correlationId)
      stuck?.resolve(null)
    }, 2000)
    pendingByCorrelationId.set(correlationId, {
      resolve,
      timeoutId
    })
    wc.send(FA_PROJECT_FAILSAFE_IPC.requestActiveProjectPathFromRenderer, correlationId)
  })
}
