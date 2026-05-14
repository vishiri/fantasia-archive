import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'

/**
 * Root persisted in the active project's SQLite KV table ('project_noteboard_*' keys).
 */
export interface I_faProjectNoteboardRoot {
  frame: I_faFloatingWindowPersistedRect | null
  schemaVersion: 1
  text: string
}

/**
 * Partial update merged into 'project_noteboard_*' KV rows by the main-process IPC handler.
 */
export interface I_faProjectNoteboardPatch {
  frame?: I_faFloatingWindowPersistedRect | null
  text?: string
}
