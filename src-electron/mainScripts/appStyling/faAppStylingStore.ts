import ElectronStore from 'electron-store'

import { FA_APP_STYLING_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appStyling/faAppStylingStoreDefaults'
import {
  normalizePersistedRectForStorage,
  persistedFloatingWindowFramesAreEquivalent
} from 'app/src/scripts/floatingWindows/faFloatingWindowPersistedGeometry'
import type { I_faAppStylingRoot } from 'app/types/I_faAppStylingDomain'

let faAppStylingStore: ElectronStore<I_faAppStylingRoot> | null = null

/**
 * Removes unexpected top-level keys, normalizes 'css' to a string, and normalizes 'frame'.
 */
export const cleanupFaAppStyling = (store: ElectronStore<I_faAppStylingRoot>): void => {
  const raw = (store.store ?? {}) as Partial<I_faAppStylingRoot> & Record<string, unknown>
  const css = typeof raw.css === 'string' ? raw.css : ''
  const frame = normalizePersistedRectForStorage(raw.frame)

  const next: I_faAppStylingRoot = {
    css,
    frame,
    schemaVersion: 1
  }

  const unexpectedTop = Object.keys(raw).some((k) => {
    return k !== 'css' && k !== 'frame' && k !== 'schemaVersion'
  })

  const dirty =
    unexpectedTop ||
    raw.schemaVersion !== 1 ||
    typeof raw.css !== 'string' ||
    css !== (typeof raw.css === 'string' ? raw.css : '') ||
    !persistedFloatingWindowFramesAreEquivalent(raw.frame, frame)

  if (dirty) {
    store.store = next
  }
}

/**
 * Lazily creates the custom app CSS store. Call after 'app.whenReady()' so Electron 'userData' paths resolve.
 */
export const getFaAppStyling = (): ElectronStore<I_faAppStylingRoot> => {
  if (faAppStylingStore === null) {
    faAppStylingStore = new ElectronStore<I_faAppStylingRoot>({
      defaults: { ...FA_APP_STYLING_STORE_DEFAULTS },
      name: 'faAppStyling'
    })
    cleanupFaAppStyling(faAppStylingStore)
  }

  return faAppStylingStore
}
