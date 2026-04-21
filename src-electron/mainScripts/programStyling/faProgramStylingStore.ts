import ElectronStore from 'electron-store'

import { FA_PROGRAM_STYLING_STORE_DEFAULTS } from 'app/src-electron/mainScripts/programStyling/faProgramStylingStoreDefaults'
import type { I_faProgramStylingRoot } from 'app/types/I_faProgramStylingDomain'

let faProgramStylingStore: ElectronStore<I_faProgramStylingRoot> | null = null

/**
 * Removes unexpected top-level keys, normalizes 'css' to a string, and clamps the persisted shape to the current schema.
 */
export const cleanupFaProgramStyling = (store: ElectronStore<I_faProgramStylingRoot>): void => {
  const raw = (store.store ?? {}) as Partial<I_faProgramStylingRoot> & Record<string, unknown>
  const css = typeof raw.css === 'string' ? raw.css : ''

  const next: I_faProgramStylingRoot = {
    css,
    schemaVersion: 1
  }

  const unexpectedTop = Object.keys(raw).some((k) => k !== 'css' && k !== 'schemaVersion')

  if (unexpectedTop || raw.schemaVersion !== 1 || typeof raw.css !== 'string') {
    store.store = next
  }
}

/**
 * Lazily creates the program styling store. Call after 'app.whenReady()' so Electron 'userData' paths resolve.
 */
export const getFaProgramStyling = (): ElectronStore<I_faProgramStylingRoot> => {
  if (faProgramStylingStore === null) {
    faProgramStylingStore = new ElectronStore<I_faProgramStylingRoot>({
      defaults: { ...FA_PROGRAM_STYLING_STORE_DEFAULTS },
      name: 'faProgramStyling'
    })
    cleanupFaProgramStyling(faProgramStylingStore)
  }

  return faProgramStylingStore
}
