/**
 * Workspace sidebar width persisted in the active project's SQLite KV row 'sidebar_width'.
 */
export const FA_PROJECT_SIDEBAR_MIN_WIDTH_PX = 375

export const FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX = 375

export interface I_faProjectSidebarRoot {
  schemaVersion: 1
  widthPx: number
}

/**
 * Partial update merged into 'sidebar_width' by the main-process IPC handler.
 */
export interface I_faProjectSidebarPatch {
  widthPx?: number | undefined
}
