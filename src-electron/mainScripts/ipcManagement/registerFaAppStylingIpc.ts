import { ipcMain } from 'electron'

import { FA_APP_STYLING_IPC } from 'app/src-electron/electron-ipc-bridge'
import {
  cleanupFaAppStyling,
  getFaAppStyling
} from 'app/src-electron/mainScripts/appStyling/appStyling_manager'
import { parseFaAppStylingPatch } from 'app/src-electron/shared/faAppStylingPatchSchema'
import type { I_faAppStylingRoot } from 'app/types/I_faAppStylingDomain'

let registered = false

function appStylingSnapshot (): I_faAppStylingRoot {
  const s = getFaAppStyling().store
  return {
    css: s.css,
    frame: s.frame,
    schemaVersion: s.schemaVersion
  }
}

/**
 * Registers async IPC for the app styling (custom CSS) store read/write. Safe to call once from 'startApp'; subsequent calls no-op.
 */
export function registerFaAppStylingIpc (): void {
  if (registered) {
    return
  }
  registered = true

  ipcMain.handle(FA_APP_STYLING_IPC.getAsync, (): I_faAppStylingRoot => {
    return appStylingSnapshot()
  })

  ipcMain.handle(FA_APP_STYLING_IPC.setAsync, (_event, patch: unknown) => {
    const parsed = parseFaAppStylingPatch(patch)
    const store = getFaAppStyling()
    const cur = store.store
    const next: I_faAppStylingRoot = {
      css: parsed.css !== undefined ? parsed.css : cur.css,
      frame: parsed.frame !== undefined ? parsed.frame : cur.frame,
      schemaVersion: 1
    }
    store.set(next)
    cleanupFaAppStyling(store)
  })
}
