import { ipcMain } from 'electron'

import { FA_KEYBINDS_IPC } from 'app/src-electron/electron-ipc-bridge'
import { cleanupFaKeybinds, getFaKeybinds } from 'app/src-electron/mainScripts/keybinds/faKeybindsStore'
import { parseFaKeybindsPatch } from 'app/src-electron/shared/faKeybindsPatchSchema'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsSnapshot } from 'app/types/I_faKeybindsDomain'

let registered = false

function keybindsRootSnapshot (): I_faKeybindsRoot {
  const s = getFaKeybinds().store
  const overrides = { ...s.overrides }
  const schemaVersion = s.schemaVersion
  return {
    overrides,
    schemaVersion
  }
}

/**
 * Registers async IPC for keybind store read/write. Safe to call once from 'startApp'.
 */
export function registerFaKeybindsIpc (): void {
  if (registered) {
    return
  }
  registered = true

  ipcMain.handle(FA_KEYBINDS_IPC.getAsync, (): I_faKeybindsSnapshot => {
    const platform = process.platform
    const store = keybindsRootSnapshot()
    return {
      platform,
      store
    }
  })

  ipcMain.handle(FA_KEYBINDS_IPC.setAsync, (_event, patch: unknown) => {
    const parsed = parseFaKeybindsPatch(patch)
    const current = keybindsRootSnapshot()
    const store = getFaKeybinds()

    if (parsed.replaceAllOverrides === true && parsed.overrides !== undefined) {
      const next: I_faKeybindsRoot = {
        overrides: parsed.overrides,
        schemaVersion: 1
      }
      store.set(next)
      cleanupFaKeybinds(store)
      return
    }

    const next: I_faKeybindsRoot = {
      overrides: {
        ...current.overrides,
        ...(parsed.overrides ?? {})
      },
      schemaVersion: 1
    }
    store.set(next)
    cleanupFaKeybinds(store)
  })
}
