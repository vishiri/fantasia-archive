import { ipcMain } from 'electron'

import { FA_PROGRAM_STYLING_IPC } from 'app/src-electron/electron-ipc-bridge'
import {
  cleanupFaProgramStyling,
  getFaProgramStyling
} from 'app/src-electron/mainScripts/programStyling/faProgramStylingStore'
import { parseFaProgramStylingPatch } from 'app/src-electron/shared/faProgramStylingPatchSchema'
import type { I_faProgramStylingRoot } from 'app/types/I_faProgramStylingDomain'

let registered = false

function programStylingSnapshot (): I_faProgramStylingRoot {
  const s = getFaProgramStyling().store
  return {
    css: s.css,
    schemaVersion: s.schemaVersion
  }
}

/**
 * Registers async IPC for program-styling store read/write. Safe to call once from 'startApp'; subsequent calls no-op.
 */
export function registerFaProgramStylingIpc (): void {
  if (registered) {
    return
  }
  registered = true

  ipcMain.handle(FA_PROGRAM_STYLING_IPC.getAsync, (): I_faProgramStylingRoot => {
    return programStylingSnapshot()
  })

  ipcMain.handle(FA_PROGRAM_STYLING_IPC.setAsync, (_event, patch: unknown) => {
    const parsed = parseFaProgramStylingPatch(patch)
    const store = getFaProgramStyling()
    const next: I_faProgramStylingRoot = {
      css: parsed.css,
      schemaVersion: 1
    }
    store.set(next)
    cleanupFaProgramStyling(store)
  })
}
