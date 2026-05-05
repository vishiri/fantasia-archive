/**
 * Fantasia Archive project files (.faproject) — renderer↔main bridge contracts.
 * Main process owns SQLite, paths, and native save dialogs.
 */

export type T_faProjectCreateOutcome = 'created' | 'canceled' | 'error'

/** Payload accepted by preload when creating a new project file (display name only). */
export interface I_faProjectCreateInput {
  projectName: string
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

/**
 * Preload API for project database lifecycle (narrow surface; main validates all inputs).
 */
export interface I_faProjectManagementAPI {
  createProject: (input: I_faProjectCreateInput) => Promise<I_faProjectCreateResult>
}
