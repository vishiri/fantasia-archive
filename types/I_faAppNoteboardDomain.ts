import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'

/**
 * Root persisted in main-process 'electron-store' ('faAppNoteboard.json').
 */
export interface I_faAppNoteboardRoot {
  frame: I_faFloatingWindowPersistedRect | null
  schemaVersion: 1
  text: string
}

/**
 * Partial update merged into the persisted root by the main-process IPC handler.
 */
export interface I_faAppNoteboardPatch {
  frame?: I_faFloatingWindowPersistedRect | null
  text?: string
}

/**
 * Preload bridge for the app noteboard store.
 */
export interface I_faAppNoteboardAPI {
  getNoteboard: () => Promise<I_faAppNoteboardRoot>
  setNoteboard: (patch: I_faAppNoteboardPatch) => Promise<void>
}
