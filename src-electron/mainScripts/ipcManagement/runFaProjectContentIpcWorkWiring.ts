import type { IpcMainInvokeEvent } from 'electron'
import type Database from 'better-sqlite3'

import { runWithFaProjectDatabaseForIpcAsync } from 'app/src-electron/mainScripts/projectManagement/projectManagement_manager'

const FA_PROJECT_CONTENT_NO_ACTIVE_DB_MESSAGE =
  '[faProjectContent] skipped — no active project database (reload or session reset may be in progress)'

/**
 * Runs project-content IPC work against the active database and returns the work result to preload.
 */
export async function runFaProjectContentIpcWork<T> (
  event: IpcMainInvokeEvent,
  work: (db: Database) => T
): Promise<T> {
  const ran = await runWithFaProjectDatabaseForIpcAsync(event, work)
  if (!ran.ok) {
    throw new Error(FA_PROJECT_CONTENT_NO_ACTIVE_DB_MESSAGE)
  }
  return ran.value
}
