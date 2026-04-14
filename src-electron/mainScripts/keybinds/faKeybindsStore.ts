import ElectronStore from 'electron-store'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import { FA_KEYBIND_COMMAND_IDS, type T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'

let faKeybindsStore: ElectronStore<I_faKeybindsRoot> | null = null

function isFaKeybindCommandId (key: string): key is T_faKeybindCommandId {
  return (FA_KEYBIND_COMMAND_IDS as readonly string[]).includes(key)
}

/**
 * Removes unexpected top-level keys and normalizes 'overrides' to only known command ids.
 */
export const cleanupFaKeybinds = (store: ElectronStore<I_faKeybindsRoot>): void => {
  const raw = (store.store ?? {}) as Partial<I_faKeybindsRoot> & Record<string, unknown>
  const rawOverrides = raw.overrides
  const fromDisk = typeof rawOverrides === 'object' && rawOverrides !== null && !Array.isArray(rawOverrides)
    ? rawOverrides as Record<string, unknown>
    : {}

  const overrides: I_faKeybindsRoot['overrides'] = {}
  for (const id of FA_KEYBIND_COMMAND_IDS) {
    if (!Object.prototype.hasOwnProperty.call(fromDisk, id)) {
      continue
    }
    const v = fromDisk[id]
    if (v === null) {
      overrides[id] = null
    } else if (v !== undefined && typeof v === 'object' && !Array.isArray(v)) {
      overrides[id] = v as I_faKeybindsRoot['overrides'][typeof id]
    }
  }

  const next: I_faKeybindsRoot = {
    overrides,
    schemaVersion: 1
  }

  const unexpectedTop = Object.keys(raw).some((k) => k !== 'schemaVersion' && k !== 'overrides')
  const unexpectedOverrideKeys = Object.keys(fromDisk).some((k) => !isFaKeybindCommandId(k))

  if (unexpectedTop || unexpectedOverrideKeys || raw.schemaVersion !== 1) {
    store.store = next
  }
}

/**
 * Lazily creates the keybinds store. Call after 'app.whenReady()'.
 */
export const getFaKeybinds = (): ElectronStore<I_faKeybindsRoot> => {
  if (faKeybindsStore === null) {
    faKeybindsStore = new ElectronStore<I_faKeybindsRoot>({
      defaults: { ...FA_KEYBINDS_STORE_DEFAULTS },
      name: 'faKeybinds'
    })
    cleanupFaKeybinds(faKeybindsStore)
  }

  return faKeybindsStore
}
