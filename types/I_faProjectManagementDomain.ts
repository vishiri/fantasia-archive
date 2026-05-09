import type { I_faRecentProjectEntry } from 'app/types/I_faRecentProjectsDomain'

/**
 * Fantasia Archive project files (.faproject) — renderer↔main bridge contracts.
 * Main process owns SQLite, paths, and native save dialogs.
 */

/**
 * `I_faProjectOpenResult.errorName` when the selected file is the same logical project as the one already active (matching SQLite `project_uuid`).
 */
export const FA_PROJECT_OPEN_ERROR_NAME_ALREADY_ACTIVE = 'ProjectAlreadyOpen' as const

export type T_faProjectCreateOutcome = 'created' | 'canceled' | 'error'

export type T_faProjectOpenOutcome = 'opened' | 'canceled' | 'error'

/** Payload accepted by preload when creating a new project file (display name only). */
export interface I_faProjectCreateInput {
  projectName: string
}

/** Optional absolute path for open; omit or empty object uses the native file picker. */
export interface I_faProjectOpenInput {
  filePath?: string
}

/** Snapshot returned when a project file is opened and initialized in main. */
export interface I_faProjectManagementActiveSnapshot {
  filePath: string
  id: string
  name: string
}

export interface I_faProjectCreateResult {
  errorMessage?: string
  errorName?: string
  outcome: T_faProjectCreateOutcome
  project?: I_faProjectManagementActiveSnapshot
}

export interface I_faProjectOpenResult {
  /**
   * When outcome is 'error' after a concrete file was chosen, the absolute path that failed to open.
   */
  attemptedFilePath?: string
  errorMessage?: string
  errorName?: string
  outcome: T_faProjectOpenOutcome
  project?: I_faProjectManagementActiveSnapshot
}

/**
 * Preload API for project database lifecycle (narrow surface; main validates all inputs).
 */
export interface I_faProjectManagementAPI {
  createProject: (input: I_faProjectCreateInput) => Promise<I_faProjectCreateResult>
  getRecentProjects: () => Promise<I_faRecentProjectEntry[]>
  openProject: (input?: I_faProjectOpenInput) => Promise<I_faProjectOpenResult>
}
