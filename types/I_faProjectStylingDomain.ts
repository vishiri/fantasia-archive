import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'

/**
 * Root persisted in the active project's SQLite KV table ('project_styling_*' keys).
 */
export interface I_faProjectStylingRoot {
  css: string
  frame: I_faFloatingWindowPersistedRect | null
  schemaVersion: 1
}

/**
 * Partial update merged into 'project_styling_*' KV rows by the main-process IPC handler.
 */
export interface I_faProjectStylingPatch {
  css?: string
  frame?: I_faFloatingWindowPersistedRect | null
}
