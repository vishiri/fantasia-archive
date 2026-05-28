/**
 * Project-level settings persisted in the active '.faproject' SQLite KV table.
 */

/** Root snapshot read from 'project_data' for the Project Settings dialog and store. */
export interface I_faProjectSettingsRoot {
  projectName: string
  schemaVersion: 1
}

/** Partial update merged into project settings KV rows by the main-process IPC handler. */
export interface I_faProjectSettingsPatch {
  projectName?: string
}

/** Empty fallback when no active project database is attached at IPC read time. */
export const FA_PROJECT_SETTINGS_FALLBACK_ROOT: I_faProjectSettingsRoot = {
  projectName: '',
  schemaVersion: 1
}
