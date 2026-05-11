import ElectronStore from 'electron-store'

import { FA_APP_NOTEBOARD_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appNoteboard/faAppNoteboardStoreDefaults'
import {
  normalizePersistedRectForStorage,
  persistedFloatingWindowFramesAreEquivalent
} from 'app/src/scripts/floatingWindows/faFloatingWindowPersistedGeometry'
import type { I_faAppNoteboardRoot } from 'app/types/I_faAppNoteboardDomain'

let faAppNoteboardStore: ElectronStore<I_faAppNoteboardRoot> | null = null

/**
 * Removes unexpected top-level keys and normalizes 'text' and 'frame' to the current schema.
 */
export const cleanupFaAppNoteboard = (store: ElectronStore<I_faAppNoteboardRoot>): void => {
  const raw = (store.store ?? {}) as Partial<I_faAppNoteboardRoot> & Record<string, unknown>
  const text = typeof raw.text === 'string' ? raw.text : ''
  const frame = normalizePersistedRectForStorage(raw.frame)
  const next: I_faAppNoteboardRoot = {
    frame,
    schemaVersion: 1,
    text
  }
  const unexpectedTop = Object.keys(raw).some((k) => {
    return k !== 'frame' && k !== 'schemaVersion' && k !== 'text'
  })
  const dirty =
    unexpectedTop ||
    raw.schemaVersion !== 1 ||
    typeof raw.text !== 'string' ||
    text !== (typeof raw.text === 'string' ? raw.text : '') ||
    !persistedFloatingWindowFramesAreEquivalent(raw.frame, frame)

  if (dirty) {
    store.store = next
  }
}

/**
 * Lazily creates the app noteboard store. Call after 'app.whenReady()' so Electron 'userData' paths resolve.
 */
export const getFaAppNoteboard = (): ElectronStore<I_faAppNoteboardRoot> => {
  if (faAppNoteboardStore === null) {
    faAppNoteboardStore = new ElectronStore<I_faAppNoteboardRoot>({
      defaults: { ...FA_APP_NOTEBOARD_STORE_DEFAULTS },
      name: 'faAppNoteboard'
    })
    cleanupFaAppNoteboard(faAppNoteboardStore)
  }

  return faAppNoteboardStore
}
