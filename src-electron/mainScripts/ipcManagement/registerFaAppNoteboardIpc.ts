import { ipcMain } from 'electron'

import { FA_APP_NOTEBOARD_IPC } from 'app/src-electron/electron-ipc-bridge'
import {
  cleanupFaAppNoteboard,
  getFaAppNoteboard
} from 'app/src-electron/mainScripts/appNoteboard/faAppNoteboardStore'
import { parseFaAppNoteboardPatch } from 'app/src-electron/shared/faAppNoteboardPatchSchema'
import type { I_faAppNoteboardRoot } from 'app/types/I_faAppNoteboardDomain'

let registered = false

function noteboardSnapshot (): I_faAppNoteboardRoot {
  const s = getFaAppNoteboard().store
  return {
    frame: s.frame,
    schemaVersion: s.schemaVersion,
    text: s.text
  }
}

/**
 * Registers async IPC for the app note board store read/write. Safe to call once from 'startApp'; subsequent calls no-op.
 */
export function registerFaAppNoteboardIpc (): void {
  if (registered) {
    return
  }
  registered = true

  ipcMain.handle(FA_APP_NOTEBOARD_IPC.getAsync, (): I_faAppNoteboardRoot => {
    return noteboardSnapshot()
  })

  ipcMain.handle(FA_APP_NOTEBOARD_IPC.setAsync, (_event, patch: unknown) => {
    const parsed = parseFaAppNoteboardPatch(patch)
    const store = getFaAppNoteboard()
    const cur = store.store
    const next: I_faAppNoteboardRoot = {
      frame: parsed.frame !== undefined ? parsed.frame : cur.frame,
      schemaVersion: 1,
      text: parsed.text !== undefined ? parsed.text : cur.text
    }
    store.set(next)
    cleanupFaAppNoteboard(store)
  })
}
